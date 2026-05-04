interface Team {
  teamId?: string;
  teamName: string;
  companyId?: string;
  createBy?: string;
  updateBy?: string;
  createdAt?: string;
  updatedAt?: string;
  positions?: number;
  _count?: {
    positions: number;
  };
}

interface TeamPosition {
  srNo?: number;
  positionId: string;
  teamId: string;
  employeeId?: string | null;
  parentPositionId?: string | null;
  employeeName?: string;
  employeeEmail?: string;
  employeeMobile?: string;
  employeeType?: string;
  isSahayEmployee?: boolean;
  sahayEmId?: string | null;
  isDeactivated?: boolean;
  departmentId?: string | null;
  departmentName?: string | null;
  designationId?: string | null;
  designationName?: string | null;
  photo?: string | null;
  createdAt?: string;
  updatedAt?: string;
  createBy?: string;
  updateBy?: string;
}

interface TeamNodeData {
  label: string;
  position: string;
  color: string;
  department: string;
  image: string | null;
  photo?: string | null;
  employeeName?: string;
  designationName?: string;
  departmentName?: string;
  employeeId?: string | null;
  email?: string;
  phone?: string;
  hasChildren?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: (nodeId: string) => void;
  onEdit?: (nodeId: string) => void;
  onAddChild?: (nodeId: string) => void;
  [key: string]:
    | string
    | boolean
    | ((nodeId: string) => void)
    | null
    | undefined;
}

interface PaginationFilter {
  currentPage?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

type PagingTeam = BaseResponse<Team>;
type TeamPositionsResponse = CommonResponse<TeamPosition[]>;
type TeamPositionResponse = CommonResponse<TeamPosition>;
type DeleteRes = CommonResponse<Team>;
