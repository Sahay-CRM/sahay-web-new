import { useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ArrowDown, Check, CheckIcon } from "lucide-react";
import { twMerge } from "tailwind-merge";

interface Option {
  value: string | number;
  label: string | number;
}

interface MultiIconSelectProps {
  value: string[];
  options: Option[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  searchable?: boolean;
  className?: string;
  triggerClassName?: string;
}

export default function MultiIconSelect({
  value = [],
  options,
  onChange,
  disabled = false,
  searchable = false,
  className = "",
  triggerClassName = "",
}: MultiIconSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = searchable
    ? options.filter((opt) =>
        String(opt.label).toLowerCase().includes(search.toLowerCase()),
      )
    : options;

  const toggle = (val: string) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={twMerge(
              "flex items-center cursor-pointer justify-center w-6 h-6 rounded-full transition-all duration-200",
              "border-white/90 text-white", // keep button style constant
              triggerClassName,
            )}
          >
            {value.length > 0 ? (
              <Check className="w-4 h-4" /> // icon when something is selected
            ) : (
              <ArrowDown className="w-4 h-4" /> // default icon
            )}
          </button>
        </PopoverTrigger>

        <PopoverContent className=" text-sm" align="start">
          {searchable && (
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-2"
            />
          )}

          <div className="max-h-60 overflow-auto">
            {filtered.map((opt) => {
              const val = String(opt.value);
              const selected = value.includes(val);

              return (
                <div
                  key={val}
                  className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded cursor-pointer"
                  onClick={() => toggle(val)}
                >
                  <input type="checkbox" checked={selected} readOnly />
                  <span>{opt.label}</span>

                  {selected && <CheckIcon className="ml-auto text-blue-500" />}
                </div>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
