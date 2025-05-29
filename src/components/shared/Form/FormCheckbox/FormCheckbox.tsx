import { forwardRef, InputHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

interface FormCheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  id?: string;
  label?: string;
  labelClass?: string;
  className?: string;
  error?: {
    message: string;
  };
  containerClass?: string;
}

const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
  (
    { id, label, labelClass, className = "", error, containerClass, ...rest },
    ref,
  ) => {
    return (
      <div
        className={twMerge("flex items-center mt-0 tb:mt-3", containerClass)}
      >
        <input
          {...rest}
          type="checkbox"
          id={id}
          className={twMerge(
            "accent-gray-700 aspect-square cursor-pointer w-4 h-4 tb:w-4 disabled:cursor-not-allowed",
            className,
          )}
          ref={ref}
        />
        {label && (
          <label
            className={twMerge("ms-2 leading-none", labelClass)}
            htmlFor={id}
          >
            {label}
          </label>
        )}
        {error && (
          <span className="text-red-600 text-[calc(1em-1px)] tb:text-[calc(1em-2px)] before:content-['*'] before:me-1 whitespace-nowrap">
            {error.message}
          </span>
        )}
      </div>
    );
  },
);

export default FormCheckbox;
