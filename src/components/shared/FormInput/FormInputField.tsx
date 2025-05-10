import { FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { forwardRef } from "react";

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
      ...rest
    },
    ref,
  ) => {
    return (
      <FormItem className={containerClass}>
        {label && (
          <FormLabel>
            {label} {isMandatory && <span className="text-red-500">*</span>}
          </FormLabel>
        )}
        <FormControl>
          <Input
            id={id}
            placeholder={placeholder}
            className={className}
            {...rest}
            ref={ref}
          />
        </FormControl>
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
