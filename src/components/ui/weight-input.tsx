import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useTheme } from "../theme-provider";

interface WeightInputProps {
  value: number;
  onChange: (value: number) => void;
  availableWeights: number[];
  onAddWeight: (weight: number) => void;
}

export function WeightInput({
  value,
  onChange,
  availableWeights,
  onAddWeight,
}: WeightInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
  };

  const handleBlur = () => {
    const numValue = parseFloat(inputValue);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      const roundedValue = Math.round(numValue * 100) / 100;
      onChange(roundedValue);
      onAddWeight(roundedValue);
      setInputValue(roundedValue.toString());
    } else {
      // If invalid, revert to previous value
      setInputValue(value.toString());
    }
  };

  const handleWeightSelect = (weight: number) => {
    onChange(weight);
    setInputValue(weight.toString());
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const sortedWeights = [...new Set(availableWeights)].sort((a, b) => a - b);

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
          onClick={() => setIsOpen(!isOpen)}
          className="absolute -right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
      {isOpen && sortedWeights.length > 0 && (
        <div className="absolute z-10 w-24 mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-y-auto">
          {sortedWeights.map((weight) => (
            <button
              key={weight}
              onClick={() => handleWeightSelect(weight)}
              className="w-full px-2 py-1 text-left text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              {weight}%
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
