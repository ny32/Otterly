import React, { useState, useEffect } from "react";
import { useGradeStore } from "../store/gradeStore";
import { Button } from "./ui/button";
import { getLastDeletedData } from "../utils/textParser";
import { DeletedDataModal } from "./DeletedDataModal";

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddClassModal: React.FC<AddClassModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [rawText, setRawText] = useState("");
  const [showDeletedDataModal, setShowDeletedDataModal] = useState(false);
  const [deletedData, setDeletedData] = useState("");
  const addClass = useGradeStore((state) => state.addClass);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setShowDeletedDataModal(false);
      setDeletedData("");
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (rawText.trim()) {
      // Process the class data
      addClass(rawText);

      // Get any deleted data from the parser
      const deletedContent = getLastDeletedData();

      // If there's deleted data, show the modal
      if (deletedContent) {
        setDeletedData(deletedContent);
        setShowDeletedDataModal(true);
      } else {
        // If no deleted data, just close the modal
        onClose();
      }

      // Clear the input regardless
      setRawText("");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4 md:p-6 overflow-y-auto">
        <div
          className="bg-background rounded-lg shadow-lg p-3 sm:p-4 md:p-6 w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-xl lg:max-w-2xl max-h-[90vh] m-auto overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3">
            Add New Class
          </h2>
          <div className="space-y-2 sm:space-y-3">
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
              Paste your class data below:
            </p>
            {/* <pre className="bg-secondary/20 p-2 rounded-lg text-xs overflow-x-auto max-h-[15vh] sm:max-h-[20vh]">
              {`Class: [Class Name]
Instructor: [Instructor Name]
Term: [Term]

Assignments:
1. [Assignment Name]
   Date: [YYYY-MM-DD]
   Weight: [Number]
   Score: [Earned]/[Total]`}
            </pre> */}
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="w-full h-24 min-h-[80px] sm:h-32 md:h-40 p-2 border rounded-md bg-background text-xs sm:text-sm"
              placeholder="1. Go to the StudentVue Gradebook&#10;2. Select(CTRL + A) and copy the page of the class you want&#10;3. Paste here"
            />
            <div className="flex justify-end gap-2 pt-1 sm:pt-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="text-xs h-8 px-2 sm:h-9 sm:px-3"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="text-xs h-8 px-2 sm:h-9 sm:px-3"
              >
                Add Class
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Deleted Data Modal */}
      <DeletedDataModal
        isOpen={showDeletedDataModal}
        onClose={() => {
          setShowDeletedDataModal(false);
          onClose();
        }}
        deletedData={deletedData}
      />
    </>
  );
};
