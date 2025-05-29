import { FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { forwardRef } from "react";
import FormSelect from "../FormSelect/FormSelect";
import { cn } from "@/lib/utils";
interface Option {
  value: string;
  label: string;
}
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  type?: string;
  id?: string;
  label?: string;
  labelClass?: string;
  placeholder?: string;
  className?: string;
  error?: { message?: string };
  containerClass?: string;
  isMandatory?: boolean | number;
  options?: Option[];
  selectedCodeValue?: string;
  onCountryCodeChange?: (value: string) => void;
}

const FormInputField = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      id,
      label,
      placeholder,
      className = "",
      containerClass = "",
      error,
      isMandatory = false,
      options,
      selectedCodeValue,
      onCountryCodeChange,
      ...rest
    },
    ref,
  ) => {
    const handleCodeChange: (value: string) => void =
      onCountryCodeChange || (() => {});
    return (
      <FormItem className={containerClass}>
        {label && (
          <FormLabel>
            {label}{" "}
            {isMandatory && <span className="text-red-500 text-[20px]">*</span>}
          </FormLabel>
        )}
        <div className="flex gap-x-2 text-[20px]">
          {options && (
            <FormSelect
              id={`${id}-select`}
              options={options}
              value={selectedCodeValue}
              onChange={() => handleCodeChange}
              disabled={rest.disabled}
              className="mt-2"
            />
          )}
          <FormControl>
            <Input
              id={id}
              placeholder={placeholder}
              className={cn("text-[20px] mt-2", className)}
              {...rest}
              ref={ref}
            />
          </FormControl>
        </div>
        {error?.message && (
          <span className="text-red-600 text-[calc(1em-1px)] tb:text-[calc(1em-2px)] before:content-['*']">
            {error.message}
          </span>
        )}
      </FormItem>
    );
  },
);
export default FormInputField;
