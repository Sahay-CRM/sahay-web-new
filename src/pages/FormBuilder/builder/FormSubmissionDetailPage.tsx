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
  Image as ImageIcon,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatToProjectDateTime } from "@/features/utils/formatting.utils";
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

      {/* 1. Project-Style Info Bar - Compact */}
      <Card className="shadow-sm border-gray-200 overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 lg:divide-x divide-gray-100">
            <div className="p-4 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                Status
              </span>
              <Badge
                variant={
                  submission.status === "SUBMITTED" ? "default" : "destructive"
                }
                className={`w-fit h-5 px-2 text-[9px] font-semibold uppercase ${submission.status === "SUBMITTED" ? "bg-[#2f328e]" : ""}`}
              >
                {submission.status.replace(/_/g, " ")}
              </Badge>
            </div>
            <div className="p-4 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                User Name
              </span>
              <span className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-[#2f328e]/60" />
                {submission.name || "Anonymous"}
              </span>
            </div>
            <div className="p-4 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                Mobile Number
              </span>
              <span className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-[#2f328e]/60" />
                {submission.mobileNumber}
              </span>
            </div>
            <div className="p-4 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                Submitted At
              </span>
              <span className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-[#2f328e]/60" />
                {formatToProjectDateTime(submission.createdAt)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Validation Errors - Alert Style */}
      {submission.formErrors && submission.formErrors.length > 0 && (
        <Card className="shadow-sm border-red-100 bg-red-50/10">
          <CardHeader className="py-2 px-4 border-b border-red-50 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[11px] font-bold text-red-600 flex items-center gap-2 uppercase tracking-tight">
              <AlertCircle className="h-3.5 w-3.5" /> Validation Errors (
              {submission.formErrors.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="max-h-[150px] overflow-y-auto space-y-2 custom-scrollbar">
              {submission.formErrors.map((err) => (
                <div
                  key={err.id}
                  className="flex items-start gap-2 text-xs text-red-600 font-medium"
                >
                  <div className="mt-1 h-1 w-1 rounded-full bg-red-500 shrink-0" />
                  <span>{err.errorMessage}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 3. Balanced Data Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch pb-6">
        {/* Responses Column */}
        <div className="h-full">
          <Card className="shadow-sm border-gray-100 h-full flex flex-col bg-white">
            <CardHeader className="py-3 px-4 border-b border-gray-50 bg-gray-50/30">
              <div className="flex justify-between items-center">
                <CardTitle className="text-[11px] font-bold text-[#2f328e] flex items-center gap-2 uppercase tracking-tight">
                  <FileText className="h-3.5 w-3.5" /> Form Responses
                </CardTitle>
                <span className="text-[10px] font-medium text-gray-400">
                  {submission.formResponses?.length || 0} Fields
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
              <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto custom-scrollbar">
                {(submission.formResponses?.length || 0) === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-gray-400 text-xs italic">
                      No entries found.
                    </p>
                  </div>
                ) : (
                  submission.formResponses.map((resp) => (
                    <div
                      key={resp.id}
                      className="p-4 hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">
                          {resp.field?.label}
                        </label>
                        <div className="text-sm">
                          {resp.field?.fieldType === "FILE" ||
                          (resp.value && resp.value.startsWith("/share/")) ? (
                            <div className="mt-1 flex flex-col gap-3">
                              <a
                                href={`${ImageBaseURL}${resp.value}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#2f328e]/5 text-[#2f328e] rounded border border-[#2f328e]/10 hover:bg-[#2f328e]/10 transition-all text-xs font-semibold"
                              >
                                <FileText className="h-3.5 w-3.5" />
                                View Document
                              </a>
                              {resp.value.match(
                                /\.(jpg|jpeg|png|gif|webp)$/i,
                              ) && (
                                <img
                                  src={`${ImageBaseURL}${resp.value}`}
                                  alt="Preview"
                                  className="max-h-[200px] w-auto rounded border border-gray-200 cursor-pointer shadow-sm"
                                  onClick={() =>
                                    window.open(`${ImageBaseURL}${resp.value}`)
                                  }
                                />
                              )}
                            </div>
                          ) : (
                            <div className="p-3 bg-gray-50/50 rounded border border-gray-100 text-gray-700 font-medium whitespace-pre-wrap">
                              {resp.value || (
                                <span className="text-gray-300 italic">
                                  Empty
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Media Column */}
        <div className="h-full">
          <Card className="shadow-sm border-gray-100 h-full flex flex-col bg-white">
            <CardHeader className="py-3 px-4 border-b border-gray-50 bg-gray-50/30">
              <div className="flex justify-between items-center">
                <CardTitle className="text-[11px] font-bold text-[#2f328e] flex items-center gap-2 uppercase tracking-tight">
                  <ImageIcon className="h-3.5 w-3.5" /> Media Gallery
                </CardTitle>
                <span className="text-[10px] font-medium text-gray-400">
                  {submission.formMedia?.length || 0} Items
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-4 flex-1 overflow-y-auto custom-scrollbar">
              {(submission.formMedia?.length || 0) === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-gray-400 text-xs italic">No recordings.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                  {submission.formMedia.map((media) => (
                    <div
                      key={media.id}
                      className="group relative h-fit bg-gray-50 rounded border border-gray-100 cursor-pointer transition-all hover:border-[#2f328e]/30 shadow-sm"
                      onClick={() =>
                        window.open(`${ImageBaseURL}${media.fileUrl}`)
                      }
                    >
                      <div className="aspect-video relative overflow-hidden rounded-t-[3px]">
                        <img
                          src={`${ImageBaseURL}${media.fileUrl}`}
                          alt="Evidence"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-[#2f328e]/10 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                          <Eye className="h-5 w-5 text-[#2f328e]" />
                        </div>
                      </div>
                      <div className="p-1.5 bg-white flex flex-col border-t border-gray-100">
                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">
                          {formatToProjectDateTime(media.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
