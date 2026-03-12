import { Check } from "lucide-react";
import type { ResponseData } from "../hooks/useFormPreviewPage";

interface FormSidebarProps {
  verifiedName: string;
  verifiedMobile: string;
  formSettings: FormSettings;
  form: FormDetails;
  responses: ResponseData;
  getRules: () => string[];
}

const FormSidebar = ({
  verifiedName,
  verifiedMobile,
  formSettings,
  form,
  responses,
  getRules,
}: FormSidebarProps) => {
  const rules = getRules();

  return (
    <div className="w-[300px] bg-white border-r border-gray-200 hidden lg:flex flex-col p-4 space-y-5 shadow-[1px_0_5px_rgba(0,0,0,0.02)] overflow-y-auto shrink-0 custom-scrollbar">
      {/* Candidate Profile */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          Candidate Profile
        </h3>
        <div className="bg-slate-50 p-4 rounded-xl border border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#2f328e] text-white flex items-center justify-center font-bold text-base">
            {verifiedName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-bold text-gray-800 truncate">
              {verifiedName}
            </p>
            <p className="text-[9px] text-gray-500 font-medium">
              +91 {verifiedMobile}
            </p>
          </div>
        </div>
      </div>

      {/* Proctored Rules */}
      {rules.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Session Rules
            </h3>
            <div className="flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full">
              <Check className="w-2.5 h-2.5 text-green-600" />
              <span className="text-[9px] text-green-600 font-bold uppercase">
                Active
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="bg-slate-50 p-4 rounded-xl border border-gray-100 space-y-3">
              {rules.map((rule, i) => (
                <div key={i} className="flex items-start gap-3 group">
                  <div className="mt-2 w-1.5 h-1.5 rounded-full bg-[#2f328e]/40 group-hover:bg-[#2f328e]" />
                  <p className="text-[13px] text-gray-700 font-semibold leading-relaxed">
                    {rule}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-orange-600 bg-orange-50 p-3 rounded-lg border border-orange-100 font-bold leading-relaxed text-center">
              Warning: Any violation will result in auto-submission.
            </p>
          </div>
        </div>
      )}

      {/* Progress Stats */}
      {formSettings.showProgressBar && (
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Total Progress
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-gray-500">Completion</span>
              <span className="text-[#2f328e]">
                {Math.round(
                  (Object.keys(responses).length / (form.fields?.length || 1)) *
                    100,
                )}
                %
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2f328e]"
                style={{
                  width: `${(Object.keys(responses).length / (form.fields?.length || 1)) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormSidebar;
