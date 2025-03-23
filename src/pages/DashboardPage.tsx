import React from "react";
import { Route, useNavigate } from "react-router-dom";
import { useGradeStore } from "../store/gradeStore";
import { Button } from "../components/ui/button";
import { Plus } from "lucide-react";
import { AddClassModal } from "../components/AddClassModal";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { classes } = useGradeStore();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const mostRecentClass = [...classes].sort(
    (a, b) => (b.lastVisited || 0) - (a.lastVisited || 0)
  )[0];

  const calculateGrade = (classData: typeof mostRecentClass) => {
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

    const weightedScore = Object.values(weightGroups).reduce(
      (sum, group) =>
        sum + (group.totalEarned / group.totalPossible) * group.weight,
      0
    );

    return Math.round((weightedScore / totalWeight) * 10000) / 100;
  };

  const calculateGPA = (percentage: number): number => {
    if (percentage >= 90) return 4.0;
    if (percentage >= 80) return 3.0;
    if (percentage >= 70) return 2.0;
    if (percentage >= 60) return 1.0;
    return 0.0;
  };

  const getLetterGrade = (percentage: number): string => {
    if (percentage >= 90) return "A";
    if (percentage >= 80) return "B";
    if (percentage >= 70) return "C";
    if (percentage >= 60) return "D";
    return "F";
  };

  const calculateOverallGPA = () => {
    if (classes.length === 0) return 0;
    const totalGPA = classes.reduce((sum, cls) => {
      const grade = calculateGrade(cls);
      return sum + calculateGPA(grade);
    }, 0);
    return totalGPA / classes.length;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Recent Class Card */}
          {mostRecentClass && (
            <Card>
              <CardHeader>
                <CardTitle>{mostRecentClass.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">
                  {calculateGrade(mostRecentClass).toFixed(1)}%
                </div>
                <div className="space-y-2">
                  {mostRecentClass.assignments.slice(0, 6).map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex justify-between items-center py-1"
                    >
                      <span className="text-sm">{assignment.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {assignment.earnedScore}/{assignment.totalScore}
                      </span>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => navigate(`/gradeviewer/${mostRecentClass.id}`)}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          )}

          {/* GPA Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl font-bold">
                  {calculateOverallGPA().toFixed(1)}
                </div>
                <div className="text-lg text-muted-foreground">GPA</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - All Classes */}
        <Card>
          <CardHeader>
            <CardTitle>All Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {classes.map((classData) => (
                <div
                  key={classData.id}
                  className="flex justify-between items-center py-2 border-b last:border-0 cursor-pointer hover:bg-accent/50 px-2 rounded"
                  onClick={() => navigate(`/gradeviewer/${classData.id}`)}
                >
                  <span className="font-medium">{classData.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      {calculateGrade(classData).toFixed(1)}%
                    </span>
                    <span className="font-semibold">
                      {getLetterGrade(calculateGrade(classData))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
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
      <div className="mt-16 px-[43rem]">
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => {
            localStorage.clear();
            navigate("/");
            window.location.reload();
          }}
        >
          Clear All
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
