import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import {
  Upload,
  AlertTriangle,
  CheckCircle,
  FileSpreadsheet,
  Loader2,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ModalData from "@/components/shared/Modal/ModalData";
import { useGetEmployeeDd } from "@/features/api/companyEmployee";
import { useGanttWorkspaceDetail } from "@/features/api/gantt";
import {
  parseAndValidateExcel,
  ParsedTask,
  ValidationError,
  ValidationWarning,
} from "../utils/ganttExcel";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  workspaceId: string;
  workspaceName: string;
  onImportComplete?: () => void;
}

type Stage = "UPLOAD" | "PREVIEW" | "IMPORTING" | "FINISHED";

export default function GanttImportModal({
  open,
  onOpenChange,
  workspaceId,
  workspaceName,
  onImportComplete,
}: Props) {
  const { data: wsDetail } = useGanttWorkspaceDetail(
    open ? workspaceId : undefined,
  );
  const phases = wsDetail?.phases || [];
  const [stage, setStage] = useState<Stage>("UPLOAD");
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<string>("");
  const [parsedTasks, setParsedTasks] = useState<ParsedTask[]>([]);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [warnings, setWarnings] = useState<ValidationWarning[]>([]);

  // Import execution states
  const [importStatus, setImportStatus] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPreviewList, setShowPreviewList] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showConflictOptions, setShowConflictOptions] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: employeeData } = useGetEmployeeDd({
    filter: {
      isDeactivated: false,
      pageSize: 1000,
    },
    enable: open,
  });
  const employees = employeeData?.data || [];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setSelectedFile(file);
    setFileName(file.name);
    setFileSize((file.size / 1024).toFixed(1) + " KB");

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Read all cells including blank lines
        const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
          header: 1,
          defval: "",
        });

        const result = parseAndValidateExcel(rows, phases, employees);

        setParsedTasks(result.tasks);
        setErrors(result.errors);
        setWarnings(result.warnings);
        setStage("PREVIEW");
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Error reading file", err);
        setErrors([
          {
            row: 0,
            column: "File",
            message:
              "Failed to parse the Excel file structure. Please ensure it is a valid .xlsx or .xls file.",
          },
        ]);
        setStage("PREVIEW");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleCancel = () => {
    setStage("UPLOAD");
    setParsedTasks([]);
    setErrors([]);
    setWarnings([]);
    setErrorMsg(null);
    setFileName("");
    setFileSize("");
    setSelectedFile(null);
    setShowConflictOptions(false);
  };

  const executeImport = async (option?: "replace" | "skip" | "clear_all") => {
    if (!selectedFile) return;

    setStage("IMPORTING");
    setProgress(30);
    setImportStatus(
      option ? `Re-importing (${option})...` : "Uploading file to server...",
    );
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      if (option) {
        formData.append("validOptions", option);
      }

      setProgress(60);
      setImportStatus("Processing spreadsheet on server...");

      const res = await Api.post<{ message: string }>({
        url: Urls.ganttWorkspaceImport(workspaceId),
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setProgress(100);
      setImportStatus(res.data.message || "All items imported successfully!");
      setStage("FINISHED");
      toast.success("Gantt structure imported successfully.");
      setShowConflictOptions(false);

      // Invalidate queries to refresh views
      queryClient.invalidateQueries({
        queryKey: ["gantt-workspace-detail", workspaceId],
      });
      queryClient.invalidateQueries({ queryKey: ["gantt-workspaces"] });

      if (onImportComplete) {
        onImportComplete();
      }
    } catch (err: unknown) {
      // eslint-disable-next-line no-console
      console.error("Gantt Import execution error:", err);
      const axiosError = err as {
        response?: {
          status?: number;
          data?: { status?: number; message?: string };
        };
        message?: string;
      };

      const is417 =
        axiosError.response?.status === 417 ||
        axiosError.response?.data?.status === 417;

      if (is417) {
        setShowConflictOptions(true);
        setErrorMsg(
          axiosError.response?.data?.message ||
            "Workspace already contains data. Please choose an import option.",
        );
      } else {
        const apiErrorMsg =
          axiosError.response?.data?.message ||
          axiosError.message ||
          "An unexpected error occurred.";
        setErrorMsg(`Import failed. Reason: ${apiErrorMsg}`);
      }
      setStage("PREVIEW");
    }
  };

  const handleModalClose = () => {
    if (stage === "IMPORTING") return; // block closing while importing
    onOpenChange(false);
    setTimeout(() => {
      setStage("UPLOAD");
      setParsedTasks([]);
      setErrors([]);
      setWarnings([]);
      setErrorMsg(null);
      setFileName("");
      setFileSize("");
      setProgress(0);
      setSelectedFile(null);
      setShowConflictOptions(false);
    }, 200);
  };

  return (
    <ModalData
      isModalOpen={open}
      modalTitle={`Import Gantt Hierarchy`}
      modalClose={handleModalClose}
      containerClass="max-w-xl transition-all duration-300"
      buttons={
        stage === "UPLOAD"
          ? [
              {
                btnText: "Cancel",
                buttonCss:
                  "py-1.5 px-5 bg-white border border-slate-200 text-black hover:bg-slate-50 rounded-lg",
                btnClick: handleModalClose,
              },
            ]
          : stage === "PREVIEW"
            ? showConflictOptions
              ? [
                  {
                    btnText: "Cancel / Reset",
                    buttonCss:
                      "py-1.5 px-5 bg-white border border-slate-200 text-black hover:bg-slate-50 rounded-lg",
                    btnClick: handleCancel,
                  },
                  {
                    btnText: "Skip Existing",
                    btnClick: () => executeImport("skip"),
                    buttonCss:
                      "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300",
                  },
                  {
                    btnText: "Replace Existing",
                    btnClick: () => executeImport("replace"),
                    buttonCss:
                      "bg-amber-500 hover:bg-amber-600 text-white border-amber-500",
                  },
                  {
                    btnText: "Clear & Re-import",
                    btnClick: () => executeImport("clear_all"),
                    buttonCss:
                      "bg-red-500 hover:bg-red-600 text-white border-red-500",
                  },
                ]
              : [
                  {
                    btnText: "Cancel / Reset",
                    buttonCss:
                      "py-1.5 px-5 bg-white border border-slate-200 text-black hover:bg-slate-50 rounded-lg",
                    btnClick: handleCancel,
                  },
                  {
                    btnText: "Run Import",
                    btnClick: () => executeImport(),
                    isLoading: false,
                    buttonCss:
                      errors.length > 0
                        ? "hidden"
                        : "bg-primary hover:bg-primary/95 text-white",
                  },
                ]
            : stage === "FINISHED"
              ? [
                  {
                    btnText: "Close & Refresh",
                    btnClick: handleModalClose,
                  },
                ]
              : [] // No buttons for importing stage
      }
    >
      <div className="py-2 space-y-4">
        {/* Workspace Info Header */}
        <div className="bg-slate-50/50 border border-slate-150/60 rounded-xl p-3.5 text-xs flex items-center justify-between shadow-sm">
          <span className="text-slate-500 font-medium flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            Target Workspace:
          </span>
          <span className="font-bold text-slate-800 truncate max-w-[320px] bg-white border px-2.5 py-1 rounded-lg text-[11px] shadow-sm">
            {workspaceName}
          </span>
        </div>

        {/* STAGE 1: UPLOAD FILE */}
        {stage === "UPLOAD" && (
          <div className="space-y-4">
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                dragActive
                  ? "border-primary bg-primary/5 scale-[0.98]"
                  : "border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                <Upload className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Drag and drop your filled Excel template here
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  or click to browse from your computer (.xlsx, .xls)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 2: PREVIEW & VALIDATION */}
        {stage === "PREVIEW" && (
          <div className="space-y-4">
            {/* File Info */}
            <div className="flex items-center gap-3 border border-slate-150/60 p-3 rounded-xl bg-slate-50/30 shadow-sm">
              <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center text-green-650 shrink-0 border border-green-100">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {fileName}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                  {fileSize}
                </p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                onClick={handleCancel}
                title="Upload different file"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Error Message from backend execution if retry */}
            {errorMsg && (
              <div className="bg-rose-50 border border-rose-100 text-rose-950 rounded-xl p-3.5 text-xs leading-normal flex gap-2.5 shadow-sm">
                <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5 text-rose-650" />
                <div>
                  <p className="font-bold text-rose-900">Execution Error:</p>
                  <p className="mt-0.5 text-rose-800 text-[11px] font-medium leading-relaxed">
                    {errorMsg}
                  </p>
                </div>
              </div>
            )}

            {/* Validation Failures */}
            {errors.length > 0 && (
              <div className="space-y-2.5">
                <div className="bg-rose-50 border border-rose-200/60 rounded-xl p-3.5 text-xs text-rose-950 flex gap-2.5 shadow-sm">
                  <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600" />
                  <div>
                    <span className="font-bold text-rose-900">
                      Errors blocking import ({errors.length}):
                    </span>
                    <p className="mt-1 text-[11px] text-rose-700 leading-relaxed">
                      Please correct these issues in your spreadsheet and upload
                      again.
                    </p>
                  </div>
                </div>
                <div className="border border-rose-100 rounded-xl max-h-[180px] overflow-y-auto divide-y divide-rose-50 bg-rose-50/5 shadow-inner">
                  {errors.map((err, idx) => (
                    <div
                      key={idx}
                      className="p-3 text-xs text-rose-800 flex justify-between items-center gap-4 hover:bg-rose-50/20 transition-colors"
                    >
                      <span className="font-medium text-[11px] text-rose-700 leading-relaxed">
                        Row {err.row}: {err.message}
                      </span>
                      <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-rose-100 text-rose-800 border border-rose-200/50 shrink-0 uppercase tracking-wider">
                        {err.column}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Success Preview Summary - only render if no errors and no warnings */}
            {errors.length === 0 && warnings.length === 0 && (
              <div className="bg-green-50 border border-green-200/60 rounded-xl p-4 text-xs text-green-950 flex items-center gap-3 shadow-sm">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-green-900 text-sm">
                    Spreadsheet Validation Passed!
                  </p>
                  <p className="text-[11px] text-green-700 mt-1 leading-relaxed">
                    Ready to import <strong>{parsedTasks.length}</strong> items
                    and{" "}
                    <strong>
                      {parsedTasks.reduce(
                        (acc, t) => acc + t.predecessors.length,
                        0,
                      )}
                    </strong>{" "}
                    dependencies.
                  </p>
                </div>
              </div>
            )}

            {/* Structure preview toggle */}
            {errors.length === 0 && (
              <div className="border border-slate-150 rounded-xl overflow-hidden bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => setShowPreviewList(!showPreviewList)}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold hover:bg-slate-50 border-b flex justify-between items-center text-slate-700 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    Preview Items List ({parsedTasks.length})
                  </span>
                  <ChevronRight
                    className={`h-4 w-4 transition-transform text-slate-400 ${
                      showPreviewList ? "rotate-90" : ""
                    }`}
                  />
                </button>

                {showPreviewList && (
                  <div className="max-h-[200px] overflow-y-auto text-xs divide-y dive-slate-100 bg-slate-50/30">
                    {parsedTasks.map((t, idx) => (
                      <div
                        key={idx}
                        className="p-3 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                      >
                        <div className="min-w-0">
                          <span className="font-semibold text-sm text-slate-800 truncate block">
                            {t.itemName}
                          </span>
                          <span className="text-xs text-slate-500 block mt-1 font-medium">
                            {t.itemType} · Priority:{" "}
                            <span className="font-bold">{t.priority}</span>
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-white text-slate-600 border border-slate-200 shadow-sm">
                            {t.phaseName || "Unphased"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* STAGE 3: IMPORTING */}
        {stage === "IMPORTING" && (
          <div className="space-y-6 py-6 text-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto" />
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-slate-800">
                Importing Gantt Chart Hierarchy...
              </h4>
              <p className="text-xs text-slate-500 max-w-[420px] mx-auto leading-normal">
                {importStatus}
              </p>
            </div>

            {/* Custom progress bar */}
            <div className="w-full max-w-sm mx-auto space-y-1.5">
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-slate-600 block text-right">
                {progress}%
              </span>
            </div>
          </div>
        )}

        {/* STAGE 4: FINISHED */}
        {stage === "FINISHED" && (
          <div className="space-y-4 py-4 text-center">
            <div className="h-12 w-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle className="h-7 w-7" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-800">
                Import Successful!
              </h4>
              <p className="text-xs text-slate-500 leading-normal max-w-[360px] mx-auto">
                All phases, tasks, milestones, and predecessor links were
                created inside your workspace.
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-3.5 max-w-sm mx-auto text-xs text-left grid grid-cols-2 gap-y-2 gap-x-4">
              <span className="text-slate-500">Workspace:</span>
              <span className="font-semibold text-slate-800 text-right truncate">
                {workspaceName}
              </span>
              <span className="text-slate-500">Items Imported:</span>
              <span className="font-bold text-green-600 text-right">
                {parsedTasks.length}
              </span>
              <span className="text-slate-500">Dependencies Linked:</span>
              <span className="font-bold text-green-600 text-right">
                {parsedTasks.reduce((acc, t) => acc + t.predecessors.length, 0)}
              </span>
            </div>
          </div>
        )}
      </div>
    </ModalData>
  );
}
