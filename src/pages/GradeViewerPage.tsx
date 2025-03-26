import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGradeStore } from "../store/gradeStore";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  ArrowLeft,
  Plus,
  RotateCcw,
  RotateCw,
  Trash2,
  RefreshCw,
  Pencil,
} from "lucide-react";
import { useTheme } from "../components/theme-provider";
import { WeightInput } from "../components/ui/weight-input";
import { calculateGrade, getLetterGrade } from "../utils/gradeCalculator";

const GradeViewerPage: React.FC = () => {
  // ----- STATE AND HOOKS SECTION -----
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const {
    classes,
    updateAssignment,
    updateClass,
    setLastVisited,
    availableWeights,
    addWeight,
    addAssignment,
    deleteAssignment,
    undo,
    redo,
    initializeHistory,
    history,
    restoreOriginalClass,
    originalClasses,
  } = useGradeStore();
  const { theme } = useTheme();
  const [editingField, setEditingField] = useState<{
    assignmentId: string;
    field: "name" | "date" | "weight" | "earnedScore" | "totalScore";
  } | null>(null);
  const [isEditingClassName, setIsEditingClassName] = useState(false);
  const currentClass = classes.find((cls) => cls.id === classId);

  // ----- EFFECTS SECTION -----
  useEffect(() => {
    if (classId) {
      setLastVisited(classId);
      initializeHistory(classId);
    }
  }, [classId, setLastVisited, initializeHistory]);

  // Render nothing if no current class (will redirect in effect)
  if (!currentClass) {
    navigate("/");
    return null;
  }

  // ----- CALCULATION FUNCTIONS SECTION -----
  const getProgressColor = (percentage: number): string => {
    if (percentage >= 85) return "#24a158";
    if (percentage >= 60) return "#f2c94c";
    return "#CA0B00";
  };

  const formatDate = (dateString: string) => {
    try {
      // First check if the date already includes a year with comma format like "MAR 25, 2024"
      const commaMatch = dateString.match(
        /^([A-Za-z]{3})\s+(\d{1,2}),\s+(\d{4})$/
      );
      if (commaMatch) {
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
        const month = monthNames.indexOf(commaMatch[1].toUpperCase());
        const day = parseInt(commaMatch[2]);
        const year = parseInt(commaMatch[3]);
        if (month >= 0) {
          const date = new Date(year, month, day);
          return date.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          });
        }
      }

      // Handle normal date formats
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        });
      }

      // If we can't parse it, return the original string
      return dateString;
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  const getCurrentClassWeights = () => {
    // Get unique weights from current class
    const classWeights = new Set(currentClass.assignments.map((a) => a.weight));
    // Combine with global available weights
    const allWeights = new Set([...classWeights, ...availableWeights]);
    return [...allWeights].sort((a, b) => a - b);
  };

  // Helper function to safely convert score values to numbers
  const safeNumber = (value: number | string): number => {
    if (typeof value === "string") {
      const parsed = Number(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return value || 0;
  };

  // ----- EVENT HANDLERS SECTION -----
  const handleFieldClick = (
    assignmentId: string,
    field: "name" | "date" | "weight" | "earnedScore" | "totalScore"
  ) => {
    setEditingField({ assignmentId, field });
  };

  const handleFieldBlur = () => {
    if (editingField) {
      const assignment = currentClass.assignments.find(
        (a) => a.id === editingField.assignmentId
      );
      if (assignment) {
        // Only validate and convert to default values on blur, not during typing
        if (
          editingField.field === "earnedScore" ||
          editingField.field === "totalScore"
        ) {
          const fieldName = editingField.field;
          const currentValue = assignment[fieldName];

          // If the value is empty or NaN on blur, set it to 0
          if (currentValue === "" || isNaN(Number(currentValue))) {
            updateAssignment(classId, editingField.assignmentId, {
              [fieldName]: 0,
            });
          }
        }
      }
    }
    setEditingField(null);
  };

  const handleFieldChange = (
    assignmentId: string,
    field: "name" | "date" | "weight" | "earnedScore" | "totalScore",
    value: string
  ) => {
    if (!classId) return;

    if (field === "earnedScore" || field === "totalScore") {
      // Allow empty strings during editing
      updateAssignment(classId, assignmentId, {
        [field]: value === "" ? "" : Number(value),
      });
    } else if (field === "weight") {
      const numValue = Number(value);
      if (!isNaN(numValue)) {
        updateAssignment(classId, assignmentId, {
          weight: numValue,
        });
      }
    } else {
      updateAssignment(classId, assignmentId, {
        [field]: value,
      });
    }
  };

  const handleClassNameClick = () => {
    setIsEditingClassName(true);
  };

  const handleClassNameBlur = () => {
    setIsEditingClassName(false);
  };

  const handleClassNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!classId) return;
    updateClass(classId, { name: e.target.value });
  };

  // ----- ADD ASSIGNMENT HANDLER -----
  const handleAddAssignment = () => {
    if (!classId) return;

    const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD

    // Get a smart default weight from existing assignments instead of always using 100%
    let defaultWeight = 100;

    // First try to use the most common weight in the current class
    if (currentClass.assignments.length > 0) {
      // Count frequency of weights in current class
      const weightCounts = currentClass.assignments.reduce(
        (counts, assignment) => {
          counts[assignment.weight] = (counts[assignment.weight] || 0) + 1;
          return counts;
        },
        {} as Record<number, number>
      );

      // Find the most common weight
      let maxCount = 0;
      let mostCommonWeight = 0;

      Object.entries(weightCounts).forEach(([weight, count]) => {
        if (count > maxCount) {
          maxCount = count;
          mostCommonWeight = Number(weight);
        }
      });

      if (mostCommonWeight > 0) {
        defaultWeight = mostCommonWeight;
      }
    }

    // If no assignments or couldn't determine most common weight,
    // then check available weights
    if (defaultWeight === 100 && availableWeights.length > 0) {
      defaultWeight = availableWeights[0];
    }

    addAssignment(classId, {
      name: "New Assignment",
      date: today,
      weight: defaultWeight,
      earnedScore: 0,
      totalScore: 100,
    });
  };

  // Add handler for deleting assignment
  const handleDeleteAssignment = (assignmentId: string) => {
    if (!classId) return;
    deleteAssignment(classId, assignmentId);
  };

  // Add this function near the other handlers
  const handleClearWeights = () => {
    // Get weights currently in use by this class
    const weightsInUse = new Set(currentClass.assignments.map((a) => a.weight));
    // Update the store with only the weights in use
    useGradeStore.setState((state) => ({
      ...state,
      availableWeights: [...weightsInUse],
    }));
  };

  // Handle restore to original state
  const handleRestore = () => {
    if (!classId) return;
    restoreOriginalClass(classId);
  };

  // Check if there are changes to restore (only enable button if changes exist)
  const hasChangesToRestore = () => {
    if (!originalClasses || !originalClasses[classId] || !currentClass)
      return false;

    const originalClass = originalClasses[classId];

    // Compare assignments count
    if (originalClass.assignments.length !== currentClass.assignments.length)
      return true;

    // Compare class name
    if (originalClass.name !== currentClass.name) return true;

    // Compare assignments (deep comparison)
    for (let i = 0; i < originalClass.assignments.length; i++) {
      const origAssignment = originalClass.assignments[i];
      const currAssignment = currentClass.assignments[i];

      // Check if any field differs
      if (
        origAssignment.name !== currAssignment.name ||
        origAssignment.date !== currAssignment.date ||
        origAssignment.weight !== currAssignment.weight ||
        safeNumber(origAssignment.earnedScore) !==
          safeNumber(currAssignment.earnedScore) ||
        safeNumber(origAssignment.totalScore) !==
          safeNumber(currAssignment.totalScore)
      ) {
        return true;
      }
    }

    return false;
  };

  const canRestore = hasChangesToRestore();

  // ----- COMPUTED VALUES SECTION -----
  const grade = calculateGrade(currentClass);
  const letterGrade = getLetterGrade(grade);
  const progressColor = getProgressColor(grade);
  const emptyRingColor = theme === "dark" ? "#2d2d2d" : "#e5e7eb";

  // ----- RENDER SECTION -----
  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 mb-0 pb-0">
      <div className="flex items-center mb-6">
        <div className="flex-none">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 px-2 sm:px-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm sm:text-base">Back to Dashboard</span>
          </Button>
        </div>
        <div className="flex-grow text-center">
          {isEditingClassName ? (
            <input
              type="text"
              value={currentClass.name}
              onChange={handleClassNameChange}
              onBlur={handleClassNameBlur}
              className="text-2xl sm:text-3xl font-bold bg-transparent border-b border-primary focus:outline-none max-w-full mx-auto"
              autoFocus
            />
          ) : (
            <div
              className="group inline-flex items-center cursor-pointer mx-auto"
              onClick={handleClassNameClick}
            >
              <h1 className="text-2xl sm:text-3xl font-bold hover:text-primary truncate px-2">
                {currentClass.name}
              </h1>
              <Pencil className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
            </div>
          )}
        </div>
        <div className="flex-none w-[120px] sm:w-[160px]"></div>
      </div>

      <div className="flex justify-center mb-8">
        <div className="relative w-36 h-36 sm:w-48 sm:h-48">
          <svg className="w-full h-full" viewBox="0 0 36 36">
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={emptyRingColor}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={progressColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={`${grade}, 100`}
              className="transition-colors duration-300"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="flex flex-col items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-background">
              <div className="text-2xl sm:text-4xl font-bold">
                {grade.toFixed(2)}%
              </div>
              <div className="text-xl sm:text-2xl font-semibold">
                {letterGrade}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-4 relative">
        <div className="absolute w-full -top-12 flex justify-between">
          {/* Restore button on left */}
          <Button
            variant="secondary"
            onClick={handleRestore}
            disabled={!canRestore}
            className={`h-8 px-3 transition-all flex items-center gap-1 ${
              theme === "dark"
                ? "bg-blue-700/50 hover:bg-blue-600 hover:scale-110"
                : "bg-blue-300/70 hover:bg-blue-400 hover:scale-110 shadow-sm"
            }`}
            title="Restore to original state"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="text-xs">Restore</span>
          </Button>

          {/* Undo/Redo buttons on right */}
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="icon"
              onClick={() => undo(classId)}
              disabled={!history[classId]?.past?.length}
              className={`h-8 w-8 transition-all ${
                theme === "dark"
                  ? "bg-slate-700/50 hover:bg-slate-600 hover:scale-110"
                  : "bg-slate-300/70 hover:bg-slate-400 hover:scale-110 shadow-sm"
              }`}
              title="Undo"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => redo(classId)}
              disabled={!history[classId]?.future?.length}
              className={`h-8 w-8 transition-all ${
                theme === "dark"
                  ? "bg-slate-700/50 hover:bg-slate-600 hover:scale-110"
                  : "bg-slate-300/70 hover:bg-slate-400 hover:scale-110 shadow-sm"
              }`}
              title="Redo"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {currentClass.assignments.map((assignment) => {
          const assignmentGrade =
            Math.round(
              (safeNumber(assignment.earnedScore) /
                safeNumber(assignment.totalScore)) *
                10000
            ) / 100;
          const assignmentLetterGrade = getLetterGrade(assignmentGrade);
          const assignmentProgressColor = getProgressColor(assignmentGrade);

          return (
            <Card key={assignment.id} className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteAssignment(assignment.id)}
                className="absolute right-2 top-2 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      {editingField?.assignmentId === assignment.id &&
                      editingField.field === "name" ? (
                        <input
                          type="text"
                          value={assignment.name}
                          onChange={(e) =>
                            handleFieldChange(
                              assignment.id,
                              "name",
                              e.target.value
                            )
                          }
                          onBlur={handleFieldBlur}
                          className="text-lg sm:text-xl font-medium bg-transparent border-b border-primary focus:outline-none w-full"
                          autoFocus
                        />
                      ) : (
                        <div
                          className="group inline-flex items-center cursor-pointer"
                          onClick={() =>
                            handleFieldClick(assignment.id, "name")
                          }
                        >
                          <h3 className="text-lg sm:text-xl font-medium hover:text-primary break-words pr-2">
                            {assignment.name}
                          </h3>
                          <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </div>

                    <div className="relative w-20 h-20 ml-4 mt-8">
                      <svg className="w-full h-full" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke={emptyRingColor}
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke={assignmentProgressColor}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeDasharray={`${assignmentGrade}, 100`}
                          className="transition-colors duration-300"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="flex flex-col items-center justify-center w-12 h-12 rounded-full bg-background">
                          {editingField?.assignmentId === assignment.id &&
                          editingField.field === "earnedScore" ? (
                            <input
                              type="number"
                              value={
                                typeof assignment.earnedScore === "string" &&
                                assignment.earnedScore === ""
                                  ? ""
                                  : assignment.earnedScore === 0
                                  ? "0"
                                  : assignment.earnedScore
                              }
                              onChange={(e) =>
                                handleFieldChange(
                                  assignment.id,
                                  "earnedScore",
                                  e.target.value
                                )
                              }
                              onBlur={handleFieldBlur}
                              className="text-sm font-medium bg-transparent border-b border-primary focus:outline-none w-16 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              autoFocus
                            />
                          ) : (
                            <div
                              className="group text-center text-sm font-medium cursor-pointer hover:text-primary w-full"
                              onClick={() =>
                                handleFieldClick(assignment.id, "earnedScore")
                              }
                            >
                              <div className="relative inline-block">
                                {assignment.earnedScore}
                                <Pencil className="h-2 w-2 opacity-0 group-hover:opacity-100 transition-opacity absolute -right-3 top-1" />
                              </div>
                            </div>
                          )}
                          <div className="w-4 h-[1px] bg-gray-400 dark:bg-gray-600 my-0.5"></div>
                          {editingField?.assignmentId === assignment.id &&
                          editingField.field === "totalScore" ? (
                            <input
                              type="number"
                              value={
                                typeof assignment.totalScore === "string" &&
                                assignment.totalScore === ""
                                  ? ""
                                  : assignment.totalScore === 0
                                  ? "0"
                                  : assignment.totalScore
                              }
                              onChange={(e) =>
                                handleFieldChange(
                                  assignment.id,
                                  "totalScore",
                                  e.target.value
                                )
                              }
                              onBlur={handleFieldBlur}
                              className="text-sm font-medium bg-transparent border-b border-primary focus:outline-none w-16 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              autoFocus
                            />
                          ) : (
                            <div
                              className="group text-center text-sm font-medium cursor-pointer hover:text-primary w-full"
                              onClick={() =>
                                handleFieldClick(assignment.id, "totalScore")
                              }
                            >
                              <div className="relative inline-block">
                                {assignment.totalScore}
                                <Pencil className="h-2 w-2 opacity-0 group-hover:opacity-100 transition-opacity absolute -right-3 top-1" />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm text-muted-foreground mt-2">
                    {editingField?.assignmentId === assignment.id &&
                    editingField.field === "date" ? (
                      <input
                        type="date"
                        value={assignment.date}
                        onChange={(e) =>
                          handleFieldChange(
                            assignment.id,
                            "date",
                            e.target.value
                          )
                        }
                        onBlur={handleFieldBlur}
                        className="bg-transparent border-b border-primary focus:outline-none"
                        autoFocus
                      />
                    ) : (
                      <div
                        className="group inline-flex items-center cursor-pointer hover:text-primary"
                        onClick={() => handleFieldClick(assignment.id, "date")}
                      >
                        <span>{formatDate(assignment.date)}</span>
                        <Pencil className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
                      </div>
                    )}

                    {editingField?.assignmentId === assignment.id &&
                    editingField.field === "weight" ? (
                      <WeightInput
                        value={assignment.weight}
                        onChange={(value) =>
                          handleFieldChange(
                            assignment.id,
                            "weight",
                            value.toString()
                          )
                        }
                        availableWeights={getCurrentClassWeights()}
                        onAddWeight={addWeight}
                        onBlur={handleFieldBlur}
                        onClearWeights={handleClearWeights}
                      />
                    ) : (
                      <div
                        className="group inline-flex items-center cursor-pointer hover:text-primary"
                        onClick={() =>
                          handleFieldClick(assignment.id, "weight")
                        }
                      >
                        <Pencil className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity mr-1" />
                        <span>{assignment.weight}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        <div className="flex flex-col items-center mt-4 mb-0 pb-0">
          <div className="w-full h-px bg-gray-300 dark:bg-gray-700"></div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleAddAssignment}
            className="mt-2 rounded-full h-10 w-10 flex items-center justify-center"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GradeViewerPage;
