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

interface HistoryState {
  [classId: string]: {
    past: ClassData[];
    present: ClassData;
    future: ClassData[];
  };
}

interface GradeStore {
  classes: ClassData[];
  history: HistoryState;
  lastVisited: string | null;
  availableWeights: number[];
  addClass: (rawText: string) => void;
  updateClass: (id: string, data: Partial<ClassData>) => void;
  deleteClass: (id: string) => void;
  updateAssignment: (
    classId: string,
    assignmentId: string,
    updates: Partial<Assignment>
  ) => void;
  deleteAssignment: (classId: string, assignmentId: string) => void;
  addAssignment: (classId: string, assignment: Omit<Assignment, "id">) => void;
  setRawData: (data: string) => void;
  setLastVisited: (classId: string) => void;
  addWeight: (weight: number) => void;
  undo: (classId: string) => void;
  redo: (classId: string) => void;
  initializeHistory: (classId: string) => void;
}

const MAX_HISTORY = 50;

export const useGradeStore = create<GradeStore>()(
  persist(
    (set, get) => ({
      classes: [],
      history: {},
      lastVisited: null,
      availableWeights: [],

      initializeHistory: (classId: string) => {
        const { classes, history } = get();
        const currentClass = classes.find((cls) => cls.id === classId);
        if (currentClass && !history[classId]) {
          set((state) => ({
            history: {
              ...state.history,
              [classId]: {
                past: [],
                present: currentClass,
                future: [],
              },
            },
          }));
        }
      },

      // Helper function to save state to history
      _saveToHistory: (classId: string, newClass: ClassData) => {
        const { history } = get();
        const classHistory = history[classId] || {
          past: [],
          present: newClass,
          future: [],
        };

        set((state) => ({
          classes: state.classes.map((cls) =>
            cls.id === classId ? newClass : cls
          ),
          history: {
            ...state.history,
            [classId]: {
              past: [
                ...classHistory.past.slice(-MAX_HISTORY),
                classHistory.present,
              ],
              present: newClass,
              future: [],
            },
          },
        }));
      },

      addClass: (rawText: string) => {
        const newClass = parseRawText(rawText);
        set((state) => ({
          classes: [...state.classes, newClass],
        }));
      },

      updateClass: (id, data) => {
        const { _saveToHistory } = get() as any;
        const currentClass = get().classes.find((cls) => cls.id === id);
        if (currentClass) {
          const updatedClass = { ...currentClass, ...data };
          _saveToHistory(id, updatedClass);
        }
      },

      deleteClass: (id) => {
        set((state) => ({
          classes: state.classes.filter((cls) => cls.id !== id),
          history: Object.fromEntries(
            Object.entries(state.history).filter(([classId]) => classId !== id)
          ),
        }));
      },

      updateAssignment: (classId, assignmentId, updates) => {
        const { _saveToHistory } = get() as any;
        const currentClass = get().classes.find((cls) => cls.id === classId);
        if (currentClass) {
          const updatedClass = {
            ...currentClass,
            assignments: currentClass.assignments.map((assignment) =>
              assignment.id === assignmentId
                ? { ...assignment, ...updates }
                : assignment
            ),
          };
          _saveToHistory(classId, updatedClass);
        }
      },

      deleteAssignment: (classId, assignmentId) => {
        const { _saveToHistory } = get() as any;
        const currentClass = get().classes.find((cls) => cls.id === classId);
        if (currentClass) {
          const updatedClass = {
            ...currentClass,
            assignments: currentClass.assignments.filter(
              (assignment) => assignment.id !== assignmentId
            ),
          };
          _saveToHistory(classId, updatedClass);
        }
      },

      addAssignment: (classId, assignment) => {
        const { _saveToHistory } = get() as any;
        const currentClass = get().classes.find((cls) => cls.id === classId);
        if (currentClass) {
          const updatedClass = {
            ...currentClass,
            assignments: [
              ...currentClass.assignments,
              {
                ...assignment,
                id: `${classId}-${currentClass.assignments.length}`,
              },
            ],
          };
          _saveToHistory(classId, updatedClass);
        }
      },

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
          availableWeights: [...new Set([...state.availableWeights, weight])],
        })),

      undo: (classId: string) => {
        const { history } = get();
        const classHistory = history[classId];
        if (!classHistory || classHistory.past.length === 0) return;

        const previous = classHistory.past[classHistory.past.length - 1];
        const newPast = classHistory.past.slice(0, -1);

        set((state) => ({
          classes: state.classes.map((cls) =>
            cls.id === classId ? previous : cls
          ),
          history: {
            ...state.history,
            [classId]: {
              past: newPast,
              present: previous,
              future: [classHistory.present, ...classHistory.future],
            },
          },
        }));
      },

      redo: (classId: string) => {
        const { history } = get();
        const classHistory = history[classId];
        if (!classHistory || classHistory.future.length === 0) return;

        const next = classHistory.future[0];
        const newFuture = classHistory.future.slice(1);

        set((state) => ({
          classes: state.classes.map((cls) =>
            cls.id === classId ? next : cls
          ),
          history: {
            ...state.history,
            [classId]: {
              past: [...classHistory.past, classHistory.present],
              present: next,
              future: newFuture,
            },
          },
        }));
      },
    }),
    {
      name: "grade-store",
    }
  )
);
