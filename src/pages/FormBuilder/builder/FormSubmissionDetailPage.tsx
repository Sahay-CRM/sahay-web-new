import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { useGetFormSubmissionDetail } from "@/features/api/Form";
import { Badge } from "@/components/ui/badge";
import { ImageBaseURL } from "@/features/utils/urls.utils";
import { useState, useMemo, useEffect } from "react";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Phone,
  Download,
  Clock,
  Maximize2,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatToProjectDateTime } from "@/features/utils/formatting.utils";
import { Card, CardContent } from "@/components/ui/card";
import { useParams } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export default function FormSubmissionDetailPage() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const { setBreadcrumbs } = useBreadcrumbs();
  const { data: detailData, isLoading } = useGetFormSubmissionDetail(
    submissionId || "",
  );
  const submission = detailData?.data;

  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [screenshotPage, setScreenshotPage] = useState(1);
  const [isAlertExpanded, setIsAlertExpanded] = useState(false); // Toggle for errors
  const screenshotPageSize = 8;

  const screenshots = useMemo(() => {
    return submission?.formMedia?.filter((m) => m.fileType === "4010") || [];
  }, [submission]);

  const paginatedScreenshots = useMemo(() => {
    const start = (screenshotPage - 1) * screenshotPageSize;
    return screenshots.slice(start, start + screenshotPageSize);
  }, [screenshots, screenshotPage]);

  const totalScreenshotPages = Math.ceil(
    screenshots.length / screenshotPageSize,
  );

  useEffect(() => {
    if (submission) {
      setBreadcrumbs([
        { label: "Forms", href: "/dashboard/forms" },
        {
          label: submission.form.name,
          href: `/dashboard/forms/${submission.form.id}/responses`,
        },
        { label: "Detail", href: "" },
      ]);
    }
  }, [setBreadcrumbs, submission]);

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    );
  if (!submission) return null;

  return (
    <div className="h-full bg-[#f1f3f5] w-full flex flex-col overflow-hidden">
      {/* 1. Navigation Header */}
      <nav className="bg-white border-b px-4 py-3 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-lg font-bold text-slate-800 leading-none">
              {submission.name}
            </h1>
            <p className="text-sm text-gray-400 font-bold mt-1 uppercase">
              {submission.mobileNumber}
            </p>
          </div>
        </div>
        <div className="text-right">
          <Badge className="bg-blue-600 text-xs font-black h-7 px-4 rounded-full border-none uppercase flex items-center justify-center">
            {submission.status?.replace(/_/g, " ")}
          </Badge>
          <p className="text-sm font-bold mt-1 uppercase text-slate-500">
            {formatToProjectDateTime(submission.createdAt)}
          </p>
        </div>
      </nav>

      {/* 2. Main Content Container */}
      <div className="flex-1 overflow-hidden p-4 flex flex-col gap-4">
        {/* Security Alerts with "View More" Logic */}
        {/* Security Alerts with Bullet List Logic */}
        {submission.formErrors && submission.formErrors.length > 0 && (
          <div className="bg-red-50 border border-red-100 rounded-lg p-3 shrink-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 overflow-hidden w-full">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="flex flex-col w-full">
                  <span className="text-sm font-black text-red-800 uppercase mb-1">
                    Alerts ({submission.formErrors.length}):
                  </span>

                  {isAlertExpanded ? (
                    /* Expanded: Bullet List */
                    <ul className="list-disc list-inside space-y-1">
                      {submission.formErrors.map((e, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-red-600 font-medium leading-relaxed"
                        >
                          {e.errorMessage}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    /* Collapsed: Single Line Truncated */
                    <div className="text-sm text-red-600 font-medium truncate max-w-[70vw]">
                      {submission.formErrors
                        .map((e) => e.errorMessage)
                        .join(" | ")}
                    </div>
                  )}
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="text-red-700 hover:bg-red-100 h-7 text-xs font-bold shrink-0 self-start"
                onClick={() => setIsAlertExpanded(!isAlertExpanded)}
              >
                {isAlertExpanded ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-1" /> Hide
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-1" /> View All
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* --- DYNAMIC GRID LAYOUT --- */}
        <div className="flex-1 flex gap-4 overflow-hidden min-h-0">
          {/* LEFT COLUMN: Takes full width if screenshots are empty */}
          <Card
            className={cn(
              "flex flex-col border-none shadow-sm rounded-xl overflow-hidden bg-white transition-all duration-300",
              screenshots.length > 0 ? "flex-[0.9]" : "flex-1",
            )}
          >
            <div className="bg-gray-50/80 px-4 py-3 border-b flex justify-between items-center">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                Form Responses
              </span>
              <span className="text-sm font-bold text-slate-500 flex items-center gap-2">
                <Phone className="w-4 h-4" /> {submission.mobileNumber}
              </span>
            </div>
            <CardContent className="flex-1 overflow-y-auto p-5 custom-scrollbar">
              <div
                className={cn(
                  "grid gap-x-6 gap-y-5",
                  screenshots.length > 0 ? "grid-cols-2" : "grid-cols-3", // Expand columns if more space
                )}
              >
                {submission.formResponses?.map((resp) => {
                  const isUrl =
                    resp.value &&
                    (resp.value.startsWith("http") ||
                      resp.value.includes("/media/"));
                  const isFile = resp.field?.fieldType === "FILE" || isUrl;

                  return (
                    <div key={resp.id} className="space-y-1.5 group">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-tight truncate block">
                        {resp.field?.label}
                      </label>
                      <div
                        className={cn(
                          "text-sm font-bold px-4 py-3 rounded-lg border border-gray-100 transition-all",
                          isFile
                            ? "bg-blue-50/30 border-blue-100 text-blue-700"
                            : "bg-gray-50/50 text-slate-700 hover:bg-white hover:border-blue-100",
                        )}
                      >
                        {isFile ? (
                          <div className="flex items-center justify-between gap-2 overflow-hidden">
                            <span className="truncate">
                              {resp.value.split("/").pop() || "Attachment"}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-blue-600 hover:bg-blue-100"
                              onClick={() =>
                                window.open(
                                  resp.value.startsWith("http")
                                    ? resp.value
                                    : `${ImageBaseURL}${resp.value}`,
                                )
                              }
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="truncate">
                            {resp.value || (
                              <span className="text-gray-300 font-normal">
                                --
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* RIGHT COLUMN: Only rendered if screenshots exist */}
          {screenshots.length > 0 && (
            <Card className="flex-[0.6] flex flex-col border-none shadow-sm rounded-xl overflow-hidden bg-white animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-gray-50/80 px-4 py-3 border-b flex justify-between items-center">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  Screenshots ({screenshots.length})
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400">
                    PAGE {screenshotPage}/{totalScreenshotPages}
                  </span>
                  <div className="flex gap-1.5">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 rounded-md disabled:opacity-30"
                      onClick={() =>
                        setScreenshotPage((p) => Math.max(1, p - 1))
                      }
                      disabled={screenshotPage === 1}
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 rounded-md disabled:opacity-30"
                      onClick={() =>
                        setScreenshotPage((p) =>
                          Math.min(totalScreenshotPages, p + 1),
                        )
                      }
                      disabled={screenshotPage === totalScreenshotPages}
                    >
                      <ArrowLeft className="w-4 h-4 rotate-180" />
                    </Button>
                  </div>
                </div>
              </div>
              <CardContent className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-900/5">
                <div className="grid grid-cols-2 gap-4">
                  {paginatedScreenshots.map((media) => (
                    <div
                      key={media.id}
                      onClick={() =>
                        setSelectedImg(`${ImageBaseURL}${media.fileUrl}`)
                      }
                      className="group relative aspect-video bg-white rounded-lg overflow-hidden cursor-pointer border border-gray-100 hover:border-blue-500 transition-all shadow-sm"
                    >
                      <img
                        src={`${ImageBaseURL}${media.fileUrl}`}
                        className="w-full h-full object-cover"
                        alt="Audit"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Maximize2 className="w-5 h-5 text-white hover:scale-110 transition-transform" />
                      </div>
                      <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded text-[10px] font-bold text-white flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-blue-300" />{" "}
                        {formatToProjectDateTime(media.createdAt).split(" ")[1]}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* 3. Landscape Preview Modal */}
      <Dialog open={!!selectedImg} onOpenChange={() => setSelectedImg(null)}>
        <DialogContent className="max-w-[95vw] w-full max-h-[90vh] p-0 bg-white border-none overflow-hidden rounded-2xl flex flex-col shadow-2xl">
          <div className="px-6 py-4 border-b flex items-center justify-between shrink-0">
            <span className="text-sm font-black text-gray-500 uppercase">
              {submission.name} - Evidence
            </span>
            <DialogClose className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5 text-slate-500" />
            </DialogClose>
          </div>
          <div className="flex-1 bg-gray-100/50 flex items-center justify-center p-4 overflow-hidden min-h-[500px]">
            {selectedImg && (
              <img
                src={selectedImg}
                className="max-w-full max-h-full object-contain rounded shadow-xl bg-white"
                alt="Preview"
              />
            )}
          </div>
          <DialogFooter className="bg-white border-t px-6 py-4 flex items-center justify-end gap-3 shrink-0">
            <Button
              variant="outline"
              className="font-bold text-sm h-10 px-6"
              onClick={() => setSelectedImg(null)}
            >
              Close
            </Button>
            <Button
              className="bg-blue-600 text-white font-bold text-sm h-10 px-6"
              onClick={() => window.open(selectedImg!)}
            >
              <Download className="w-4 h-4 mr-2" /> Download Original
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
