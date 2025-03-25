import { ClassData } from "../store/gradeStore";
const CUTOFF_A = 89.45;
const CUTOFF_B = 79.45;
const CUTOFF_C = 69.45;
const CUTOFF_D = 59.45;
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

  // Group assignments by weight
  const weightGroups: {
    [key: number]: {
      totalEarned: number;
      totalPossible: number;
      weight: number;
    };
  } = {};

  classData.assignments.forEach((assignment) => {
    const weight = assignment.weight;
    if (!weightGroups[weight]) {
      weightGroups[weight] = {
        totalEarned: 0,
        totalPossible: 0,
        weight: weight,
      };
    }
    weightGroups[weight].totalEarned += assignment.earnedScore;
    weightGroups[weight].totalPossible += assignment.totalScore;
  });

  const totalWeight = Object.values(weightGroups).reduce(
    (sum, group) => sum + group.weight,
    0
  );

  // If there are no weights (shouldn't happen with proper data), return 0
  if (totalWeight === 0) {
    return 0;
  }

  const weightedScore = Object.values(weightGroups).reduce((sum, group) => {
    // Handle case where totalPossible is 0 to avoid division by zero
    if (group.totalPossible === 0) return sum;
    return sum + (group.totalEarned / group.totalPossible) * group.weight;
  }, 0);

  // Round to 2 decimal places
  return Math.round((weightedScore / totalWeight) * 10000) / 100;
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
