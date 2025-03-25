import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useTheme } from "../theme-provider";

interface WeightInputProps {
  value: number;
  onChange: (value: number) => void;
  availableWeights: number[];
  onAddWeight: (weight: number) => void;
  onBlur: () => void;
  onClearWeights?: () => void;
}

export function WeightInput({
  value,
  onChange,
  availableWeights,
  onAddWeight,
  onBlur,
  onClearWeights,
}: WeightInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const saveCurrentValue = () => {
    const numValue = parseFloat(inputValue);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      const roundedValue = Math.round(numValue * 100) / 100;
      onChange(roundedValue);
      if (!availableWeights.includes(roundedValue)) {
        onAddWeight(roundedValue);
      }
      setInputValue(roundedValue.toString());
      return true;
    }
    setInputValue(value.toString());
    return false;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        saveCurrentValue();
        setIsOpen(false);
        onBlur();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value, inputValue, availableWeights]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleBlur = () => {
    saveCurrentValue();
    onBlur();
  };

  const handleWeightSelect = (weight: number) => {
    onChange(weight);
    setInputValue(weight.toString());
    if (!availableWeights.includes(weight)) {
      onAddWeight(weight);
    }
    setIsOpen(false);
    onBlur();
  };

  const handleDropdownToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOpen) {
      saveCurrentValue();
    }
    setIsOpen(!isOpen);
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClearWeights) {
      onClearWeights();
    }
    setIsOpen(false);
    onBlur();
  };

  const sortedWeights = [...new Set(availableWeights)].sort((a, b) => a - b);

  /**
   * Prevents the input's blur event from firing before dropdown selection is processed.
   * This is necessary because the blur event would otherwise reset the editing state
   * before the selection is registered, causing the selection to be lost.
   *
   * We use mousedown instead of click because blur fires on mousedown.
   */
  const handleDropdownMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onFocus={() => setIsOpen(true)}
          className="text-sm text-muted-foreground bg-transparent border-b border-primary focus:outline-none w-12 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          min="0"
          max="100"
          step="0.01"
          autoFocus
        />
        <button
          type="button"
          onClick={handleDropdownToggle}
          className="absolute -right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
      {isOpen && (
        <div
          className="absolute z-10 w-24 mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-y-auto"
          onMouseDown={handleDropdownMouseDown}
        >
          {sortedWeights.map((weight) => (
            <button
              key={weight}
              onClick={() => handleWeightSelect(weight)}
              className="w-full px-2 py-1 text-left text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              {weight}%
            </button>
          ))}
          {onClearWeights && sortedWeights.length > 0 && (
            <button
              onClick={handleClearAll}
              className="w-full px-2 py-1 text-left text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground border-t italic underline"
            >
              Clear All...
            </button>
          )}
        </div>
      )}
    </div>
  );
}
