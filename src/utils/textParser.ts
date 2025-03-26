import { Assignment, ClassData } from "../store/gradeStore";

/**
 * Converts a weight string into a numeric value
 */
function convertWeight(weightStr: string): number {
  if (weightStr.includes("All Tasks / Assessments")) return 90;
  if (weightStr.includes("Practice / Preparation")) return 10;
  return 0;
}

/**
 * Determines the appropriate year for a date that only includes month and day
 * If the date has already passed this year, use the current year
 * If the date has not passed yet, use the current year
 * This handles both cases where the year is provided or not
 */
function determineYear(dateString: string): string {
  // Check if date already includes a year (like "MAR 25, 2025" or "3/25/2025")
  if (dateString.match(/\d{4}$/)) {
    return dateString; // Already has a year
  }

  // Date doesn't have a year, so add the appropriate one
  const now = new Date();
  const currentYear = now.getFullYear();

  // Parse the month and day from the date string
  // Handle formats like "MAR 25" or "3/25"
  let month, day;

  // Check if the date is in the format "MON DD"
  const monthNameMatch = dateString.match(/^([A-Za-z]{3})\s+(\d{1,2})$/);
  if (monthNameMatch) {
    const monthNames = [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
    ];
    month = monthNames.indexOf(monthNameMatch[1].toUpperCase());
    day = parseInt(monthNameMatch[2]);
  }
  // Check if the date is in the format "M/D" or "MM/DD"
  else {
    const parts = dateString.split(/[\/\-]/);
    if (parts.length >= 2) {
      month = parseInt(parts[0]) - 1; // JavaScript months are 0-based
      day = parseInt(parts[1]);
    } else {
      // If we can't parse the date, return the current year
      return `${dateString}, ${currentYear}`;
    }
  }

  // Create date objects for comparison
  const inputDate = new Date(currentYear, month, day);

  // If the date has already passed this year, use the current year
  // If the date hasn't passed yet, still use the current year
  return `${dateString}, ${currentYear}`;
}

// Global variable to store deleted data for modal display
let lastDeletedData: string = "";

// Getter function to access the deleted data
export function getLastDeletedData(): string {
  return lastDeletedData;
}

export function parseRawText(rawText: string): ClassData {
  // Case-insensitive search for Grade Book
  const gradeBookIndex = rawText.toLowerCase().indexOf("grade book");

  // Extract and store any text that appears before "Grade Book"
  if (gradeBookIndex > 0) {
    lastDeletedData = rawText.substring(0, gradeBookIndex).trim();
  } else {
    lastDeletedData = "";
  }

  if (gradeBookIndex === -1) {
    console.error("Could not find 'Grade Book' in raw text");
    return {
      id: Date.now().toString(),
      name: "Unknown Class",
      assignments: [],
    };
  }

  // Extract from the raw text directly instead of cleaned text
  const lines = rawText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line);
  const gradeBookLineIndex = lines.findIndex((line) =>
    line.toLowerCase().includes("grade book")
  );

  // The class name should be the line immediately after "Grade Book"
  const className =
    gradeBookLineIndex >= 0 && gradeBookLineIndex + 2 < lines.length
      ? lines[gradeBookLineIndex + 2]
      : "Unknown Class";

  console.log("Found class name:", className);

  const cleanedText = rawText.slice(gradeBookIndex + 11, -1);
  const classData: ClassData = {
    id: Date.now().toString(),
    name: className,
    assignments: [],
  };

  // For debugging
  console.log("Raw text first 100 chars:", rawText.substring(0, 100));
  console.log("Grade Book index:", gradeBookIndex);
  console.log("Grade Book line index:", gradeBookLineIndex);
  console.log("First few lines:", lines.slice(0, 5));

  let content: string[];
  if (cleanedText.includes("Show Done")) {
    content = cleanedText
      .slice(
        cleanedText.indexOf("total items") + 12,
        cleanedText.lastIndexOf("Outline") - 1
      )
      .split("\n");
  } else {
    content = cleanedText
      .slice(cleanedText.indexOf("Assignments", 0) + 12)
      .split("\n");
  }

  // Find assignment locators
  const locators: number[] = [];
  for (let i in content) {
    if (content[i]) {
      if (
        content[i].includes("Practice / Preparation") ||
        content[i].includes("All Tasks / Assessments")
      ) {
        locators.push(Number(i));
      }
    }
  }

  // Process assignments
  let assignmentIndex = 0;
  for (const x of locators) {
    let score: number, total: number;
    let date: string, name: string, weight: number;

    if (cleanedText.includes("Show Done")) {
      const scoreStr = content[x + 1];
      const totalStr = content[x].split(" | ")[1].replace(" points", "").trim();
      score = Number(scoreStr);
      total = Number(totalStr);
      date = `${content[x - 3]} ${content[x - 2]}`;
      date = determineYear(date); // Add appropriate year
      name = content[x - 1];
      weight = convertWeight(content[x].split(" | ")[0]);
    } else {
      const scoreStr = content[x + 1].split(" out of ")[0];
      const totalStr = content[x + 1].split(" out of ")[1];
      score = Number(scoreStr);
      total = Number(totalStr);
      date = content[x - 2].replace("\t", "");
      date = determineYear(date); // Add appropriate year
      name = content[x - 1];
      weight = convertWeight(content[x].replace("\t0\t", ""));
    }

    // Only add valid assignments
    if (!isNaN(score) && !isNaN(total)) {
      const assignment: Assignment = {
        id: `${classData.id}-${assignmentIndex++}`,
        name,
        date,
        weight,
        earnedScore: score,
        totalScore: total,
      };
      classData.assignments.push(assignment);
    } else {
      console.error(
        `Invalid Score or Total for assignment "${name}": Score=${score}, Total=${total}`
      );
    }
  }

  // Reverse assignments to maintain chronological order
  classData.assignments = classData.assignments.reverse();

  return classData;
}
