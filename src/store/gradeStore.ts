import { create } from "zustand";
import { persist } from "zustand/middleware";
import { parseRawText } from "../utils/textParser";

export interface Assignment {
  id: string;
  name: string;
  date: string;
  weight: number;
  earnedScore: number;
  totalScore: number;
}

export interface ClassData {
  id: string;
  name: string;
  assignments: Assignment[];
  lastVisited?: number;
}

interface GradeStore {
  classes: ClassData[];
  addClass: (rawText: string) => void;
  updateClass: (id: string, data: Partial<ClassData>) => void;
  deleteClass: (id: string) => void;
  updateAssignment: (
    classId: string,
    assignmentId: string,
    updates: Partial<Assignment>
  ) => void;
  addAssignment: (classId: string, assignment: Omit<Assignment, "id">) => void;
  setRawData: (data: string) => void;
  setLastVisited: (classId: string) => void;
  lastVisited: string | null;
  availableWeights: number[];
  addWeight: (weight: number) => void;
}

export const useGradeStore = create<GradeStore>()(
  persist(
    (set) => ({
      classes: [],
      lastVisited: null,
      availableWeights: [],
      addClass: (rawText: string) => {
        const newClass = parseRawText(rawText);
        set((state) => ({
          classes: [...state.classes, newClass],
        }));
      },
      updateClass: (id, data) =>
        set((state) => ({
          classes: state.classes.map((cls) =>
            cls.id === id ? { ...cls, ...data } : cls
          ),
        })),
      deleteClass: (id) =>
        set((state) => ({
          classes: state.classes.filter((cls) => cls.id !== id),
        })),
      updateAssignment: (classId, assignmentId, updates) =>
        set((state) => ({
          classes: state.classes.map((cls) =>
            cls.id === classId
              ? {
                  ...cls,
                  assignments: cls.assignments.map((assignment) =>
                    assignment.id === assignmentId
                      ? { ...assignment, ...updates }
                      : assignment
                  ),
                }
              : cls
          ),
        })),
      addAssignment: (classId, assignment) =>
        set((state) => ({
          classes: state.classes.map((cls) =>
            cls.id === classId
              ? {
                  ...cls,
                  assignments: [
                    ...cls.assignments,
                    {
                      ...assignment,
                      id: `${classId}-${cls.assignments.length}`,
                    },
                  ],
                }
              : cls
          ),
        })),
      setRawData: (data: string) => {
        const classes = data.split("\n\n\n").filter(Boolean).map(parseRawText);
        set({ classes });
      },
      setLastVisited: (classId: string) =>
        set(() => ({
          lastVisited: classId,
        })),
      addWeight: (weight: number) =>
        set((state) => ({
          availableWeights: state.availableWeights.includes(weight)
            ? state.availableWeights
            : [...state.availableWeights, weight].sort((a, b) => a - b),
        })),
    }),
    {
      name: "grade-storage",
    }
  )
);
