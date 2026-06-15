import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import {
  Upload,
  AlertTriangle,
  CheckCircle,
  FileSpreadsheet,
  Loader2,
  Info,
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
  };

  const executeImport = async () => {
    if (!selectedFile) return;

    setStage("IMPORTING");
    setProgress(30);
    setImportStatus("Uploading file to server...");
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

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
      const apiError = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const apiErrorMsg =
        apiError?.response?.data?.message ||
        apiError?.message ||
        "An unexpected error occurred.";
      setErrorMsg(`Import failed. Reason: ${apiErrorMsg}`);
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
            ? [
                {
                  btnText: "Cancel / Reset",
                  buttonCss:
                    "py-1.5 px-5 bg-white border border-slate-200 text-black hover:bg-slate-50 rounded-lg",
                  btnClick: handleCancel,
                },
                {
                  btnText: "Run Import",
                  btnClick: executeImport,
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
        <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs flex items-center justify-between">
          <span className="text-slate-500 font-medium">Target Workspace:</span>
          <span className="font-bold text-slate-800 truncate max-w-[320px]">
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

            <div className="bg-amber-50/70 border border-amber-200/50 rounded-lg p-3 flex gap-2.5">
              <Info className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-[11px] text-amber-800 leading-normal space-y-1">
                <p className="font-bold">Important Instructions:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>
                    Please use the template matching this workspace to ensure
                    Phase names match exactly.
                  </li>
                  <li>
                    Phases not pre-defined in the workspace will import items as{" "}
                    <strong>Unphased</strong>.
                  </li>
                  <li>
                    Ensure dates follow YYYY-MM-DD format, and start dates are
                    prior to end dates.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 2: PREVIEW & VALIDATION */}
        {stage === "PREVIEW" && (
          <div className="space-y-4">
            {/* File Info */}
            <div className="flex items-center gap-3 border p-2.5 rounded-lg bg-white">
              <FileSpreadsheet className="h-8 w-8 text-green-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {fileName}
                </p>
                <p className="text-[10px] text-slate-500">{fileSize}</p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-slate-400"
                onClick={handleCancel}
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Error Message from backend execution if retry */}
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-xs leading-normal flex gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
                <div>
                  <p className="font-bold">Execution Error:</p>
                  <p className="mt-0.5">{errorMsg}</p>
                </div>
              </div>
            )}

            {/* Validation Failures */}
            {errors.length > 0 && (
              <div className="space-y-2">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-800 flex gap-2">
                  <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-red-600" />
                  <div>
                    <span className="font-bold">
                      Errors blocking import ({errors.length}):
                    </span>
                    <p className="mt-0.5 text-[11px] text-red-700">
                      Please correct these issues in your spreadsheet and upload
                      again.
                    </p>
                  </div>
                </div>
                <div className="border border-red-100 rounded-lg max-h-[160px] overflow-y-auto divide-y divide-red-50 bg-red-50/10">
                  {errors.map((err, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 text-[11px] text-red-800 flex justify-between gap-4"
                    >
                      <span>
                        Row {err.row}: {err.message}
                      </span>
                      <span className="font-semibold text-red-900 shrink-0">
                        {err.column}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings list */}
            {errors.length === 0 && warnings.length > 0 && (
              <div className="space-y-2">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 flex gap-2">
                  <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-amber-600" />
                  <div>
                    <span className="font-bold">
                      Warnings ({warnings.length}):
                    </span>
                    <p className="mt-0.5 text-[11px] text-amber-700">
                      Import can proceed, but the following issues will occur:
                    </p>
                  </div>
                </div>
                <div className="border border-amber-100 rounded-lg max-h-[120px] overflow-y-auto divide-y divide-amber-50 bg-amber-50/10">
                  {warnings.map((wrn, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 text-[11px] text-amber-800 flex justify-between gap-4"
                    >
                      <span>
                        Row {wrn.row}: {wrn.message}
                      </span>
                      <span className="font-semibold text-amber-900 shrink-0">
                        {wrn.column}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Success Preview Summary */}
            {errors.length === 0 && (
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-800 flex items-center gap-2.5">
                  <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                  <div>
                    <p className="font-bold">Spreadsheet Validation Passed!</p>
                    <p className="text-[11px] text-green-700 mt-0.5">
                      Ready to import <strong>{parsedTasks.length}</strong>{" "}
                      items and{" "}
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

                {/* Structure preview toggle */}
                <div className="border rounded-lg overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={() => setShowPreviewList(!showPreviewList)}
                    className="w-full px-3 py-2 text-xs font-semibold hover:bg-slate-50 border-b flex justify-between items-center text-slate-700"
                  >
                    <span>Preview Items List</span>
                    <ChevronRight
                      className={`h-4 w-4 transition-transform text-slate-400 ${
                        showPreviewList ? "rotate-90" : ""
                      }`}
                    />
                  </button>

                  {showPreviewList && (
                    <div className="max-h-[200px] overflow-y-auto text-xs divide-y">
                      {parsedTasks.map((t, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 flex items-center justify-between gap-4"
                        >
                          <div className="min-w-0">
                            <span className="font-medium text-slate-800 truncate block">
                              {t.itemName}
                            </span>
                            <span className="text-[10px] text-slate-500 block mt-0.5">
                              ID: {t.excelTaskId} · {t.itemType} · Priority:{" "}
                              {t.priority}
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-600 border">
                              {t.phaseName || "Unphased"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
