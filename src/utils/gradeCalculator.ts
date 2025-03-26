import { ClassData } from "../store/gradeStore";
const CUTOFF_A = 89.45;
const CUTOFF_B = 79.45;
const CUTOFF_C = 69.45;
const CUTOFF_D = 59.45;

// Convert a potentially string value to a number safely
export const safeNumber = (value: number | string): number => {
  if (typeof value === "string") {
    const parsed = Number(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return value;
};

/**
 * Calculates the weighted grade for a class based on assignment weights
 * @param classData The class data containing assignments
 * @returns The calculated grade percentage rounded to 2 decimal places
 */
export const calculateGrade = (classData: ClassData): number => {
  if (
    !classData ||
    !classData.assignments ||
    classData.assignments.length === 0
  ) {
    return 0;
  }

  let totalWeightedScore = 0;
  let totalWeight = 0;

  const weightGroups: { [key: number]: { earned: number; total: number } } = {};

  // Group assignments by weight
  classData.assignments.forEach((assignment) => {
    const weight = assignment.weight;
    const earnedScore = safeNumber(assignment.earnedScore);
    const totalScore = safeNumber(assignment.totalScore);

    if (!weightGroups[weight]) {
      weightGroups[weight] = { earned: 0, total: 0 };
    }

    weightGroups[weight].earned += earnedScore;
    weightGroups[weight].total += totalScore;
  });

  // Calculate grade based on weight groups
  Object.entries(weightGroups).forEach(([weight, scores]) => {
    const weightNum = Number(weight);
    if (scores.total > 0) {
      const percentage = (scores.earned / scores.total) * 100;
      totalWeightedScore += percentage * weightNum;
      totalWeight += weightNum;
    }
  });

  return totalWeight === 0 ? 0 : totalWeightedScore / totalWeight;
};

/**
 * Returns the letter grade based on percentage
 * @param percentage The grade percentage
 * @returns The corresponding letter grade
 */
export const getLetterGrade = (percentage: number): string => {
  if (percentage >= CUTOFF_A) return "A";
  if (percentage >= CUTOFF_B) return "B";
  if (percentage >= CUTOFF_C) return "C";
  if (percentage >= CUTOFF_D) return "D";
  return "E";
};

/**
 * Calculates the GPA value based on percentage
 * @param percentage The grade percentage
 * @returns The corresponding GPA value
 */
export const calculateGPA = (percentage: number): number => {
  if (percentage >= CUTOFF_A) return 4.0;
  if (percentage >= CUTOFF_B) return 3.0;
  if (percentage >= CUTOFF_C) return 2.0;
  if (percentage >= CUTOFF_D) return 1.0;
  return 0.0;
};
