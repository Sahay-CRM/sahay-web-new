import { AlertCircle, Check, Loader2, Timer } from "lucide-react";

export const LoadingScreen = () => (
  <div className="min-h-screen bg-[#f0ebf8] flex flex-col items-center justify-center p-4">
    <Loader2 className="h-10 w-10 animate-spin text-[#2f328e] mb-4" />
    <p className="text-gray-600 font-medium">Loading form...</p>
  </div>
);

// ── Already Submitted ────────────────────────────────────────────────────────
interface AlreadySubmittedScreenProps {
  form?: FormDetails;
}

export const AlreadySubmittedScreen = ({
  form,
}: AlreadySubmittedScreenProps) => (
  <div className="min-h-screen bg-[#f0ebf8] flex flex-col items-center justify-center p-4">
    <div className="bg-white max-w-md w-full rounded-2xl shadow-lg p-10 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
        <AlertCircle className="h-8 w-8 text-red-500" />
      </div>
      <h1 className="text-2xl font-bold text-gray-800">
        {form?.name || "Form"}
      </h1>
      {form?.description && (
        <p className="text-sm text-gray-500">{form.description}</p>
      )}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <p className="text-red-700 font-medium text-sm">
          This mobile number has already submitted a response for this form.
        </p>
        <p className="text-red-600 text-xs mt-2">
          Each mobile number can only submit one response.
        </p>
      </div>
    </div>
  </div>
);

// ── Submitted Success Screen ─────────────────────────────────────────────────
interface SubmittedScreenProps {
  form?: FormDetails;
  submissionReason: { code: string; message: string } | null;
  scoreString?: string | null;
  submissionMessage?: string | null;
}

const FormattedMessage = ({ text }: { text: string }) => {
  // Split by newlines first
  const lines = text.split("\n");

  return (
    <div className="space-y-3">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-2" />;

        // Handle **bold** text within each line
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={i} className="text-gray-600 text-sm leading-relaxed">
            {parts.map((part, j) => {
              if (part.startsWith("**") && part.endsWith("**")) {
                return (
                  <strong key={j} className="font-bold text-gray-800">
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              return part;
            })}
          </p>
        );
      })}
    </div>
  );
};

export const SubmittedScreen = ({
  form,
  submissionReason,
  scoreString,
  submissionMessage,
}: SubmittedScreenProps) => (
  <div className="min-h-screen bg-[#f0ebf8] flex flex-col items-center justify-center p-4">
    <div className="bg-white max-w-md w-full rounded-2xl shadow-lg p-10 text-center space-y-6">
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
        <Check className="h-10 w-10 text-green-600" />
      </div>
      <h1 className="text-2xl font-bold text-gray-800">
        {form?.name || "Form"}
      </h1>

      <div className="space-y-4">
        {submissionMessage ? (
          <div className="space-y-4">
            {scoreString && (
              <div className="py-2 mb-5 px-4 bg-emerald-50 rounded-lg inline-block">
                <p className="text-emerald-700 font-bold text-xl">
                  Your Score: {scoreString}
                </p>
              </div>
            )}
            <div className="text-left bg-gray-50/50 rounded-xl p-6 border border-gray-100">
              <FormattedMessage text={submissionMessage} />
            </div>
          </div>
        ) : (
          <>
            <p className="text-green-700 font-semibold text-lg">
              {submissionReason
                ? "Form Auto-Submitted"
                : "Successfully Submitted!"}
            </p>
            {scoreString && (
              <div className="py-2 px-4 bg-emerald-50 rounded-lg inline-block">
                <p className="text-emerald-700 font-bold text-xl">
                  Your Score: {scoreString}
                </p>
              </div>
            )}
            <p className="text-gray-500 text-sm">
              {submissionReason
                ? "Your response was automatically recorded due to a proctoring event."
                : form?.responseMessage ||
                  "Thank you for filling out this form. Your response has been recorded."}
            </p>
          </>
        )}
      </div>

      {submissionReason && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-xl space-y-2 text-left">
          <div className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase tracking-wider">
            <AlertCircle className="w-4 h-4" />
            Submission Reason
          </div>
          <p className="text-sm font-semibold text-red-700 leading-snug">
            {submissionReason.message}
          </p>
        </div>
      )}

      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <p className="text-green-600 text-xs">
          Powered by TrackBiz Health Secure Proctoring
        </p>
      </div>
    </div>
  </div>
);

// ── Form Not Found ───────────────────────────────────────────────────────────
export const FormNotFoundScreen = () => (
  <div className="min-h-screen bg-[#f0ebf8] flex flex-col items-center justify-center p-4">
    <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
    <h1 className="text-2xl font-bold text-gray-800">Form Not Found</h1>
    <p className="text-gray-600 mt-2">
      The form you are looking for does not exist or has been removed.
    </p>
  </div>
);

// ── Timer Over ───────────────────────────────────────────────────────────────
export const TimerOverScreen = () => (
  <div className="min-h-screen bg-[#f0ebf8] flex flex-col items-center justify-center p-4">
    <div className="bg-white max-w-md w-full rounded-2xl shadow-lg p-10 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
        <Timer className="h-8 w-8 text-red-500" />
      </div>
      <h1 className="text-2xl font-bold text-gray-800">Time Limit Over!</h1>
      <p className="text-gray-600">
        The time allocated for this form has expired. Your responses have been
        automatically submitted.
      </p>
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <p className="text-red-700 font-medium text-sm">Session Closed</p>
      </div>
    </div>
  </div>
);
