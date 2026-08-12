import { useState, useRef, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { FormLabel } from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { twMerge } from "tailwind-merge";
import { ChevronDown, Check, X } from "lucide-react";
import { isColorDark } from "@/features/utils/color.utils";

type Option = {
  value: string;
  label: string;
  color?: string;
  isHeader?: boolean;
  isFooterNote?: boolean;
};

interface SearchDropdownProps {
  options: Option[];
  selectedValues: string[];
  onSelect: (item: Option) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  labelClass?: string;
  isMandatory?: boolean;
  error?: { message?: string };
  onSearchChange?: (value: string) => void;
  dropdownClass?: string;
  isCrossShow?: boolean;
  disabled?: boolean;
  multiSelect?: boolean;
  onAddNew?: (query: string) => void;
  footerText?: string;
  isSearchable?: boolean;
  onActionClick?: (value: string, e: React.MouseEvent) => void;
  actionText?: string;
  actionActiveValues?: string[];
  activeActionText?: string;
}

const SearchDropdown = ({
  options,
  selectedValues = [],
  onSelect,
  placeholder = "Select...",
  className = "",
  label,
  labelClass,
  isMandatory,
  error,
  onSearchChange,
  dropdownClass = "",
  isCrossShow = true,
  disabled = false,
  multiSelect = false,
  onAddNew,
  footerText,
  isSearchable = true,
  onActionClick,
  actionText,
  actionActiveValues = [],
  activeActionText,
}: SearchDropdownProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === selectedValues[0]);

  const filteredOptions = useMemo(() => {
    const matches = options.map((opt) => {
      if (opt.isHeader || opt.isFooterNote) return false;
      return opt.label.toLowerCase().includes(query.toLowerCase());
    });

    return options.filter((opt, index) => {
      if (opt.isFooterNote) return true;
      if (opt.isHeader) {
        for (let i = index + 1; i < options.length; i++) {
          if (options[i].isHeader) break;
          if (matches[i]) return true;
        }
        return false;
      }
      return opt.label.toLowerCase().includes(query.toLowerCase());
    });
  }, [options, query]);

  const hasExactMatch = options.some(
    (opt) => opt.label.toLowerCase() === query.trim().toLowerCase(),
  );

  const bg = selectedOption?.color;
  const textColor = bg ? (isColorDark(bg) ? "#fff" : "#000") : undefined;
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  return (
    <div className={twMerge("relative w-full", className)}>
      {label && (
        <FormLabel className={twMerge("mb-4 block", labelClass)}>
          {label} {isMandatory && <span className="text-red-500">*</span>}
        </FormLabel>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={twMerge(
              "w-full font-extralight hover:bg-white justify-between text-left text-black overflow-hidden whitespace-nowrap text-ellipsis relative",
              className,
            )}
            style={{
              backgroundColor: bg,
              color: textColor,
              borderColor: bg,
            }}
            disabled={disabled}
          >
            <span
              className={twMerge(
                "truncate pr-10",
                selectedValues.length === 0 && "text-gray-500",
              )}
              style={{
                color: selectedValues.length > 0 ? textColor : undefined,
              }}
            >
              {selectedValues.length > 0
                ? options
                    .filter((opt) => selectedValues.includes(opt.value))
                    .map((opt) => opt.label)
                    .join(", ")
                : placeholder}
            </span>

            {selectedOption && isCrossShow ? (
              <span
                className="absolute right-8 h-4 w-4 text-gray-500 hover:text-red-500 cursor-pointer z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect({ value: "", label: "" });
                  setOpen(false);
                }}
                onMouseDown={(e) => e.preventDefault()}
              >
                <X className="h-4 w-4" style={{ color: textColor }} />
              </span>
            ) : null}

            <ChevronDown
              className="absolute right-3 text-gray-500"
              style={{ color: textColor }}
            />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className={twMerge(
            `p-0 pointer-events-auto z-[9999] ${dropdownClass}`,
          )}
          style={{ width: "var(--radix-popover-trigger-width)" }}
        >
          {isSearchable && (
            <div className="p-2">
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (onSearchChange) onSearchChange(e.target.value);
                }}
                placeholder="Search..."
                className="h-9"
              />
            </div>
          )}

          <div
            className="max-h-60 overflow-y-auto"
            onWheel={(e) => e.stopPropagation()}
          >
            {filteredOptions.length > 0 ? (
              <>
                {filteredOptions.map((item, index) => {
                  if (item.isHeader) {
                    return (
                      <div
                        key={`header-${index}`}
                        className="px-4 py-1 text-[12px] font-semibold items-center  justify-center flex text-primary  tracking-wider bg-gray-100"
                      >
                        {item.label}
                      </div>
                    );
                  }
                  if (item.isFooterNote) {
                    return (
                      <div
                        key={`footer-${index}`}
                        className="px-3 py-2 text-xs text-slate-500 italic border-t border-slate-100 bg-slate-50/80 text-center mt-1 select-none"
                      >
                        {item.label}
                      </div>
                    );
                  }
                  return (
                    <div
                      key={item.value}
                      className="px-2 py-1"
                      onClick={() => {
                        onSelect(item);
                        if (!multiSelect) {
                          setQuery("");
                          setOpen(false);
                        }
                      }}
                    >
                      <div
                        className={twMerge(
                          "cursor-pointer text-sm py-1 flex items-center justify-between rounded-sm transition-colors duration-200",
                          selectedValues.includes(item.value)
                            ? "bg-gray-100 px-2 text-gray-900"
                            : "hover:bg-gray-100 px-2 hover:text-gray-900",
                        )}
                      >
                        <div className="flex items-center gap-2 overflow-hidden flex-1 mr-2">
                          <span className="truncate">{item.label}</span>
                          {onActionClick &&
                            selectedValues.includes(item.value) && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onActionClick(item.value, e);
                                }}
                                className={twMerge(
                                  "ml-auto px-2.5 py-0.5 rounded text-xs font-semibold select-none transition-all duration-200 border",
                                  actionActiveValues?.includes(item.value)
                                    ? "bg-[#2f328e] hover:bg-[#1e205e] text-white border-[#2f328e] shadow-sm"
                                    : "bg-white hover:bg-slate-100 text-slate-700 border-gray-200 hover:border-gray-300",
                                )}
                              >
                                {actionActiveValues?.includes(item.value)
                                  ? activeActionText || "Active"
                                  : actionText || "Action"}
                              </button>
                            )}
                        </div>
                        {selectedValues.includes(item.value) && (
                          <Check className="h-4 w-4 text-primary shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })}
                {footerText && (
                  <div className="px-3 py-2 text-xs text-slate-500 italic border-t border-slate-100 bg-slate-50/80 text-center mt-1 select-none">
                    {footerText}
                  </div>
                )}
                {!hasExactMatch && query.trim() && onAddNew && (
                  <div className="px-2 py-1 border-t border-gray-100">
                    <div
                      className="px-2 py-1.5 text-sm text-primary hover:bg-gray-100 rounded-sm cursor-pointer font-medium"
                      onClick={() => {
                        onAddNew(query);
                        setOpen(false);
                        setQuery("");
                      }}
                    >
                      Add new "{query}"
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-1">
                {onAddNew && query.trim() ? (
                  <div
                    className="px-3 py-2 text-sm text-primary hover:bg-gray-100 rounded-sm cursor-pointer font-medium"
                    onClick={() => {
                      onAddNew(query);
                      setOpen(false);
                      setQuery("");
                    }}
                  >
                    Add new "{query}"
                  </div>
                ) : (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    No results found
                  </div>
                )}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {error?.message && (
        <span className="text-red-600 text-[calc(1em-3px)] tb:text-[calc(1em-2px)] before:content-['*']">
          {error.message}
        </span>
      )}
    </div>
  );
};

export default SearchDropdown;
