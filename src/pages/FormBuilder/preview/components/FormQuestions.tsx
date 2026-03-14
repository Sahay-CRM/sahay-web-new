import { useState } from "react";
import { AlertCircle, Check, ChevronDown, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ResponseData } from "../hooks/useFormPreviewPage";

interface FormQuestionsProps {
  form: FormDetails;
  responses: ResponseData;
  updateResponse: (
    fieldId: string,
    value: string | string[] | File | FileList,
  ) => void;
  fieldErrors: Record<string, string>;
  setResponses: (data: ResponseData) => void;
  handleSubmit: () => void;
  isUploading: boolean;
  isSubmitting: boolean;
  isSubmittingForm: boolean;
  isPreview?: boolean;
}

// ── Inline field-level validation helpers ─────────────────────────────────────
const validatePhone = (val: string) =>
  /^[6-9][0-9]{9}$/.test(val.trim())
    ? ""
    : "Enter a valid 10-digit mobile number starting with 6-9";

const validateEmail = (val: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())
    ? ""
    : "Please enter a valid email address with @ (e.g. user@example.com)";

// ── Main FormQuestions component ──────────────────────────────────────────────
const FormQuestions = ({
  form,
  responses,
  updateResponse,
  fieldErrors,
  setResponses,
  handleSubmit,
  isUploading,
  isSubmitting,
  isSubmittingForm,
  isPreview,
}: FormQuestionsProps) => {
  // Inline validation errors (phone/email — on blur)
  const [inlineErrors, setInlineErrors] = useState<Record<string, string>>({});

  const handleBlurValidation = (
    fieldId: string,
    fieldType: FieldType,
    value: string,
  ) => {
    let err = "";
    if (fieldType === "PHONE" && value) err = validatePhone(value);
    if (fieldType === "EMAIL" && value) err = validateEmail(value);
    setInlineErrors((prev) => ({ ...prev, [fieldId]: err }));
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50/50 p-3 lg:p-5 relative">
      <div className="max-w-[800px] mx-auto space-y-8 pb-20">
        {/* Questions */}
        <div className="space-y-2">
          {(form.fields || []).map((question: Question) => {
            const options: string[] = (() => {
              const raw = question.options as unknown;
              if (typeof raw === "string")
                return (raw as string)
                  .split(",")
                  .map((o) => o.trim())
                  .filter(Boolean);
              if (Array.isArray(raw))
                return (raw as Option[]).map((o) => o.text).filter(Boolean);
              return [];
            })();

            const displayError =
              fieldErrors[question.id] || inlineErrors[question.id];

            return (
              <div
                key={question.id}
                className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm"
              >
                <div className="text-[13px] font-bold text-gray-800 mb-4 flex gap-1.5 leading-tight">
                  {question.label}
                  {question.isRequired && (
                    <span className="text-red-500 font-bold">*</span>
                  )}
                </div>

                <div className="space-y-2">
                  {/* ── RADIO & QUESTION ────────────────────────────────────── */}
                  {(question.fieldType === "RADIO" ||
                    question.fieldType === "QUESTION") && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4">
                      {options.map((opt, idx) => {
                        const isSelected = responses[question.id] === opt;
                        return (
                          <div
                            key={idx}
                            onClick={() => updateResponse(question.id, opt)}
                            className={cn(
                              "flex items-center gap-2.5 p-2.5 rounded-md border cursor-pointer transition-all",
                              isSelected
                                ? "border-[#2f328e] bg-[#2f328e]/5 shadow-sm"
                                : "border-gray-200 bg-gray-50/30 hover:bg-gray-50 hover:border-gray-300",
                            )}
                          >
                            {/* Circle indicator */}
                            <div
                              className={cn(
                                "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
                                isSelected
                                  ? "border-[#2f328e]"
                                  : "border-gray-300",
                              )}
                            >
                              {isSelected && (
                                <div className="w-2 h-2 rounded-full bg-[#2f328e]" />
                              )}
                            </div>
                            <span className="text-sm text-gray-700">{opt}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* ── CHECKBOX ──────────────────────────────────────────── */}
                  {question.fieldType === "CHECKBOX" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4">
                      {options.map((opt, idx) => {
                        const checked = (
                          (responses[question.id] as string[]) || []
                        ).includes(opt);
                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              const current =
                                (responses[question.id] as string[]) || [];
                              const next = current.includes(opt)
                                ? current.filter((v) => v !== opt)
                                : [...current, opt];
                              updateResponse(question.id, next);
                            }}
                            className={cn(
                              "flex items-center gap-2.5 p-2.5 rounded-md border cursor-pointer transition-all",
                              checked
                                ? "border-[#2f328e] bg-[#2f328e]/5 shadow-sm"
                                : "border-gray-200 bg-gray-50/30 hover:bg-gray-50 hover:border-gray-300",
                            )}
                          >
                            {/* Square checkbox indicator */}
                            <div
                              className={cn(
                                "w-4 h-4 rounded-[4px] border-2 flex items-center justify-center shrink-0 transition-all",
                                checked
                                  ? "bg-[#2f328e] border-[#2f328e]"
                                  : "bg-white border-gray-300",
                              )}
                            >
                              {checked && (
                                <Check className="w-2.5 h-2.5 text-white stroke-[3px]" />
                              )}
                            </div>
                            <span className="text-sm text-gray-700">{opt}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* ── SELECT / DROPDOWN ─────────────────────────────────── */}
                  {question.fieldType === "SELECT" && (
                    <div className="relative mt-1">
                      <select
                        value={(responses[question.id] as string) || ""}
                        onChange={(e) =>
                          updateResponse(question.id, e.target.value)
                        }
                        className={cn(
                          "w-full h-11 appearance-none bg-gray-50 border rounded-xl px-4 pr-10 text-sm outline-none transition-all font-medium cursor-pointer",
                          responses[question.id]
                            ? "text-gray-800 border-[#2f328e] bg-white"
                            : "text-gray-400 border-gray-200 hover:border-gray-300 focus:border-[#2f328e] focus:bg-white focus:ring-1 focus:ring-[#2f328e]",
                        )}
                      >
                        <option value="" disabled>
                          {question.placeholder || "Select an option..."}
                        </option>
                        {options.map((opt, idx) => (
                          <option key={idx} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  )}

                  {/* ── PHONE ─────────────────────────────────────────────── */}
                  {question.fieldType === "PHONE" && (
                    <div className="flex gap-2 mt-1">
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder={
                          question.placeholder || "Enter 10-digit mobile number"
                        }
                        value={
                          (responses[question.id] as unknown as string) || ""
                        }
                        onChange={(e) => {
                          const val = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 10);
                          updateResponse(question.id, val);
                          if (inlineErrors[question.id])
                            setInlineErrors((prev) => ({
                              ...prev,
                              [question.id]: "",
                            }));
                        }}
                        onBlur={(e) =>
                          handleBlurValidation(
                            question.id,
                            "PHONE",
                            e.target.value,
                          )
                        }
                        className={cn(
                          "flex-1 h-11 bg-gray-50 border rounded-xl px-4 text-sm focus:ring-1 focus:ring-[#2f328e] focus:bg-white focus:border-[#2f328e] outline-none placeholder:text-gray-400 font-medium",
                          inlineErrors[question.id]
                            ? "border-red-400 bg-red-50/30"
                            : "border-gray-200",
                        )}
                      />
                    </div>
                  )}

                  {/* ── EMAIL ─────────────────────────────────────────────── */}
                  {question.fieldType === "EMAIL" && (
                    <input
                      type="email"
                      placeholder={
                        question.placeholder ||
                        "Enter your email address (e.g. user@example.com)"
                      }
                      value={
                        (responses[question.id] as unknown as string) || ""
                      }
                      onChange={(e) => {
                        updateResponse(question.id, e.target.value);
                        // Clear any existing error while user corrects their input
                        if (inlineErrors[question.id])
                          setInlineErrors((prev) => ({
                            ...prev,
                            [question.id]: "",
                          }));
                      }}
                      onBlur={(e) =>
                        handleBlurValidation(
                          question.id,
                          "EMAIL",
                          e.target.value,
                        )
                      }
                      className={cn(
                        "w-full h-11 bg-gray-50 border rounded-xl px-4 text-sm focus:ring-1 focus:ring-[#2f328e] focus:bg-white focus:border-[#2f328e] outline-none placeholder:text-gray-400 font-medium",
                        inlineErrors[question.id] || fieldErrors[question.id]
                          ? "border-red-400 bg-red-50/30"
                          : "border-gray-200",
                      )}
                    />
                  )}

                  {/* ── TEXT / NUMBER ─────────────────────────────────────── */}
                  {(question.fieldType === "TEXT" ||
                    question.fieldType === "NUMBER") && (
                    <input
                      type={question.fieldType.toLowerCase()}
                      placeholder={
                        question.placeholder || "Enter your response here..."
                      }
                      value={
                        (responses[question.id] as unknown as string) || ""
                      }
                      onChange={(e) =>
                        updateResponse(question.id, e.target.value)
                      }
                      className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm focus:ring-1 focus:ring-[#2f328e] focus:bg-white focus:border-[#2f328e] outline-none placeholder:text-gray-400 font-medium"
                    />
                  )}

                  {/* ── TEXTAREA ──────────────────────────────────────────── */}
                  {question.fieldType === "TEXTAREA" && (
                    <textarea
                      placeholder={
                        question.placeholder ||
                        "Enter your long response here..."
                      }
                      value={
                        (responses[question.id] as unknown as string) || ""
                      }
                      onChange={(e) =>
                        updateResponse(question.id, e.target.value)
                      }
                      className="w-full min-h-[100px] bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[#2f328e] focus:bg-white focus:border-[#2f328e] outline-none placeholder:text-gray-400 font-medium resize-none"
                    />
                  )}

                  {/* ── DATE ──────────────────────────────────────────────── */}
                  {question.fieldType === "DATE" && (
                    <input
                      type="date"
                      value={
                        (responses[question.id] as unknown as string) || ""
                      }
                      onChange={(e) =>
                        updateResponse(question.id, e.target.value)
                      }
                      onKeyDown={(e) => e.preventDefault()}
                      className="w-full h-11 bg-white border border-gray-200 rounded-xl px-4 text-sm focus:ring-1 focus:ring-[#2f328e] focus:bg-white focus:border-[#2f328e] outline-none font-medium cursor-pointer"
                    />
                  )}

                  {/* ── FILE ──────────────────────────────────────────────── */}
                  {question.fieldType === "FILE" && (
                    <div
                      onClick={() =>
                        document.getElementById(`file-${question.id}`)?.click()
                      }
                      className="w-full py-4 px-4 border border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:bg-gray-50 group"
                    >
                      <input
                        type="file"
                        id={`file-${question.id}`}
                        className="hidden"
                        onChange={(e) =>
                          e.target.files?.[0] &&
                          updateResponse(question.id, e.target.files[0])
                        }
                      />
                      <Upload className="w-4 h-4 text-gray-400" />
                      <p className="text-xs text-gray-600">
                        {responses[question.id]
                          ? (responses[question.id] as File).name
                          : "Upload document"}
                      </p>
                      <p className="text-[9px] text-gray-400">
                        PDF, JPG or PNG (Max 5MB)
                      </p>
                    </div>
                  )}
                </div>

                {/* Field Error */}
                {displayError && (
                  <p className="text-[10px] text-red-500 mt-3 flex items-center gap-1.5 font-bold">
                    <AlertCircle className="w-3 h-3" /> {displayError}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Submit Footer */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-center sm:text-left">
            <p className="text-sm font-semibold text-gray-800 leading-tight">
              Ready to finish?
            </p>
            <p className="text-[11px] text-gray-500">
              Review answers before submitting.
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="ghost"
              className="h-9 px-3 text-xs text-gray-500 hover:text-red-500"
              onClick={() =>
                // eslint-disable-next-line no-alert
                window.confirm("Clear all responses?") && setResponses({})
              }
            >
              Clear Form
            </Button>
            <Button
              className="h-9 px-5 text-sm bg-[#2f328e] hover:bg-[#1a1c5d] text-white rounded-lg shadow-sm"
              onClick={() => handleSubmit()}
              disabled={
                isUploading || isSubmitting || isSubmittingForm || isPreview
              }
            >
              {isUploading || isSubmitting || isSubmittingForm ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                "Submit Response"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormQuestions;
