import React, { useRef } from "react";
import { X } from "lucide-react";
import { FormLabel } from "@/components/ui/form";

interface FormImageProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: { message?: string };
  isMandatory?: boolean;
}

const FormImage: React.FC<FormImageProps> = ({
  label,
  value,
  onChange,
  error,
  isMandatory,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    onChange("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col items-start gap-1 w-full h-full">
      {label && (
        <FormLabel className="mb-2">
          {label}{" "}
          {isMandatory && <span className="text-red-500 text-[20px]">*</span>}
        </FormLabel>
      )}
      <div
        onClick={() => inputRef.current?.click()}
        className="relative w-full h-full m-auto border rounded-lg cursor-pointer bg-muted flex items-center justify-center overflow-hidden"
      >
        <div className="min-h-[100px] flex flex-col justify-center items-center">
          {value ? (
            <>
              <img
                src={value}
                alt="preview"
                className="object-cover w-full h-full"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md"
              >
                <X size={16} className="text-red-500" />
              </button>
            </>
          ) : (
            <span className="text-sm text-muted-foreground">
              Click to upload
            </span>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
      </div>
      {error?.message && (
        <span className="text-red-600 text-[calc(1em-1px)] tb:text-[calc(1em-2px)] before:content-['*']">
          {error.message}
        </span>
      )}
    </div>
  );
};

export default FormImage;
