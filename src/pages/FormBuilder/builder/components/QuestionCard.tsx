import React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Copy,
  Trash2,
  GripHorizontal,
  AlignLeft,
  Type,
  List,
  CheckSquare,
  ChevronDownCircle,
  Upload,
  Calendar,
  Hash,
  Mail,
  Phone,
  X,
} from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

interface QuestionCardProps {
  question: Question;
  isActive: boolean;
  onActivate: () => void;
  onUpdate: (updates: Partial<Question>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onAddOption: () => void;
  onUpdateOption: (optionId: string, text: string) => void;
  onDeleteOption: (optionId: string) => void;
}

const typeIcons: Record<FieldType, React.ReactNode> = {
  TEXT: <AlignLeft className="h-4 w-4 mr-2 text-gray-500" />,
  TEXTAREA: <Type className="h-4 w-4 mr-2 text-gray-500" />,
  NUMBER: <Hash className="h-4 w-4 mr-2 text-gray-500" />,
  EMAIL: <Mail className="h-4 w-4 mr-2 text-gray-500" />,
  PHONE: <Phone className="h-4 w-4 mr-2 text-gray-500" />,
  SELECT: <ChevronDownCircle className="h-4 w-4 mr-2 text-gray-500" />,
  RADIO: <List className="h-4 w-4 mr-2 text-gray-500" />,
  CHECKBOX: <CheckSquare className="h-4 w-4 mr-2 text-gray-500" />,
  DATE: <Calendar className="h-4 w-4 mr-2 text-gray-500" />,
  FILE: <Upload className="h-4 w-4 mr-2 text-gray-500" />,
};

const typeLabels: Record<FieldType, string> = {
  TEXT: "Short Text",
  TEXTAREA: "Long Text",
  NUMBER: "Number",
  EMAIL: "Email",
  PHONE: "Phone",
  SELECT: "Dropdown",
  RADIO: "Radio",
  CHECKBOX: "Checkboxes",
  DATE: "Date",
  FILE: "File Upload",
};

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  isActive,
  onActivate,
  onUpdate,
  onDelete,
  onDuplicate,
  onAddOption,
  onUpdateOption,
  onDeleteOption,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      onClick={onActivate}
      className={cn(
        "relative mb-2 transition-all duration-150 border-l-4 group bg-white",
        isActive
          ? "border-l-[#2f328e] shadow-md ring-1 ring-[#2f328e]/10"
          : "border-l-transparent hover:border-l-gray-200 shadow-sm",
      )}
    >
      {/* Drag handle — very slim, only on hover */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-0 left-0 right-0 flex justify-center h-4 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripHorizontal className="text-gray-300 h-3.5 w-3.5 mt-0.5" />
      </div>

      {/* Main row — label + type selector always visible */}
      <div className="flex items-center gap-3 px-4 py-2.5 mt-1">
        <Input
          value={question.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="Question label..."
          onClick={(e) => e.stopPropagation()}
          onFocus={onActivate}
          className="flex-1 border-none border-b border-transparent hover:border-b-gray-200 focus:border-b-[#2f328e] bg-transparent rounded-none px-0 h-7 text-sm focus-visible:ring-0 transition-colors"
        />
        <Select
          value={question.fieldType}
          onValueChange={(val) => onUpdate({ fieldType: val as FieldType })}
        >
          <SelectTrigger className="h-10 w-44 text-sm bg-white border-gray-200 focus:ring-0 shrink-0 shadow-sm rounded-md font-medium text-gray-700">
            <SelectValue>
              <div className="flex items-center">
                {typeIcons[question.fieldType]}
                {typeLabels[question.fieldType]}
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="w-44 p-1 rounded-lg shadow-lg border-gray-100">
            {Object.entries(typeLabels).map(([type, label]) => (
              <SelectItem
                key={type}
                value={type}
                className="h-9 cursor-pointer mb-0.5 rounded-md hover:bg-gray-50 focus:bg-gray-50"
              >
                <div className="flex items-center text-sm font-medium text-gray-700">
                  {typeIcons[type as FieldType]}
                  {label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Inline action buttons — visible on hover or active */}
        <div
          className={cn(
            "flex items-center gap-0.5 shrink-0  opacity-100",
            // isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            title="Duplicate"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            className="h-6 w-6 text-gray-400 hover:text-[#2f328e] hover:bg-[#2f328e]/5"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 ml-2 border-l border-gray-200 pl-3 h-6">
            <Label
              htmlFor={`req-${question.id}`}
              className="text-xs text-[#2f328e]/80 font-medium cursor-pointer"
            >
              Required
            </Label>
            <Switch
              id={`req-${question.id}`}
              checked={question.isRequired}
              onCheckedChange={(val) => onUpdate({ isRequired: val })}
              className="data-[state=checked]:bg-[#2f328e] h-4 w-7"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      </div>

      {/* Expanded content — only when active */}
      {isActive && (
        <div className="px-4 space-y-3 pb-2 pt-1">
          {/* Placeholder input (only for textual fields) */}
          {["TEXT", "TEXTAREA", "NUMBER", "EMAIL", "PHONE"].includes(
            question.fieldType,
          ) && (
            <Input
              value={question.placeholder || ""}
              onChange={(e) => onUpdate({ placeholder: e.target.value })}
              placeholder="Placeholder text (shown inside the field)..."
              onClick={(e) => e.stopPropagation()}
              className="h-9 text-sm font-medium bg-gray-50/50 border-gray-200 focus-visible:ring-[#2f328e]/20"
            />
          )}

          {/* Options for radio/checkbox/select */}
          {(question.fieldType === "RADIO" ||
            question.fieldType === "CHECKBOX" ||
            question.fieldType === "SELECT") && (
            <div className="space-y-2 pt-1">
              {question.options?.map((option, index) => (
                <div key={option.id} className="flex h-8 items-center gap-1">
                  {question.fieldType === "RADIO" && (
                    <div className="h-3 w-3 rounded-full border-2 border-gray-300 shrink-0" />
                  )}
                  {question.fieldType === "CHECKBOX" && (
                    <div className="h-3 w-3 rounded border-2 border-gray-300 shrink-0" />
                  )}
                  {question.fieldType === "SELECT" && (
                    <span className="text-gray-400 text-xs w-4 shrink-0">
                      {index + 1}.
                    </span>
                  )}
                  <Input
                    value={option.text}
                    onChange={(e) => onUpdateOption(option.id, e.target.value)}
                    className="h-8 border-transparent hover:border-gray-200 focus:border-[#2f328e] rounded px-2 text-xs bg-transparent w-full"
                    placeholder={`Option ${index + 1}`}
                    onClick={(e) => e.stopPropagation()}
                  />
                  {question.options!.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteOption(option.id);
                      }}
                      className="h-5 w-5 text-gray-300 hover:text-red-400 shrink-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="link"
                className="text-gray-400 hover:text-[#2f328e] p-0 h-auto font-normal text-xs mt-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddOption();
                }}
              >
                + Add option
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
