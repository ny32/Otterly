import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGradeStore } from "../store/gradeStore";

const UploadPage: React.FC = () => {
  const [textData, setTextData] = useState("");
  const navigate = useNavigate();
  const setRawData = useGradeStore((state) => state.setRawData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textData.trim()) {
      setRawData(textData);
      navigate("/dashboard");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Welcome to GradeViewer
        </h1>
        <div className="bg-card rounded-lg shadow-lg p-6">
          <p className="text-muted-foreground mb-6">
            Paste your grade data below to get started.
          </p>
          <form onSubmit={handleSubmit}>
            <textarea
              className="w-full h-48 p-4 border rounded-md bg-background"
              placeholder="Paste text here..."
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
    </div>
  );
};

export default UploadPage;
