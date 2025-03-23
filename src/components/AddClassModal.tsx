import React, { useState } from "react";
import { useGradeStore } from "../store/gradeStore";
import { Button } from "./ui/button";

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddClassModal: React.FC<AddClassModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [rawText, setRawText] = useState("");
  const addClass = useGradeStore((state) => state.addClass);

  const handleSubmit = () => {
    if (rawText.trim()) {
      addClass(rawText);
      onClose();
      setRawText("");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg p-6 max-w-2xl w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">Add New Class</h2>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Paste your class data in the following format:
          </p>
          <pre className="bg-secondary/20 p-4 rounded-lg text-sm">
            {`Class: [Class Name]
Instructor: [Instructor Name]
Term: [Term]

Assignments:
1. [Assignment Name]
   Date: [YYYY-MM-DD]
   Weight: [Number]
   Score: [Earned]/[Total]`}
          </pre>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            className="w-full h-48 p-4 border rounded-md bg-background"
            placeholder="Paste your class data here..."
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Add Class</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
