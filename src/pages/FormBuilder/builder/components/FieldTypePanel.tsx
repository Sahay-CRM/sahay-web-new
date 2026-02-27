import React from "react";
import {
  AlignLeft,
  Type,
  List,
  CheckSquare,
  ChevronDown,
  Calendar,
  Upload,
  Hash,
  Mail,
  Phone,
} from "lucide-react";

interface FieldTypePanelProps {
  onAddField: (fieldType: FieldType) => void;
}

const fieldTypes: { type: FieldType; label: string; icon: React.ReactNode }[] =
  [
    { type: "TEXT", label: "Text", icon: <AlignLeft className="h-4 w-4" /> },
    {
      type: "TEXTAREA",
      label: "Paragraph",
      icon: <Type className="h-4 w-4" />,
    },
    { type: "NUMBER", label: "Number", icon: <Hash className="h-4 w-4" /> },
    { type: "EMAIL", label: "Email", icon: <Mail className="h-4 w-4" /> },
    { type: "PHONE", label: "Phone", icon: <Phone className="h-4 w-4" /> },
    { type: "RADIO", label: "Radio", icon: <List className="h-4 w-4" /> },
    {
      type: "CHECKBOX",
      label: "Checkbox",
      icon: <CheckSquare className="h-4 w-4" />,
    },
    {
      type: "SELECT",
      label: "Dropdown",
      icon: <ChevronDown className="h-4 w-4" />,
    },
    { type: "DATE", label: "Date", icon: <Calendar className="h-4 w-4" /> },
    { type: "FILE", label: "File", icon: <Upload className="h-4 w-4" /> },
  ];

export const FieldTypePanel: React.FC<FieldTypePanelProps> = ({
  onAddField,
}) => {
  return (
    <div className="w-[240px] shrink-0 border-l border-gray-200 bg-white flex flex-col h-full">
      {/* Header */}
      <div className="px-3 py-3 border-b border-gray-100 bg-gray-50">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Add Field
        </p>
      </div>

      {/* Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex flex-col gap-2">
          {fieldTypes.map(({ type, label, icon }) => (
            <button
              key={type}
              onClick={() => onAddField(type)}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-white text-gray-600 hover:border-[#2f328e]/40 hover:text-[#2f328e] hover:bg-[#2f328e]/5 transition-all text-sm font-medium"
            >
              <span className="text-gray-400">{icon}</span>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
