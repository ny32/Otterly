import { Assignment, ClassData } from "../store/gradeStore";

function convertWeight(weightStr: string): number {
  if (weightStr.includes("All Tasks / Assessments")) return 90;
  if (weightStr.includes("Practice / Preparation")) return 10;
  return 0;
}

export function parseRawText(rawText: string): ClassData {
  const cleanedText = rawText.slice(rawText.indexOf("Grade Book") + 11, -1);
  const classData: ClassData = {
    id: Date.now().toString(),
    name: "",
    assignments: [],
  };

  // Extract class name from headers
  const headers = cleanedText.slice(0, cleanedText.indexOf("total items") + 11);
  classData.name = headers.split("\n")[1];

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
      name = content[x - 1];
      weight = convertWeight(content[x].split(" | ")[0]);
    } else {
      const scoreStr = content[x + 1].split(" out of ")[0];
      const totalStr = content[x + 1].split(" out of ")[1];
      score = Number(scoreStr);
      total = Number(totalStr);
      date = content[x - 2].replace("\t", "");
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
