import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGradeStore } from "../store/gradeStore";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { useTheme } from "../components/theme-provider";
import { WeightInput } from "../components/ui/weight-input";

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
    }
  }, [classId, setLastVisited]);

  if (!currentClass) {
    return <div>Class not found</div>;
  }

  // ----- CALCULATION FUNCTIONS SECTION -----
  const calculateGrade = () => {
    // Group assignments by weight
    const weightGroups: {
      [key: number]: {
        totalEarned: number;
        totalPossible: number;
        weight: number;
      };
    } = {};

    currentClass.assignments.forEach((assignment) => {
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

    const weightedScore = Object.values(weightGroups).reduce(
      (sum, group) =>
        sum + (group.totalEarned / group.totalPossible) * group.weight,
      0
    );

    return Math.round((weightedScore / totalWeight) * 10000) / 100;
  };

  const getLetterGrade = (percentage: number): string => {
    if (percentage >= 90) return "A";
    if (percentage >= 80) return "B";
    if (percentage >= 70) return "C";
    if (percentage >= 60) return "D";
    return "F";
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 85) return "#24a158";
    if (percentage >= 60) return "#f2c94c";
    return "#CA0B00";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // ----- EVENT HANDLERS SECTION -----
  const handleFieldClick = (
    assignmentId: string,
    field: "name" | "date" | "weight" | "earnedScore" | "totalScore"
  ) => {
    setEditingField({ assignmentId, field });
  };

  const handleFieldBlur = () => {
    setEditingField(null);
  };

  const handleFieldChange = (
    assignmentId: string,
    field: "name" | "date" | "weight" | "earnedScore" | "totalScore",
    value: string
  ) => {
    if (!classId) return;

    if (field === "earnedScore" || field === "totalScore") {
      updateAssignment(classId, assignmentId, {
        [field]: Number(value),
      });
    } else {
      updateAssignment(classId, assignmentId, {
        [field]: field === "weight" ? Number(value) : value,
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
    const defaultWeight =
      availableWeights.length > 0 ? availableWeights[0] : 100;

    addAssignment(classId, {
      name: "New Assignment",
      date: today,
      weight: defaultWeight,
      earnedScore: 0,
      totalScore: 100,
    });
  };

  // ----- COMPUTED VALUES SECTION -----
  const grade = calculateGrade();
  const letterGrade = getLetterGrade(grade);
  const progressColor = getProgressColor(grade);
  const emptyRingColor = theme === "dark" ? "#2d2d2d" : "#e5e7eb";

  // ----- RENDER SECTION -----
  return (
    <div className="container mx-auto px-4 py-8">
      {/* ----- HEADER SECTION ----- */}
      <div className="relative mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="absolute left-0 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <div className="text-center">
          {isEditingClassName ? (
            <input
              type="text"
              value={currentClass.name}
              onChange={handleClassNameChange}
              onBlur={handleClassNameBlur}
              className="text-3xl font-bold bg-transparent border-b border-primary focus:outline-none"
              autoFocus
            />
          ) : (
            <h1
              className="text-3xl font-bold cursor-pointer hover:text-primary"
              onClick={handleClassNameClick}
            >
              {currentClass.name}
            </h1>
          )}
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="relative w-48 h-48">
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
                <div className="flex flex-col items-center justify-center w-24 h-24 rounded-full bg-background">
                  <div className="text-4xl font-bold">{grade.toFixed(1)}%</div>
                  <div className="text-2xl font-semibold">{letterGrade}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ----- ASSIGNMENTS LIST SECTION ----- */}
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Assignment Cards */}
        {currentClass.assignments.map((assignment) => {
          const assignmentGrade =
            (assignment.earnedScore / assignment.totalScore) * 100;
          const assignmentLetterGrade = getLetterGrade(assignmentGrade);
          const assignmentProgressColor = getProgressColor(assignmentGrade);

          return (
            <Card key={assignment.id} className="transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex flex-col">
                  <div className="flex justify-between items-start">
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
                        className="text-xl font-medium bg-transparent border-b border-primary focus:outline-none"
                        autoFocus
                      />
                    ) : (
                      <h3
                        className="text-xl font-medium cursor-pointer hover:text-primary"
                        onClick={() => handleFieldClick(assignment.id, "name")}
                      >
                        {assignment.name}
                      </h3>
                    )}
                    <div className="relative w-20 h-20">
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
                        <div className="flex flex-col items-center justify-center w-14 h-14 rounded-full bg-background">
                          {editingField?.assignmentId === assignment.id &&
                          editingField.field === "earnedScore" ? (
                            <input
                              type="number"
                              value={assignment.earnedScore}
                              onChange={(e) =>
                                handleFieldChange(
                                  assignment.id,
                                  "earnedScore",
                                  e.target.value
                                )
                              }
                              onBlur={handleFieldBlur}
                              className="text-sm font-medium bg-transparent border-b border-primary focus:outline-none w-12 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              autoFocus
                            />
                          ) : (
                            <div
                              className="text-sm font-medium cursor-pointer hover:text-primary"
                              onClick={() =>
                                handleFieldClick(assignment.id, "earnedScore")
                              }
                            >
                              {assignment.earnedScore}
                            </div>
                          )}
                          <div className="w-4 h-[1px] bg-gray-400 dark:bg-gray-600 my-0.5"></div>
                          {editingField?.assignmentId === assignment.id &&
                          editingField.field === "totalScore" ? (
                            <input
                              type="number"
                              value={assignment.totalScore}
                              onChange={(e) =>
                                handleFieldChange(
                                  assignment.id,
                                  "totalScore",
                                  e.target.value
                                )
                              }
                              onBlur={handleFieldBlur}
                              className="text-sm font-medium bg-transparent border-b border-primary focus:outline-none w-12 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              autoFocus
                            />
                          ) : (
                            <div
                              className="text-sm font-medium cursor-pointer hover:text-primary"
                              onClick={() =>
                                handleFieldClick(assignment.id, "totalScore")
                              }
                            >
                              {assignment.totalScore}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
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
                        className="text-sm text-muted-foreground bg-transparent border-b border-primary focus:outline-none"
                        autoFocus
                      />
                    ) : (
                      <div
                        className="text-sm text-muted-foreground cursor-pointer hover:text-primary"
                        onClick={() => handleFieldClick(assignment.id, "date")}
                      >
                        {formatDate(assignment.date)}
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
                        availableWeights={availableWeights}
                        onAddWeight={addWeight}
                      />
                    ) : (
                      <div
                        className="text-sm text-muted-foreground cursor-pointer hover:text-primary"
                        onClick={() =>
                          handleFieldClick(assignment.id, "weight")
                        }
                      >
                        {assignment.weight}%
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Add Assignment Bar */}
        <div className="flex flex-col items-center mt-6">
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
