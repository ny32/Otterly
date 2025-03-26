import React from "react";
import { Route, useNavigate } from "react-router-dom";
import { useGradeStore } from "../store/gradeStore";
import { Button } from "../components/ui/button";
import { Plus, Trash2, RotateCcw, RotateCw, Pencil } from "lucide-react";
import { AddClassModal } from "../components/AddClassModal";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  calculateGrade,
  getLetterGrade,
  calculateGPA,
  safeNumber,
} from "../utils/gradeCalculator";
import { useTheme } from "../components/theme-provider";

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    classes,
    deleteClass,
    deletedClasses,
    redoDeletedClasses,
    undoClassDeletion,
    redoClassDeletion,
    updateClass,
  } = useGradeStore();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingClassId, setEditingClassId] = React.useState<string | null>(
    null
  );
  const { theme } = useTheme();

  const mostRecentClass = [...classes].sort(
    (a, b) => (b.lastVisited || 0) - (a.lastVisited || 0)
  )[0];

  const calculateOverallGPA = () => {
    if (classes.length === 0) return 0;
    const totalGPA = classes.reduce((sum, cls) => {
      const grade = calculateGrade(cls);
      return sum + calculateGPA(grade);
    }, 0);
    return totalGPA / classes.length;
  };

  // Color function for grade percentages
  const getProgressColor = (percentage: number): string => {
    if (percentage >= 85) return "#24a158";
    if (percentage >= 60) return "#f2c94c";
    return "#CA0B00";
  };

  // Calculate assignment percentage for color
  const calculateAssignmentPercentage = (
    earned: number | string,
    total: number | string
  ): number => {
    const earnedNum = safeNumber(earned);
    const totalNum = safeNumber(total);
    if (totalNum === 0) return 0;
    return (earnedNum / totalNum) * 100;
  };

  // Handle class deletion
  const handleDeleteClass = (e: React.MouseEvent, classId: string) => {
    e.stopPropagation(); // Prevent navigation to class view
    deleteClass(classId);
  };

  // Global undo/redo for class deletions
  const handleUndoDeleteClass = () => {
    undoClassDeletion();
  };

  const handleRedoDeleteClass = () => {
    redoClassDeletion();
  };

  // Check if deletion history is available
  const canUndoDelete = deletedClasses.length > 0;
  const canRedoDelete = redoDeletedClasses.length > 0;

  // Handler for class name edit
  const handleClassNameClick = (e: React.MouseEvent, classId: string) => {
    e.stopPropagation(); // Prevent navigation to class view
    setEditingClassId(classId);
  };

  const handleClassNameBlur = () => {
    setEditingClassId(null);
  };

  const handleClassNameChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    classId: string
  ) => {
    updateClass(classId, { name: e.target.value });
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 mb-0 pb-0">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
        {/* Left Column */}
        <div className="space-y-4 sm:space-y-6">
          {/* Recent Class Card - Always show this section */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-xl sm:text-2xl">
                {mostRecentClass ? mostRecentClass.name : "Recent Class"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              {mostRecentClass ? (
                <>
                  <div className="text-2xl sm:text-3xl font-bold mb-4">
                    {calculateGrade(mostRecentClass).toFixed(2)}%
                  </div>
                  <div className="space-y-2">
                    {mostRecentClass.assignments
                      .slice(0, 6)
                      .map((assignment) => {
                        const percentage = calculateAssignmentPercentage(
                          assignment.earnedScore,
                          assignment.totalScore
                        );
                        return (
                          <div
                            key={assignment.id}
                            className="flex justify-between items-center py-1"
                          >
                            <span className="text-sm truncate mr-2">
                              {assignment.name}
                            </span>
                            <span
                              className="text-sm font-bold whitespace-nowrap"
                              style={{ color: getProgressColor(percentage) }}
                            >
                              {assignment.earnedScore}/{assignment.totalScore}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() =>
                      navigate(`/gradeviewer/${mostRecentClass.id}`)
                    }
                  >
                    View Details
                  </Button>
                </>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">
                    No classes available
                  </p>
                  {/* <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setIsModalOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Class
                  </Button> */}
                </div>
              )}
            </CardContent>
          </Card>

          {/* GPA Card */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold">
                  {calculateOverallGPA().toFixed(2)}
                </div>
                <div className="text-base sm:text-lg text-muted-foreground">
                  GPA
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - All Classes */}
        <Card>
          <CardHeader className="p-4 sm:p-6 relative">
            <CardTitle className="text-xl sm:text-2xl">All Classes</CardTitle>

            {/* Undo/Redo buttons for class deletions */}
            <div className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 flex gap-2">
              <Button
                variant="secondary"
                size="icon"
                onClick={handleUndoDeleteClass}
                disabled={!canUndoDelete}
                className={`h-8 w-8 transition-all ${
                  theme === "dark"
                    ? "bg-slate-700/50 hover:bg-slate-600 hover:scale-110"
                    : "bg-slate-300/70 hover:bg-slate-400 hover:scale-110 shadow-sm"
                }`}
                title="Undo Class Deletion"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={handleRedoDeleteClass}
                disabled={!canRedoDelete}
                className={`h-8 w-8 transition-all ${
                  theme === "dark"
                    ? "bg-slate-700/50 hover:bg-slate-600 hover:scale-110"
                    : "bg-slate-300/70 hover:bg-slate-400 hover:scale-110 shadow-sm"
                }`}
                title="Redo Class Deletion"
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 pt-0">
            {classes.length > 0 ? (
              <div className="space-y-2">
                {classes.map((classData) => {
                  const classGrade = calculateGrade(classData);
                  return (
                    <div
                      key={classData.id}
                      className="flex justify-between items-center py-2 border-b last:border-0 hover:bg-accent/50 px-2 rounded group"
                      onClick={() => navigate(`/gradeviewer/${classData.id}`)}
                    >
                      <div className="flex items-center flex-grow truncate mr-2 cursor-pointer">
                        {editingClassId === classData.id ? (
                          <input
                            type="text"
                            value={classData.name}
                            onChange={(e) =>
                              handleClassNameChange(e, classData.id)
                            }
                            onBlur={handleClassNameBlur}
                            className="font-medium bg-transparent border-b border-primary focus:outline-none max-w-[90%]"
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                          />
                        ) : (
                          <>
                            <span className="font-medium truncate">
                              {classData.name}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) =>
                                handleClassNameClick(e, classData.id)
                              }
                              className="h-6 w-6 ml-1 opacity-0 group-hover:opacity-100 transition-all"
                              title="Edit class name"
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <span className="text-muted-foreground">
                          {classGrade.toFixed(2)}%
                        </span>
                        <span
                          className="font-semibold"
                          style={{ color: getProgressColor(classGrade) }}
                        >
                          {getLetterGrade(classGrade)}
                        </span>

                        {/* Delete button for each class */}
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={(e) => handleDeleteClass(e, classData.id)}
                          className={`h-6 w-6 transition-all opacity-0 group-hover:opacity-100 ml-2 ${
                            theme === "dark"
                              ? "bg-red-900/50 hover:bg-red-800 hover:scale-110"
                              : "bg-red-200/70 hover:bg-red-300 hover:scale-110 shadow-sm"
                          }`}
                          title="Delete class"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No classes available
              </div>
            )}
            <div className="mt-4 pt-4 border-t">
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setIsModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Class
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="mt-10 mb-0 pb-0 flex justify-center">
        <Button
          variant="ghost"
          className="max-w-md w-full mx-auto"
          onClick={() => {
            // Clear localStorage for a complete reset
            localStorage.clear();

            // Also reset the deletedClasses in the store before navigating
            useGradeStore.setState((state) => ({
              ...state,
              classes: [],
              deletedClasses: [],
              redoDeletedClasses: [],
              history: {},
            }));

            navigate("/");
            window.location.reload();
          }}
        >
          Delete All
        </Button>
      </div>
      <AddClassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default DashboardPage;
