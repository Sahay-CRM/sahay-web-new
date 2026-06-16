import type { CompanyGanttPhase } from "@/types/gantt";
import ExcelJS from "exceljs";

export interface ParsedPredecessor {
  predecessorTaskId: string; // The ID in Excel sheet
  dependencyType: "FS" | "SS" | "FF" | "SF";
  lagDays: number;
}

export interface ParsedTask {
  rowNum: number;
  excelTaskId: string;
  parentExcelTaskId: string | null;
  phaseName: string | null;
  ganttPhaseId: string | null;
  itemName: string;
  itemType: "TASK" | "MILESTONE";
  itemDescription: string;
  plannedStartDate: string; // ISO String
  plannedEndDate: string; // ISO String
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  itemStatus:
    | "NOT_STARTED"
    | "IN_PROGRESS"
    | "ON_HOLD"
    | "COMPLETED"
    | "CANCELLED";
  progressPercentage: number;
  assignedToEmployeeId: string | null;
  assigneeEmail: string | null;
  assigneeName: string | null;
  predecessors: ParsedPredecessor[];
  depth: number; // for topological creation order
}

export interface ValidationError {
  row: number;
  column: string;
  message: string;
}

export interface ValidationWarning {
  row: number;
  column: string;
  message: string;
}

// Helper: Excel serial date to JS Date
export function excelSerialToDate(serial: number): Date {
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);

  const fractional_day = serial - Math.floor(serial) + 0.0000001;
  let total_seconds = Math.floor(86400 * fractional_day);

  const seconds = total_seconds % 60;
  total_seconds = Math.floor(total_seconds / 60);
  const minutes = total_seconds % 60;
  const hours = Math.floor(total_seconds / 60);

  return new Date(
    date_info.getFullYear(),
    date_info.getMonth(),
    date_info.getDate(),
    hours,
    minutes,
    seconds,
  );
}

// Helper: Parse date cell which might be a number (excel serial) or string
function parseDateCell(cell: unknown): Date | null {
  if (cell === undefined || cell === null || cell === "") return null;
  if (typeof cell === "number") {
    return excelSerialToDate(cell);
  }
  if (cell instanceof Date) {
    return isNaN(cell.getTime()) ? null : cell;
  }
  const date = new Date(String(cell));
  return isNaN(date.getTime()) ? null : date;
}

// ── Export Template ──────────────────────────────────────────────────────────
export async function exportGanttTemplate(
  workspaceName: string,
  phases: CompanyGanttPhase[],
  employees: EmployeeDetails[],
) {
  const workbook = new ExcelJS.Workbook();

  // Create sheets
  const wsStructure = workbook.addWorksheet("Gantt Structure");
  const wsRef = workbook.addWorksheet("Active Employees");

  // 1. Gantt Structure columns & headers
  wsStructure.columns = [
    { header: "Phase Name", key: "phaseName", width: 20 },
    { header: "Task/Milestone ID", key: "excelTaskId", width: 18 },
    { header: "Parent ID", key: "parentExcelTaskId", width: 12 },
    { header: "Name", key: "itemName", width: 30 },
    { header: "Type", key: "itemType", width: 12 },
    { header: "Description", key: "itemDescription", width: 30 },
    { header: "Planned Start Date", key: "plannedStartDate", width: 18 },
    { header: "Planned End Date", key: "plannedEndDate", width: 18 },
    { header: "Priority", key: "priority", width: 12 },
    { header: "Status", key: "itemStatus", width: 15 },
    { header: "Progress %", key: "progressPercentage", width: 12 },
    { header: "Assignee Name", key: "assigneeName", width: 25 },
    { header: "Predecessor IDs", key: "predecessors", width: 20 },
  ];

  // Header styling for Gantt Structure
  const headerRow = wsStructure.getRow(1);
  headerRow.height = 26;
  headerRow.eachCell((cell) => {
    cell.font = {
      name: "Segoe UI",
      size: 10,
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF2B3674" }, // CRM Theme Dark Navy
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  // Example row to guide user
  const sampleRows: unknown[][] = [];
  if (phases && phases.length > 0) {
    phases.forEach((p, idx) => {
      sampleRows.push([
        p.phaseName,
        `${idx + 1}`,
        "",
        `Example task for ${p.phaseName}`,
        "TASK",
        "Optional description here",
        "2026-06-15",
        "2026-06-20",
        "MEDIUM",
        "NOT_STARTED",
        0,
        employees[0]?.employeeName || "",
        idx > 0 ? `${idx}FS` : "",
      ]);
    });
  } else {
    sampleRows.push([
      "Phase 1",
      "1",
      "",
      "Kickoff Meeting",
      "MILESTONE",
      "Project Kickoff",
      "2026-06-15",
      "2026-06-15",
      "HIGH",
      "NOT_STARTED",
      0,
      "",
      "",
    ]);
    sampleRows.push([
      "Phase 1",
      "2",
      "",
      "Requirements gathering",
      "TASK",
      "",
      "2026-06-15",
      "2026-06-22",
      "MEDIUM",
      "NOT_STARTED",
      0,
      "",
      "1FS",
    ]);
  }

  sampleRows.forEach((row) => {
    wsStructure.addRow(row);
  });

  // Add styles to sample rows (Segoe UI, padding)
  for (let r = 2; r <= sampleRows.length + 1; r++) {
    const row = wsStructure.getRow(r);
    row.height = 20;
    row.eachCell((cell) => {
      cell.font = { name: "Segoe UI", size: 10 };
      cell.alignment = { vertical: "middle" };
    });
  }

  // 2. Reference sheet: Active Employees
  wsRef.columns = [
    { header: "Employee Name", key: "employeeName", width: 25 },
    { header: "Employee Email", key: "employeeEmail", width: 30 },
    { header: "Department", key: "departmentName", width: 20 },
    { header: "Designation", key: "designationName", width: 20 },
    { header: "", key: "empty", width: 5 },
    { header: "Workspace Phases", key: "workspacePhases", width: 25 },
  ];

  // Header styling for Active Employees
  const refHeaderRow = wsRef.getRow(1);
  refHeaderRow.height = 26;
  refHeaderRow.eachCell((cell) => {
    cell.font = {
      name: "Segoe UI",
      size: 10,
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF2B3674" },
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  // Populate active employees rows
  const activeEmployees = (employees || []).filter((e) => !e.isDeactivated);
  const maxRows = Math.max(activeEmployees.length, phases.length);

  for (let idx = 0; idx < maxRows; idx++) {
    const emp = activeEmployees[idx];
    const ph = phases[idx];

    wsRef.addRow([
      emp ? emp.employeeName : "",
      emp ? emp.employeeEmail : "",
      emp ? emp.departmentName || "-" : "",
      emp ? emp.designationName || "-" : "",
      "",
      ph ? ph.phaseName : "",
    ]);
  }

  // Style rows in Active Employees
  for (let r = 2; r <= maxRows + 1; r++) {
    const row = wsRef.getRow(r);
    row.height = 20;
    row.eachCell((cell) => {
      cell.font = { name: "Segoe UI", size: 10 };
      cell.alignment = { vertical: "middle" };
    });
  }

  // 3. Add Data Validation / Dropdowns
  const maxStructureRows = 300; // supports up to 300 rows

  for (let r = 2; r <= maxStructureRows; r++) {
    // Phase Name Validation (from Active Employees sheet Column F)
    if (phases && phases.length > 0) {
      wsStructure.getCell(`A${r}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [`'Active Employees'!$F$2:$F$${phases.length + 1}`],
        showErrorMessage: true,
        errorTitle: "Invalid Phase",
        error: "Please select a phase from the dropdown list.",
      };
    }

    // Type Validation (TASK or MILESTONE)
    wsStructure.getCell(`E${r}`).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: ['"TASK,MILESTONE"'],
      showErrorMessage: true,
      errorTitle: "Invalid Type",
      error: "Allowed values are TASK or MILESTONE.",
    };

    // Priority Validation
    wsStructure.getCell(`I${r}`).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: ['"LOW,MEDIUM,HIGH,CRITICAL"'],
      showErrorMessage: true,
      errorTitle: "Invalid Priority",
      error: "Allowed values are LOW, MEDIUM, HIGH, or CRITICAL.",
    };

    // Status Validation
    wsStructure.getCell(`J${r}`).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: ['"NOT_STARTED,IN_PROGRESS,ON_HOLD,COMPLETED,CANCELLED"'],
      showErrorMessage: true,
      errorTitle: "Invalid Status",
      error:
        "Allowed values are NOT_STARTED, IN_PROGRESS, ON_HOLD, COMPLETED, or CANCELLED.",
    };

    // Parent ID Validation (referencing Task/Milestone IDs in column B)
    wsStructure.getCell(`C${r}`).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: [`=$B$2:$B$${maxStructureRows}`],
      showErrorMessage: true,
      errorTitle: "Invalid Parent ID",
      error: "Please select a valid parent Task/Milestone ID from column B.",
    };

    // Predecessor IDs Validation (referencing Task/Milestone IDs in column B)
    wsStructure.getCell(`M${r}`).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: [`=$B$2:$B$${maxStructureRows}`],
      showErrorMessage: false, // Don't show error so they can type custom formats like "1SS" or "1FS, 2SS"
    };

    // Assignee Name Validation (from Active Employees sheet Column A)
    if (activeEmployees && activeEmployees.length > 0) {
      wsStructure.getCell(`L${r}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [`'Active Employees'!$A$2:$A$${activeEmployees.length + 1}`],
        showErrorMessage: true,
        errorTitle: "Invalid Assignee Name",
        error: "Please select a valid assignee name from the dropdown list.",
      };
    }
  }

  // Generate buffer and trigger browser download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const filename = `gantt_template_${workspaceName.replace(/[^a-zA-Z0-9]/g, "_")}.xlsx`;
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

// ── Parse Predecessors ───────────────────────────────────────────────────────
// Parse format: "1", "1FS", "1FS+2d", "2SS-3d"
export function parsePredecessors(raw: string): ParsedPredecessor[] {
  if (!raw || typeof raw !== "string") return [];

  const parts = raw
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  const results: ParsedPredecessor[] = [];

  const regex = /^(\d+)(FS|SS|FF|SF)?(?:([+-]\d+)[dD]?)?$/i;

  for (const part of parts) {
    const match = regex.exec(part);
    if (!match) continue;

    const id = match[1];
    const type = (match[2]?.toUpperCase() as "FS" | "SS" | "FF" | "SF") || "FS";
    const lag = match[3] ? parseInt(match[3], 10) : 0;

    results.push({
      predecessorTaskId: id,
      dependencyType: type,
      lagDays: lag,
    });
  }

  return results;
}

// ── Parse & Validate ─────────────────────────────────────────────────────────
export function parseAndValidateExcel(
  sheetData: unknown[][],
  phases: CompanyGanttPhase[],
  employees: EmployeeDetails[],
): {
  success: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  tasks: ParsedTask[];
} {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const tasks: ParsedTask[] = [];

  if (sheetData.length < 2) {
    errors.push({
      row: 1,
      column: "All",
      message: "The Excel file is empty or missing data rows.",
    });
    return { success: false, errors, warnings, tasks };
  }

  const headers = sheetData[0].map((h) => String(h || "").trim());

  // Map column index by header name
  const colIndex = (name: string) =>
    headers.findIndex((h) => h.toLowerCase() === name.toLowerCase());

  const idxPhase = colIndex("Phase Name");
  const idxTaskId = colIndex("Task/Milestone ID");
  const idxParentId = colIndex("Parent ID");
  const idxName = colIndex("Name");
  const idxType = colIndex("Type");
  const idxDesc = colIndex("Description");
  const idxStart = colIndex("Planned Start Date");
  const idxEnd = colIndex("Planned End Date");
  const idxPriority = colIndex("Priority");
  const idxStatus = colIndex("Status");
  const idxProgress = colIndex("Progress %");
  const idxEmail = colIndex("Assignee Email");
  const idxAssigneeName = colIndex("Assignee Name");
  const idxPreds = colIndex("Predecessor IDs");

  // Check critical column indices
  if (idxTaskId === -1 || idxName === -1 || idxType === -1) {
    errors.push({
      row: 1,
      column: "Headers",
      message:
        "Missing required headers. Ensure 'Task/Milestone ID', 'Name', and 'Type' columns are present.",
    });
    return { success: false, errors, warnings, tasks };
  }

  const validTaskIds = new Set<string>();
  const idToRowMap = new Map<string, number>();

  // Collect and validate all unique Task IDs first
  for (let r = 1; r < sheetData.length; r++) {
    const row = sheetData[r];
    if (row.length === 0 || row.every((c) => c === null || c === "")) continue; // skip empty rows

    const rawId = String(row[idxTaskId] ?? "").trim();
    if (!rawId) {
      errors.push({
        row: r + 1,
        column: "Task/Milestone ID",
        message: "ID cannot be empty.",
      });
      continue;
    }

    if (validTaskIds.has(rawId)) {
      errors.push({
        row: r + 1,
        column: "Task/Milestone ID",
        message: `Duplicate ID '${rawId}' found (previously defined on row ${idToRowMap.get(rawId)}).`,
      });
    } else {
      validTaskIds.add(rawId);
      idToRowMap.set(rawId, r + 1);
    }
  }

  // Phase name mapper
  const phaseMap = new Map<string, CompanyGanttPhase>();
  phases.forEach((p) => phaseMap.set(p.phaseName.trim().toLowerCase(), p));

  // Employee maps
  const employeeByNameMap = new Map<string, EmployeeDetails>();
  const employeeByEmailMap = new Map<string, EmployeeDetails>();
  employees.forEach((e) => {
    if (e.employeeName) {
      employeeByNameMap.set(e.employeeName.trim().toLowerCase(), e);
    }
    if (e.employeeEmail) {
      employeeByEmailMap.set(e.employeeEmail.trim().toLowerCase(), e);
    }
  });

  // Second pass: Validate each cell and parse properties
  for (let r = 1; r < sheetData.length; r++) {
    const row = sheetData[r];
    if (row.length === 0 || row.every((c) => c === null || c === "")) continue;

    const rowNum = r + 1;
    const rawId = String(row[idxTaskId] ?? "").trim();
    if (!rawId) continue; // Skip since we already logged error

    const name = String(row[idxName] ?? "").trim();
    if (!name) {
      errors.push({
        row: rowNum,
        column: "Name",
        message: "Task/Milestone Name is required.",
      });
    }

    const type = String(row[idxType] ?? "")
      .trim()
      .toUpperCase();
    if (type !== "TASK" && type !== "MILESTONE") {
      errors.push({
        row: rowNum,
        column: "Type",
        message: `Invalid Type '${type}'. Allowed values: 'TASK', 'MILESTONE'.`,
      });
    }

    const phaseVal = idxPhase !== -1 ? String(row[idxPhase] ?? "").trim() : "";
    let ganttPhaseId: string | null = null;
    if (phaseVal) {
      const match = phaseMap.get(phaseVal.toLowerCase());
      if (match) {
        ganttPhaseId = match.ganttPhaseId;
      } else {
        warnings.push({
          row: rowNum,
          column: "Phase Name",
          message: `Phase '${phaseVal}' does not exist in workspace. Item will be unphased.`,
        });
      }
    }

    const parentVal =
      idxParentId !== -1 ? String(row[idxParentId] ?? "").trim() : "";
    let parentExcelTaskId: string | null = null;
    if (parentVal) {
      if (!validTaskIds.has(parentVal)) {
        errors.push({
          row: rowNum,
          column: "Parent ID",
          message: `Parent ID '${parentVal}' does not exist in the spreadsheet.`,
        });
      } else if (parentVal === rawId) {
        errors.push({
          row: rowNum,
          column: "Parent ID",
          message: "A task cannot be its own parent.",
        });
      } else {
        parentExcelTaskId = parentVal;
      }
    }

    const desc = idxDesc !== -1 ? String(row[idxDesc] ?? "").trim() : "";

    const rawStart = idxStart !== -1 ? row[idxStart] : null;
    const rawEnd = idxEnd !== -1 ? row[idxEnd] : null;
    const startDate: Date | null = parseDateCell(rawStart);
    let endDate: Date | null = parseDateCell(rawEnd);

    if (type === "TASK") {
      if (!startDate) {
        errors.push({
          row: rowNum,
          column: "Planned Start Date",
          message: "Planned Start Date is required for tasks.",
        });
      }
      if (!endDate) {
        errors.push({
          row: rowNum,
          column: "Planned End Date",
          message: "Planned End Date is required for tasks.",
        });
      }
      if (startDate && endDate && startDate > endDate) {
        errors.push({
          row: rowNum,
          column: "Planned Dates",
          message: `Planned Start Date (${startDate.toISOString().split("T")[0]}) must be before or equal to End Date (${endDate.toISOString().split("T")[0]}).`,
        });
      }
    } else if (type === "MILESTONE") {
      if (!startDate) {
        errors.push({
          row: rowNum,
          column: "Planned Start Date",
          message: "Start date is required for milestones.",
        });
      }
      // Milestone is zero-duration, so end date matches start date
      if (startDate) {
        endDate = startDate;
      }
    }

    const priorityVal =
      idxPriority !== -1
        ? String(row[idxPriority] ?? "")
            .trim()
            .toUpperCase()
        : "MEDIUM";
    let priority: ParsedTask["priority"] = "MEDIUM";
    if (["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(priorityVal)) {
      priority = priorityVal as ParsedTask["priority"];
    } else if (priorityVal) {
      errors.push({
        row: rowNum,
        column: "Priority",
        message: `Invalid Priority '${priorityVal}'. Must be: 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'.`,
      });
    }

    const statusVal =
      idxStatus !== -1
        ? String(row[idxStatus] ?? "")
            .trim()
            .toUpperCase()
        : "NOT_STARTED";
    let itemStatus: ParsedTask["itemStatus"] = "NOT_STARTED";
    const allowedStatuses = [
      "NOT_STARTED",
      "IN_PROGRESS",
      "ON_HOLD",
      "COMPLETED",
      "CANCELLED",
    ];
    if (allowedStatuses.includes(statusVal)) {
      itemStatus = statusVal as ParsedTask["itemStatus"];
    } else if (statusVal) {
      errors.push({
        row: rowNum,
        column: "Status",
        message: `Invalid Status '${statusVal}'. Must be one of: ${allowedStatuses.join(", ")}.`,
      });
    }

    const progressVal =
      idxProgress !== -1 ? parseFloat(String(row[idxProgress] ?? "0")) : 0;
    let progressPercentage = 0;
    if (!isNaN(progressVal)) {
      if (progressVal < 0 || progressVal > 100) {
        errors.push({
          row: rowNum,
          column: "Progress %",
          message: "Progress must be between 0 and 100.",
        });
      } else {
        progressPercentage = Math.round(progressVal);
      }
    } else if (row[idxProgress] !== undefined && row[idxProgress] !== "") {
      errors.push({
        row: rowNum,
        column: "Progress %",
        message: "Progress must be a numeric percentage (0-100).",
      });
    }

    // Assignee validation
    const assigneeVal =
      idxAssigneeName !== -1
        ? String(row[idxAssigneeName] ?? "").trim()
        : idxEmail !== -1
          ? String(row[idxEmail] ?? "").trim()
          : "";
    let assignedToEmployeeId: string | null = null;
    let assigneeName: string | null = null;
    let assigneeEmail: string | null = null;
    if (assigneeVal) {
      let match = employeeByNameMap.get(assigneeVal.toLowerCase());
      if (!match) {
        match = employeeByEmailMap.get(assigneeVal.toLowerCase());
      }
      if (match) {
        assignedToEmployeeId = match.employeeId;
        assigneeName = match.employeeName;
        assigneeEmail = match.employeeEmail;
      } else {
        warnings.push({
          row: rowNum,
          column: idxAssigneeName !== -1 ? "Assignee Name" : "Assignee Email",
          message: `Employee '${assigneeVal}' is not active or not found. Task will be imported without assignee.`,
        });
      }
    }

    // Parse Predecessors
    const predsVal = idxPreds !== -1 ? String(row[idxPreds] ?? "").trim() : "";
    const predecessors = parsePredecessors(predsVal);
    predecessors.forEach((p) => {
      if (!validTaskIds.has(p.predecessorTaskId)) {
        errors.push({
          row: rowNum,
          column: "Predecessor IDs",
          message: `Predecessor ID '${p.predecessorTaskId}' does not exist in spreadsheet.`,
        });
      } else if (p.predecessorTaskId === rawId) {
        errors.push({
          row: rowNum,
          column: "Predecessor IDs",
          message: "A task cannot depend on itself.",
        });
      }
    });

    if (errors.length === 0) {
      tasks.push({
        rowNum,
        excelTaskId: rawId,
        parentExcelTaskId,
        phaseName: phaseVal || null,
        ganttPhaseId,
        itemName: name,
        itemType: type as "TASK" | "MILESTONE",
        itemDescription: desc,
        plannedStartDate: startDate ? startDate.toISOString() : "",
        plannedEndDate: endDate ? endDate.toISOString() : "",
        priority,
        itemStatus,
        progressPercentage,
        assignedToEmployeeId,
        assigneeEmail,
        assigneeName,
        predecessors,
        depth: 0,
      });
    }
  }

  if (errors.length > 0) {
    return { success: false, errors, warnings, tasks: [] };
  }

  // ── Cycle Detection & Topological Depth Sort ───────────────────────────────
  // We calculate tree depth of parent-child hierarchy to ensure parent tasks are created first
  const taskMap = new Map<string, ParsedTask>();
  tasks.forEach((t) => taskMap.set(t.excelTaskId, t));

  const visiting = new Set<string>();
  const visited = new Set<string>();

  function calculateDepth(taskId: string): number {
    if (visiting.has(taskId)) {
      errors.push({
        row: idToRowMap.get(taskId) || 0,
        column: "Parent ID",
        message: "Circular parent-child relationship detected.",
      });
      return 0;
    }
    if (visited.has(taskId)) {
      return taskMap.get(taskId)!.depth;
    }

    visiting.add(taskId);
    const task = taskMap.get(taskId)!;

    let depth = 0;
    if (task.parentExcelTaskId) {
      depth = 1 + calculateDepth(task.parentExcelTaskId);
    }

    task.depth = depth;
    visiting.delete(taskId);
    visited.add(taskId);

    return depth;
  }

  for (const t of tasks) {
    calculateDepth(t.excelTaskId);
  }

  if (errors.length > 0) {
    return { success: false, errors, warnings, tasks: [] };
  }

  // Sort tasks by hierarchy depth: 0 first (parents), then 1, then 2...
  tasks.sort((a, b) => a.depth - b.depth);

  return { success: true, errors, warnings, tasks };
}
