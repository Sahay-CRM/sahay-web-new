import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FormLabel } from "@/components/ui/form";
import { X } from "lucide-react";
import { twMerge } from "tailwind-merge";

interface FormTagInputProps {
  id?: string;
  label?: string;
  value?: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: { message?: string };
  className?: string;
  isMandatory?: boolean;
}

export default function FormTagInput({
  id,
  label,
  value = [],
  onChange,
  placeholder = "Add tags (press Enter or comma)",
  disabled = false,
  error,
  className,
  isMandatory = false,
}: FormTagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addTag(inputValue);
    }
  };

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInputValue("");
  };

  const removeTag = (indexToRemove: number) => {
    onChange(value.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className={className}>
      {label && (
        <FormLabel
          className="mb-2 block text-sm font-medium text-gray-700"
          htmlFor={id}
        >
          {label}{" "}
          {isMandatory && <span className="text-red-500 text-[20px]">*</span>}
        </FormLabel>
      )}
      <div
        className={twMerge(
          "flex flex-wrap items-center gap-1.5 rounded-md border bg-white p-1.5 min-h-[44px]",
          disabled
            ? "cursor-not-allowed opacity-50 bg-gray-100 border-gray-300"
            : "border-gray-300 focus-within:border-black",
        )}
      >
        {value.map((tag, index) => (
          <Badge
            key={tag + index}
            variant="secondary"
            className="flex items-center gap-1 px-2.5 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-black border border-gray-200 font-normal"
          >
            {tag}
            <button
              type="button"
              disabled={disabled}
              onClick={() => removeTag(index)}
              className="ml-1 rounded-full hover:bg-gray-300 p-0.5 focus:outline-none"
            >
              <X className="h-3 w-3 text-gray-500 hover:text-black" />
            </button>
          </Badge>
        ))}
        <Input
          id={id}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={value.length === 0 ? placeholder : "Add more..."}
          disabled={disabled}
          className="flex-1 border-0 bg-transparent px-1 py-1 h-8 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none min-w-[150px] text-black"
        />
      </div>
      {error?.message && (
        <span className="text-red-600 text-sm mt-1 block">{error.message}</span>
      )}
    </div>
  );
}
