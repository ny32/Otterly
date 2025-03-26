import React from "react";
import { Button } from "./ui/button";
import { X } from "lucide-react";
import { useTheme } from "./theme-provider";

interface DeletedDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  deletedData: string;
}

export const DeletedDataModal: React.FC<DeletedDataModalProps> = ({
  isOpen,
  onClose,
  deletedData,
}) => {
  const { theme } = useTheme();

  if (!isOpen || !deletedData) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 sm:p-6 md:p-8 overflow-y-auto">
      <div
        className="bg-background rounded-lg shadow-lg p-3 sm:p-4 md:p-6 w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-xl lg:max-w-2xl max-h-[90vh] m-auto overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-2 sm:mb-3 md:mb-4">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold">
            Removed Text
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-accent/50"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2 sm:space-y-3">
          <p className="text-sm md:text-base text-muted-foreground">
            The following text was deleted prior to processing:
          </p>

          <div
            className={`
            bg-accent/20 
            p-3 sm:p-4 
            rounded-lg 
            text-xs sm:text-sm 
            whitespace-pre-wrap 
            overflow-x-auto 
            max-h-[40vh] sm:max-h-[50vh] 
            border 
            ${theme === "dark" ? "border-gray-700" : "border-gray-300"}
          `}
          >
            {deletedData || "No data was removed."}
          </div>
        </div>
      </div>
    </div>
  );
};
