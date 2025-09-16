interface TodoItem {
  toDoId: string;
  toDoName: string;
  isCompleted: boolean;
  employeeId: string;
  companyId: string;
  dueDate: string | null;
  isOverdue: boolean | null;
  orgDate: string; // ISO string
  repeatType: RepeatType;
  createdBy: string;
  createdAt: string;
  updatedBy: string | null;
  updatedAt: string;
  files: FileItem[];
  customObj: CustomObj | null;
}

interface FileItem {
  id?: string;
  name?: string;
  url?: string;
}

interface TaskSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string | null;
  taskTitle: string | null;
}

interface Note {
  id: number;
  note: string;
  createdAt: Date;
}

interface TODONotesRes {
  note: string;
  toDoNoteId: string;
  createdAt: string;
  noteType?: string;
}

interface ToDoList {
  srNo?: number;
  toDoId?: string;
  toDoName?: string;
  isCompleted?: boolean;
  employeeId?: string;
  dueDate?: string;
  isOverdue?: boolean | null;
  orgDate?: string;
  repeatType?: string;
}

interface CustomModalFileProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: repeatTyped) => void;
  defaultValues?: CustomObj;
}
interface CustomObj {
  days?: number[];
  baseFrequency: string;
  toDoId?: string;
  dateOrWeekly?: string;
  date: number | null;
  nWeek: number | "";
  qMonth: number | null | "";
  hMonth: HalfType | number | null | "";
  month: number | null;
}
interface repeatTyped {
  baseFrequency: string;
  toDoId?: string;
  dateOrWeekly?: string;
  date: number | null;
  nWeek: number | "";
  days: number[] | null;
  qMonth: number | null | "";
  hMonth: HalfType | number | null | "";
  month: number | null;
}
