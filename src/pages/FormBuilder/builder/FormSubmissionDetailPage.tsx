import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { useGetFormSubmissionDetail } from "@/features/api/Form";
import { Badge } from "@/components/ui/badge";
import { ImageBaseURL } from "@/features/utils/urls.utils";
import {
  ArrowLeft,
  Loader2,
  FileText,
  AlertCircle,
  Calendar,
  User,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FormSubmissionDetailPage() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const { setBreadcrumbs } = useBreadcrumbs();
  const { data: detailData, isLoading } = useGetFormSubmissionDetail(
    submissionId || "",
  );
  const submission = detailData?.data;

  useEffect(() => {
    if (submission) {
      setBreadcrumbs([
        { label: "Forms", href: "/dashboard/forms" },
        {
          label: "Responses",
          href: `/dashboard/form-responses/${submission.formId}`,
        },
        { label: "Detail", href: "" },
      ]);
    }
  }, [setBreadcrumbs, submission]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-[#2f328e]" />
        <span className="ml-2 text-sm text-gray-500">Loading detail...</span>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-gray-500">Submission not found</p>
        <Button variant="link" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full px-2 sm:px-4 py-4 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-gray-500"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="font-semibold text-xl text-black">
            Submission Details
          </h1>
          <p className="text-xs text-gray-500">{submission.form.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Basic Info */}
        <Card className="md:col-span-1 shadow-sm border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <User className="h-4 w-4" /> Submission Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 capitalize">Status</span>
              <Badge
                variant={
                  submission.status === "SUBMITTED" ? "default" : "destructive"
                }
                className="w-fit mt-1"
              >
                {submission.status.replace(/_/g, " ")}
              </Badge>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">Mobile Number</span>
              <span className="text-sm font-medium flex items-center gap-1 mt-1">
                <Phone className="h-3 w-3 text-gray-400" />{" "}
                {submission.mobileNumber}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">Submitted At</span>
              <span className="text-sm font-medium flex items-center gap-1 mt-1">
                <Calendar className="h-3 w-3 text-gray-400" />{" "}
                {new Date(submission.createdAt).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Responses */}
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="pb-3 border-b border-gray-50">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <FileText className="h-4 w-4" /> Form Responses
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {(submission.formResponses?.length || 0) === 0 ? (
                <p className="text-gray-400 text-center py-4 text-sm">
                  No response data available
                </p>
              ) : (
                <div className="space-y-6">
                  {submission.formResponses.map((resp) => (
                    <div
                      key={resp.id}
                      className="group border-b border-gray-50 pb-4 last:border-0 last:pb-0"
                    >
                      <p className="text-xs font-medium text-gray-400 mb-1">
                        {resp.field?.label}
                      </p>
                      <div className="text-sm text-gray-800">
                        {resp.field?.fieldType === "FILE" ||
                        (resp.value && resp.value.startsWith("/share/")) ? (
                          <a
                            href={`${ImageBaseURL}${resp.value}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                          >
                            <FileText className="h-4 w-4" />
                            View Attached File
                          </a>
                        ) : (
                          <div className="bg-slate-50/50 p-3 rounded-md border border-slate-100 min-h-[40px] flex items-center">
                            {resp.value || (
                              <span className="text-gray-300 italic">
                                Empty
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Errors if any */}
          {submission.formErrors && submission.formErrors.length > 0 && (
            <Card className="shadow-sm border-red-100 bg-red-50/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-red-600 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" /> Validation Errors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {submission.formErrors.map((err) => (
                    <li
                      key={err.id}
                      className="text-sm text-red-600 flex items-start gap-2"
                    >
                      <span className="mt-1.5 h-1 w-1 rounded-full bg-red-600 flex-shrink-0" />
                      {err.errorMessage}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
