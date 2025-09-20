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
  onSave: (data: CustomObj) => void;
  defaultValues?: CustomObj;
}

interface WeeklyPattern {
  week: number | null;
  daysOfWeek: number[];
}

interface WeekDaysMapping {
  week: number;
  daysOfWeek: number[];
}

interface RepeatPattern {
  months: number[];
  weekDaysMapping: WeekDaysMapping[];
  dates: number[];
  multiSelect: boolean;
  daysOfWeek: number[];
}

interface CustomObj {
  baseFrequency: FrequencyType;
  repeatPattern: RepeatPattern;
}
