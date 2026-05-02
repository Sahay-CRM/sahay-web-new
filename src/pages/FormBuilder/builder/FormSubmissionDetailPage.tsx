import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { useGetFormSubmissionDetail } from "@/features/api/Form";
import { useSelector } from "react-redux";
import { getUserPermission } from "@/features/selectors/auth.selector";
import CompanyAccessGuard from "@/components/shared/CompanyAccessGuard/CompanyAccessGuard";
import { getCompaniesList } from "@/features/selectors/company.selector";
import PageNotAccess from "../../PageNoAccess";
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
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatToDateTime } from "@/features/utils/formatting.utils";
import { Card, CardContent } from "@/components/ui/card";
import { useParams } from "react-router-dom";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface MediaItem {
  id: string;
  fileUrl: string;
  createdAt: string;
}

export default function FormSubmissionDetailPage() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const { setBreadcrumbs } = useBreadcrumbs();
  const { data: detailData, isLoading } = useGetFormSubmissionDetail(
    submissionId || "",
  );
  const submission = detailData?.data;

  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
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

  const currentIndex = useMemo(() => {
    if (!selectedMedia) return -1;
    return screenshots.findIndex((m: MediaItem) => m.id === selectedMedia.id);
  }, [selectedMedia, screenshots]);

  const handleNext = () => {
    if (currentIndex < screenshots.length - 1) {
      setSelectedMedia(screenshots[currentIndex + 1]);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setSelectedMedia(screenshots[currentIndex - 1]);
    }
  };

  const companiesList = useSelector(getCompaniesList);
  const currentCompany = companiesList?.find((c) => c.isCurrentCompany);
  const resourceCompanyId = submission?.form?.companyId;
  const isAuthorized =
    !submissionId ||
    !resourceCompanyId ||
    resourceCompanyId === currentCompany?.companyId;

  useEffect(() => {
    if (submission) {
      setBreadcrumbs([
        { label: "Forms", href: "/dashboard/forms" },
        ...(isAuthorized
          ? [
              {
                label: submission.formName,
                href: `/dashboard/forms/${submission.form.id}/responses`,
              },
            ]
          : []),
        { label: "Detail", href: "" },
      ]);
    }
  }, [setBreadcrumbs, submission, isAuthorized]);

  const permission = useSelector(getUserPermission).FORM;

  if (permission && permission.View === false) {
    return <PageNotAccess />;
  }

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    );
  if (!submission) return null;

  return (
    <CompanyAccessGuard companyId={resourceCompanyId} isLoading={isLoading}>
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
              {formatToDateTime(submission.updatedAt)}
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
                        <label className="text-xs font-black text-gray-400 uppercase tracking-tight block whitespace-normal leading-normal mb-1">
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
                              <span className="break-words">
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
                            <div className="break-words whitespace-normal">
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
                        onClick={() => setSelectedMedia(media)}
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
                          {formatToDateTime(media.createdAt).split(" ")[1]}
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
        <Dialog
          open={!!selectedMedia}
          onOpenChange={(open) => !open && setSelectedMedia(null)}
        >
          <DialogContent className="max-w-6xl w-[95vw] sm:max-w-6xl max-h-[95vh] p-0 bg-white border-none overflow-hidden rounded-2xl flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b flex items-center justify-between shrink-0">
              <div className="flex flex-col">
                <span className="text-sm font-black text-slate-800 uppercase">
                  {submission.name} - Evidence
                </span>
                {selectedMedia && (
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    Screenshot {currentIndex + 1} of {screenshots.length} •{" "}
                    {formatToDateTime(selectedMedia.createdAt)}
                  </span>
                )}
              </div>
              {/* The default close button from DialogContent will be used */}
            </div>
            <div className="flex-1 bg-gray-100/50 flex items-center justify-center p-4 relative overflow-hidden group/modal min-h-[500px]">
              {/* Floating Navigation Arrows */}
              {currentIndex > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 z-10 h-12 w-12 rounded-full bg-white/80 hover:bg-white shadow-lg border border-gray-100 opacity-0 group-hover/modal:opacity-100 transition-opacity"
                  onClick={handlePrev}
                >
                  <ChevronLeft className="w-6 h-6 text-slate-700" />
                </Button>
              )}
              {currentIndex < screenshots.length - 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 z-10 h-12 w-12 rounded-full bg-white/80 hover:bg-white shadow-lg border border-gray-100 opacity-0 group-hover/modal:opacity-100 transition-opacity"
                  onClick={handleNext}
                >
                  <ChevronRight className="w-6 h-6 text-slate-700" />
                </Button>
              )}

              {selectedMedia && (
                <img
                  key={selectedMedia.id}
                  src={`${ImageBaseURL}${selectedMedia.fileUrl}`}
                  className="max-w-full max-h-full object-contain rounded shadow-xl bg-white animate-in fade-in zoom-in-95 duration-200"
                  alt="Preview"
                />
              )}
            </div>
            <DialogFooter className="bg-white border-t px-6 py-4 flex items-center justify-between gap-3 shrink-0">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-4 font-bold border-gray-200 hover:bg-gray-50"
                  onClick={handlePrev}
                  disabled={currentIndex <= 0}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-4 font-bold border-gray-200 hover:bg-gray-50"
                  onClick={handleNext}
                  disabled={currentIndex >= screenshots.length - 1}
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  className="font-bold text-sm h-9 px-4 text-gray-500 hover:text-gray-700"
                  onClick={() => setSelectedMedia(null)}
                >
                  Close
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm h-9 px-4"
                  onClick={() =>
                    window.open(`${ImageBaseURL}${selectedMedia?.fileUrl}`)
                  }
                >
                  <Download className="w-4 h-4 mr-2" /> Download
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </CompanyAccessGuard>
  );
}
