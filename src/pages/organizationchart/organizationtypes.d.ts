interface AssignedEmployee {
  employeeId: string;
  employeeName: string;
  employeeEmail?: string;
  employeeMobile?: string;
  employeeType?: string;
  departmentName?: string | null;
  designationName?: string | null;
  photo?: string | null;
}

interface OrgNodeData {
  seatTitle: string;
  department: string;
  employees: AssignedEmployee[];
  isManager?: boolean;
  isDeptHead?: boolean;
  hasChildren?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: (id: string) => void;
  onAddChild?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onRemoveEmployee?: (employeeId: string) => void;
}

interface AddSeatFormData {
  seatTitle: string;
  employeeId: string[];
  isDeptHead: boolean;
  isManager: boolean;
  parentPositionId: string;
  createAnother: boolean;
}

interface AddSeatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddSeatFormData) => void;
  isLoading?: boolean;
  positions: TeamPosition[];
  companyId?: string;
  initialParentId?: string;
}

interface TeamPosition {
  positionId: string;
  seatTitle?: string;
  employeeName?: string;
  employeeId?: string;
  parentPositionId?: string | null;
  designationName?: string;
  departmentName?: string;
  employeeType?: string;
  isDeptHead?: boolean;
  isManager?: boolean;
  employees?: AssignedEmployee[];
}

interface EditSeatSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddSeatFormData) => void;
  isLoading?: boolean;
  positions: TeamPosition[];
  companyId?: string;
  initialData: AddSeatFormData | null;
  isRoot?: boolean;
}

interface CtxMenuProps {
  x: number;
  y: number;
  onAddChild: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

interface SpanOfControl {
  totalNonManagers: number;
  totalManagers: number;
  ratio: number;
  type: string;
  description: string;
}

interface ToolbarProps {
  totalNodes: number;
  visibleLevel: number;
  maxLevel: number;
  onLevelChange: (level: number) => void;
  onSearch: (q: string) => void;
  onAddSeat: () => void;
  spanOfControl?: SpanOfControl | null;
  permission?: permission;
}
