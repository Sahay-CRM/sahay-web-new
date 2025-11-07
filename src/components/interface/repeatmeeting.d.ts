interface CustomModalFilePropsREPT {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: CustomObjREPT) => void;
  defaultValues?: CustomObjREPT;
  multiSelectAllow?: boolean;
}

interface WeeklyPatternREPT {
  week: number | null;
  daysOfWeek: number[];
}

interface WeekDaysMappingREPT {
  week: number;
  days: string | string[];
}

interface RepeatPatternREPT {
  months?: string[];
  weekDaysMapping?: WeekDaysMappingREPT[];
  dates?: number[];
  daysOfWeek?: string[];
  multiSelect?: boolean;
}

interface CustomObjREPT {
  frequency: FrequencyType;
  // repeatPattern?: RepeatPattern;
  months?: string[];
  month?: string;
  weekDaysMapping?: WeekDaysMappingREPT[];
  dates?: number[];
  daysOfWeek?: string[];
  multiSelect?: boolean;
  timezone: string;
  interval?: number;
  endOfMonth?: boolean | null;
}

interface CustomRepeatConfig {
  frequency: string;
  interval?: number;
  daysOfWeek?: string[];
  dates?: number[];
  weekPatterns?: Array<{ week: number; day: string }>;
  endOfMonth?: boolean;
  month?: string;
  date?: number;
  timezone?: string;
}
