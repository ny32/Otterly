import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGradeStore } from "../store/gradeStore";
import { getLastDeletedData, parseRawText } from "../utils/textParser";
import { DeletedDataModal } from "../components/DeletedDataModal";

const UploadPage: React.FC = () => {
  const [textData, setTextData] = useState("");
  const [showDeletedDataModal, setShowDeletedDataModal] = useState(false);
  const [deletedData, setDeletedData] = useState("");
  const [dataProcessed, setDataProcessed] = useState(false);
  const navigate = useNavigate();
  const setRawData = useGradeStore((state) => state.setRawData);

  // Navigate after data is processed and modal is closed
  useEffect(() => {
    if (dataProcessed && !showDeletedDataModal) {
      navigate("/dashboard");
    }
  }, [dataProcessed, showDeletedDataModal, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textData.trim()) {
      try {
        // When doing setRawData, the data might contain multiple classes
        // separated by "\n\n\n". We need to parse each one to capture deleted data
        const chunks = textData.split("\n\n\n").filter(Boolean);
        let hasDeletedData = false;
        let allDeletedData = "";

        // Pre-parse each chunk to detect deleted data
        chunks.forEach((chunk, index) => {
          // Parse this chunk to trigger lastDeletedData capture
          parseRawText(chunk);

          // Check if this chunk had deleted data
          const chunkDeletedData = getLastDeletedData();
          if (chunkDeletedData) {
            hasDeletedData = true;
            allDeletedData +=
              (allDeletedData ? "\n\n" : "") +
              `[Class ${index + 1}] Removed Content:\n${chunkDeletedData}`;
          }
        });

        // Process all data
        setRawData(textData);
        setDataProcessed(true);

        // Show modal if there was deleted data
        if (hasDeletedData) {
          setDeletedData(allDeletedData);
          setShowDeletedDataModal(true);
          // Navigation will happen in useEffect when modal is closed
        } else {
          // If no deleted data, navigate directly (via useEffect)
        }
      } catch (error) {
        console.error("Error parsing data:", error);
        // Still process data even if there was an error
        setRawData(textData);
        setDataProcessed(true);
        // Navigation will happen in useEffect
      }
    }
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 mb-0 pb-0">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Nothing here yet...
        </h1>
        <div className="bg-card rounded-lg shadow-lg p-6">
          <p className="text-muted-foreground mb-6">Paste your data below:</p>
          <form onSubmit={handleSubmit}>
            <textarea
              className="w-full h-48 p-4 border rounded-md bg-background"
              placeholder="1. Go to the StudentVue Gradebook&#10;2. Select(CTRL + A) and copy the page of the class you want&#10;3. Paste here"
              value={textData}
              onChange={(e) => setTextData(e.target.value)}
            />
            <div className="text-center">
              <button
                type="submit"
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Add Class
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Deleted Data Modal */}
      <DeletedDataModal
        isOpen={showDeletedDataModal}
        onClose={() => {
          setShowDeletedDataModal(false);
          // Navigation happens in useEffect
        }}
        deletedData={deletedData}
      />
    </div>
  );
};

export default UploadPage;
