// ─────────────────────────────────────────────
// Gantt Chart Module — TypeScript Types
// Source of truth: docs/gantt/02-data-model.md
// ─────────────────────────────────────────────

// ── Enums ──────────────────────────────────────

export type GanttTemplateOwnerType = "SYSTEM" | "COMPANY";

export type GanttItemType = "TASK" | "MILESTONE";

export type GanttItemPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type GanttDependencyType = "FS" | "SS" | "FF" | "SF";

export type GanttWorkspaceStatus =
  | "DRAFT"
  | "ACTIVE"
  | "ON_HOLD"
  | "COMPLETED"
  | "CANCELLED";

export type GanttItemStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "ON_HOLD"
  | "COMPLETED"
  | "CANCELLED";

// ── Template Layer ─────────────────────────────

export interface GanttTemplate {
  srNo?: number;
  ganttTemplateId: string;
  templateName: string;
  templateDescription?: string | null;
  ownerType: GanttTemplateOwnerType;
  companyId?: string | null;
  industryId?: string | null;
  version: number;
  parentTemplateId?: string | null;
  isActive: boolean;
  isPublished: boolean;
  createdBy: string;
  isDelete: boolean;
  createdDatetime?: string;
  industryName?: string | null;
}

export interface GanttTemplatePhase {
  ganttTemplatePhaseId: string;
  ganttTemplateId: string;
  phaseName: string;
  phaseDescription?: string | null;
  phaseOrder: number;
  color?: string | null;
  createdBy: string;
  isDelete: boolean;
}

export interface GanttTemplateItem {
  ganttTemplateItemId: string;
  ganttTemplateId: string;
  ganttTemplatePhaseId?: string | null;
  parentItemId?: string | null;
  itemName: string;
  itemType: GanttItemType;
  relativeStartDay: number;
  relativeDurationDays: number;
  isMilestone: boolean;
  priority: GanttItemPriority;
  itemOrder: number;
  color?: string | null;
  assigneeRoleHint?: string | null;
  createdBy: string;
  isDelete: boolean;
  children?: GanttTemplateItem[];
}

export interface GanttTemplateDependency {
  ganttTemplateDependencyId: string;
  ganttTemplateId: string;
  predecessorItemId: string;
  successorItemId: string;
  dependencyType: GanttDependencyType;
  lagDays: number;
  createdBy: string;
  isDelete: boolean;
}

// ── Execution Layer ────────────────────────────

export interface CompanyGanttWorkspace {
  ganttWorkspaceId: string;
  companyId: string;
  workspaceName: string;
  workspaceDescription?: string | null;
  sourceTemplateId?: string | null;
  startDate: string;
  targetEndDate?: string | null;
  actualEndDate?: string | null;
  workspaceStatus: GanttWorkspaceStatus;
  createdBy: string;
  isDelete: boolean;
  createdDatetime?: string;
}

export interface CompanyGanttPhase {
  ganttPhaseId: string;
  ganttWorkspaceId: string;
  phaseName: string;
  phaseDescription?: string | null;
  phaseOrder: number;
  color?: string | null;
  sourceTemplatePhaseId?: string | null;
  createdBy: string;
  isDelete: boolean;
}

export interface CompanyGanttItem {
  ganttItemId: string;
  ganttWorkspaceId: string;
  ganttPhaseId?: string | null;
  parentItemId?: string | null;
  itemName: string;
  itemDescription?: string | null;
  itemType: GanttItemType;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string | null;
  actualEndDate?: string | null;
  progressPercentage: number;
  itemStatus: GanttItemStatus;
  isMilestone: boolean;
  priority: GanttItemPriority;
  itemOrder: number;
  color?: string | null;
  assignedToEmployeeId?: string | null;
  assignedEmployee?: { employeeName?: string; employeeId?: string } | null;
  sourceTemplateItemId?: string | null;
  createdBy: string;
  isDelete: boolean;
  children?: CompanyGanttItem[];
}

export interface CompanyGanttDependency {
  ganttDependencyId: string;
  ganttWorkspaceId: string;
  predecessorItemId: string;
  successorItemId: string;
  dependencyType: GanttDependencyType;
  lagDays: number;
  createdBy: string;
  isDelete: boolean;
}

// ── API Request / Response shapes ─────────────

export interface GanttTemplateListRequest {
  currentPage: number;
  pageSize: number;
  search?: string;
  ownerType?: GanttTemplateOwnerType;
}

export interface GanttTemplateListResponse {
  success: boolean;
  status: number;
  message: string;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPage: number;
  hasMore: boolean;
  data: GanttTemplate[];
}

export interface GanttTemplateDetailResponse {
  template: GanttTemplate;
  phases: GanttTemplatePhase[];
  itemsTree: GanttTemplateItem[];
  dependencies: GanttTemplateDependency[];
}

export interface GanttWorkspaceListRequest {
  currentPage: number;
  pageSize: number;
  workspaceStatus?: GanttWorkspaceStatus;
  search?: string;
}

export interface GanttWorkspaceListResponse {
  success: boolean;
  status: number;
  message: string;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  data: CompanyGanttWorkspace[];
}

export interface GanttWorkspaceDetailResponse {
  workspace: CompanyGanttWorkspace;
  phases: CompanyGanttPhase[];
  itemsTree: CompanyGanttItem[];
  dependencies: CompanyGanttDependency[];
}

export interface CreateGanttWorkspaceRequest {
  workspaceName: string;
  workspaceDescription?: string;
  startDate: string;
  targetEndDate?: string;
}

export interface CreateWorkspaceFromTemplateRequest {
  templateId: string;
  workspaceName: string;
  workspaceDescription?: string;
  startDate: string;
  targetEndDate?: string;
}

export interface CreateWorkspaceFromTemplateResponse {
  ganttWorkspaceId: string;
  workspaceName: string;
  phasesCreated: number;
  itemsCreated: number;
  dependenciesCreated: number;
}

export interface UpdateGanttWorkspaceRequest {
  workspaceName?: string;
  workspaceDescription?: string;
  workspaceStatus?: GanttWorkspaceStatus;
  targetEndDate?: string;
  actualEndDate?: string;
}

export interface CreateGanttItemRequest {
  ganttWorkspaceId: string;
  ganttPhaseId?: string | null;
  parentItemId?: string | null;
  itemName: string;
  itemDescription?: string;
  itemType: GanttItemType;
  plannedStartDate: string;
  plannedEndDate: string;
  priority?: GanttItemPriority;
  itemOrder?: number;
  color?: string;
}

export interface UpdateGanttItemRequest {
  itemName?: string;
  itemDescription?: string;
  itemType?: GanttItemType;
  priority?: GanttItemPriority;
  color?: string;
  ganttPhaseId?: string | null;
}

export interface UpdateGanttProgressRequest {
  progressPercentage?: number;
  itemStatus?: GanttItemStatus;
  actualStartDate?: string;
  actualEndDate?: string;
}

export interface UpdateGanttDatesRequest {
  plannedStartDate: string;
  plannedEndDate: string;
}

export interface AssignGanttItemRequest {
  assignedToEmployeeId: string | null;
}

export interface CreateGanttDependencyRequest {
  ganttWorkspaceId: string;
  predecessorItemId: string;
  successorItemId: string;
  dependencyType?: GanttDependencyType;
  lagDays?: number;
}

// ── Flattened row used internally by Gantt renderer ──

export interface GanttFlatRow {
  id: string;
  type: "phase" | "item";
  depth: number;
  phaseId?: string;
  phaseName?: string;
  phaseColor?: string;
  item?: CompanyGanttItem;
  isCollapsed?: boolean;
  hasChildren?: boolean;
  isVisible?: boolean;
}
