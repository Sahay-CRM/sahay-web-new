import React, { useRef } from "react";
import {
  X,
  FileText,
  File,
  FileImage,
  FileSpreadsheet,
  FileArchive,
  Download,
  ExternalLink,
} from "lucide-react";
import { FormLabel } from "@/components/ui/form";

interface FormFileProps {
  label: string;
  value: string;
  fileName?: string;
  onChange: (value: string, fileName?: string) => void;
  error?: { message?: string };
  isMandatory?: boolean;
  acceptedFormats?: string; // e.g., ".pdf,.jpg,.png" or "*" for all
}

// Helper function to get file type from base64 data URL or file extension
const getFileType = (value: string, fileName?: string): string => {
  if (!value) return "";

  // Check data URL mime type
  if (value.startsWith("data:")) {
    const mimeMatch = value.match(/data:([^;]+);/);
    if (mimeMatch) {
      return mimeMatch[1];
    }
  }

  // Check file extension from fileName
  if (fileName) {
    const ext = fileName.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "pdf":
        return "application/pdf";
      case "jpg":
      case "jpeg":
        return "image/jpeg";
      case "png":
        return "image/png";
      case "webp":
        return "image/webp";
      case "doc":
        return "application/msword";
      case "docx":
        return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      case "xls":
        return "application/vnd.ms-excel";
      case "xlsx":
        return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      case "zip":
        return "application/zip";
      case "rar":
        return "application/x-rar-compressed";
      default:
        return "application/octet-stream";
    }
  }

  // Check URL extension
  const urlExt = value.split(".").pop()?.toLowerCase();
  if (urlExt) {
    switch (urlExt) {
      case "pdf":
        return "application/pdf";
      case "jpg":
      case "jpeg":
        return "image/jpeg";
      case "png":
        return "image/png";
      case "webp":
        return "image/webp";
      default:
        break;
    }
  }

  return "";
};

// Get appropriate icon for file type
const getFileIcon = (fileType: string) => {
  if (fileType.startsWith("image/")) {
    return <FileImage className="w-12 h-12 text-blue-500" />;
  }
  if (fileType === "application/pdf") {
    return <FileText className="w-12 h-12 text-red-500" />;
  }
  if (fileType.includes("spreadsheet") || fileType.includes("excel")) {
    return <FileSpreadsheet className="w-12 h-12 text-green-500" />;
  }
  if (
    fileType.includes("zip") ||
    fileType.includes("rar") ||
    fileType.includes("archive")
  ) {
    return <FileArchive className="w-12 h-12 text-yellow-500" />;
  }
  if (fileType.includes("word") || fileType.includes("document")) {
    return <FileText className="w-12 h-12 text-blue-600" />;
  }
  return <File className="w-12 h-12 text-gray-500" />;
};

const FormFile: React.FC<FormFileProps> = ({
  label,
  value,
  fileName,
  onChange,
  error,
  isMandatory,
  acceptedFormats = "*",
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string, file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    onChange("", undefined);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const fileType = getFileType(value, fileName);
  const isImage = fileType.startsWith("image/");
  const isPDF = fileType === "application/pdf";

  const renderPreview = () => {
    if (!value) {
      return (
        <span className="text-sm text-muted-foreground">Click to upload</span>
      );
    }

    if (isImage) {
      return (
        <img
          src={value}
          alt="preview"
          className="object-contain w-full max-h-[200px] h-full"
        />
      );
    }

    if (isPDF) {
      return (
        <div className="flex flex-col items-center justify-center gap-2 p-4">
          <FileText className="w-16 h-16 text-red-500" />
          <span className="text-sm text-gray-600 text-center truncate max-w-full">
            {fileName || "PDF Document"}
          </span>
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Download size={12} /> View PDF
          </a>
        </div>
      );
    }

    // Other file types
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-4">
        {getFileIcon(fileType)}
        <span className="text-sm text-gray-600 text-center truncate max-w-full">
          {fileName || "Document"}
        </span>
        <a
          href={value}
          download={fileName}
          className="text-xs text-blue-600 hover:underline flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <Download size={12} /> Download
        </a>
      </div>
    );
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
        <div className="min-h-[100px] max-h-[200px] flex flex-col justify-center items-center w-full">
          {value && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md z-10"
            >
              <X size={16} className="text-red-500" />
            </button>
          )}
          {renderPreview()}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={acceptedFormats}
          onChange={handleFileChange}
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

export default FormFile;

// FilePreview component for displaying files in view mode (non-editing)
export const FilePreview: React.FC<{
  value: string;
  fileName?: string;
  className?: string;
  placeholder?: string;
}> = ({
  value,
  fileName,
  className = "",
  placeholder = "No file uploaded",
}) => {
  const fileType = getFileType(value, fileName);
  const isImage = fileType.startsWith("image/");
  const isPDF = fileType === "application/pdf";

  // Handle click to open in new tab
  const handleOpenInNewTab = () => {
    if (value) {
      window.open(value, "_blank", "noopener,noreferrer");
    }
  };

  if (!value) {
    return (
      <div className={`text-center text-gray-500 ${className}`}>
        <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>{placeholder}</p>
      </div>
    );
  }

  if (isImage) {
    return (
      <div
        className={`relative group cursor-pointer ${className}`}
        onClick={handleOpenInNewTab}
        title="Click to open in new tab"
      >
        <img
          src={value}
          alt={fileName || "Preview"}
          className="object-contain rounded-lg w-full h-full"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
          <div className="flex flex-col items-center text-white">
            <ExternalLink className="w-8 h-8 mb-2" />
            <span className="text-sm font-medium">Click to open</span>
          </div>
        </div>
      </div>
    );
  }

  if (isPDF) {
    return (
      <div
        className={`relative group cursor-pointer flex flex-col items-center justify-center ${className}`}
        onClick={handleOpenInNewTab}
        title="Click to open PDF in new tab"
      >
        {/* PDF Icon Preview */}
        <div className="relative flex flex-col items-center justify-center p-6 bg-gray-100 rounded-lg w-full h-full min-h-[200px]">
          <FileText className="w-16 h-16 text-red-500 mb-3" />
          <span className="text-sm text-gray-700 font-medium text-center truncate max-w-full px-2">
            {fileName || "PDF Document"}
          </span>
          <span className="text-xs text-gray-500 mt-1">Click to view</span>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
            <div className="flex flex-col items-center text-white">
              <ExternalLink className="w-8 h-8 mb-2" />
              <span className="text-sm font-medium">Open in new tab</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Other file types
  return (
    <div
      className={`relative group cursor-pointer flex flex-col items-center justify-center p-6 ${className}`}
      onClick={handleOpenInNewTab}
      title="Click to open in new tab"
    >
      <div className="relative flex flex-col items-center justify-center p-6 bg-gray-100 rounded-lg w-full h-full min-h-[150px]">
        {getFileIcon(fileType)}
        <span className="mt-2 text-sm text-gray-600">
          {fileName || "Document"}
        </span>
        <span className="text-xs text-gray-500 mt-1">Click to view</span>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
          <div className="flex flex-col items-center text-white">
            <ExternalLink className="w-8 h-8 mb-2" />
            <span className="text-sm font-medium">Open in new tab</span>
          </div>
        </div>
      </div>
    </div>
  );
};
