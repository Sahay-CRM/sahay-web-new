interface OrgNodeData {
  label: string;
  title: string;
  department: string;
  employeeId?: string;
  hasChildren?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: (id: string) => void;
  onAddChild?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onRemoveEmployee?: (employeeId: string) => void;
  onSeparatePosition?: (id: string) => void;
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
  employeeName?: string;
  employeeId?: string;
  parentPositionId?: string | null;
  designationName?: string;
  departmentName?: string;
  employeeType?: string;
  isDeptHead?: boolean;
  isManager?: boolean;
}

interface EditSeatSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddSeatFormData) => void;
  isLoading?: boolean;
  positions: TeamPosition[];
  companyId?: string;
  initialData: AddSeatFormData | null;
}

interface CtxMenuProps {
  x: number;
  y: number;
  onAddChild: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onRemoveEmployee?: () => void;
  onSeparatePosition?: () => void;
  onClose: () => void;
}

interface ToolbarProps {
  totalNodes: number;
  visibleLevel: number;
  maxLevel: number;
  onLevelChange: (level: number) => void;
  direction: "TB" | "LR";
  onDirectionChange: (d: "TB" | "LR") => void;
  onCollapseAll: () => void;
  onExpandAll: () => void;
  onFitView: () => void;
  onSearch: (q: string) => void;
  onAddSeat: () => void;
}
