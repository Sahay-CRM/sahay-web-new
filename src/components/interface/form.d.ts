type FieldType =
  | "TEXT"
  | "TEXTAREA"
  | "NUMBER"
  | "EMAIL"
  | "PHONE"
  | "SELECT"
  | "RADIO"
  | "CHECKBOX"
  | "DATE"
  | "FILE"
  | "FILE"
  | "QUESTION";

interface Option {
  id: string;
  text: string;
}

interface Question {
  id: string; // Internal React key
  name: string; // Backend identifier e.g. "full_name"
  label: string; // Backend "label"
  fieldType: FieldType; // Backend "fieldType"
  isRequired: boolean; // Backend "isRequired"
  order: number; // Backend "order"
  placeholder?: string; // Backend "placeholder"
  options?: Option[]; // Internal list for UI
  description?: string; // UI only? User didn't specify but good for UX
  correctAnswer?: string | string[]; // For quiz/grading mode
  isMcq?: boolean;
}

interface FormSettings {
  isQuiz: boolean;
  collectEmails: boolean;
  limitToOneResponse: boolean;
  allowEditing: boolean;
  showProgressBar: boolean;
  shuffleQuestionOrder: boolean;

  // Behavior-based restrictions
  tabSwitchDetection: boolean;
  maxTabSwitches: number;
  focusLossDetection: boolean;
  maxFocusLoss: number;
  fullscreenMonitoring: boolean;
  maxFullscreenExits: number;
  windowResizeSuspicion: boolean;
  inactivityDetection: boolean;
  maxInactivityMinutes: number;
  copyProtection: boolean;
  pasteProtection: boolean;
  rightClickProtection: boolean;
  screenshotProtection: boolean;

  // Navigation & Session Restrictions
  pageRefreshWarning: boolean;
  backButtonWarning: boolean;
  singleAttemptEnforcement: boolean;
  deviceChangeDetection: boolean;
  ipChangeMonitoring: boolean;

  // Hardware Permissions (Non-forced)
  cameraPermissionCheck: boolean;
  microphonePermissionAwareness: boolean;

  // Access Control
  accessType: "public" | "private" | "restricted";
  allowedEmails?: string[];
  formPassword?: string;

  // Timer
  totalTimerEnabled: boolean;
  totalTimerMinutes: number;
  perQuestionTimerEnabled: boolean;
  autoMoveOnTimerExpire: boolean;
  lockPreviousAnswers: boolean;

  // UX & Integrity
  randomAttentionChecks: boolean;
  sectionLocking: boolean;
  integrityBanner: boolean;
  autoScreenshotCapture: boolean;
  autoScreenshotIntervalMinutes: number; // min 5
}

interface FormResponseItem {
  id: string;
  submissionId: string;
  formFieldId: string;
  value: string;
  fileUrl: string | null;
  createdAt: string;
  field: Question;
}

interface FormError {
  id: string;
  submissionId: string;
  errorCode: string;
  errorMessage: string;
  createdAt: string;
  updatedAt: string;
}

interface FormSubmission {
  id: string;
  formId: string;
  mobileNumber: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  status: "SUBMITTED" | "SUBMITTED_WITH_ERROR" | "PENDING";
  formResponses: FormResponseItem[];
  formErrors: FormError[];
}

interface FormMediaItem {
  id: string;
  refId: string;
  fileUrl: string;
  fileType: string;
  mobileNumber: string | null;
  createdAt: string;
}

interface FormDetails {
  id: string;
  name: string;
  status?: string;
  createdDatetime?: string;
  updatedDatetime?: string;
  description?: string;
  notificationEmail?: string;
  isActive: boolean;
  visibility: "PUBLIC" | "PRIVATE" | "RESTRICTED";
  mobileNumbers: string[];
  fields: Question[];
  formSettings: FormSettings;
  formSubmissions?: FormSubmission[];
  formMedia?: FormMediaItem[];
  themeColor?: string;
  backgroundColor?: string;
  responseMessage?: string;
  expireDate?: string;
}

interface Violation {
  type:
    | "tab_switch"
    | "focus_loss"
    | "fullscreen_exit"
    | "resize"
    | "copy"
    | "paste"
    | "right_click"
    | "inactivity"
    | "refresh"
    | "back_button"
    | "device_change"
    | "ip_change"
    | "camera_denied"
    | "mic_denied"
    | "attention_failed"
    | "screenshot";
  timestamp: number;
  details?: string;
}

interface FormResponse {
  status: boolean;
  message?: string;
  data?: FormDetails;
}

interface FormListResponse {
  status: boolean;
  message?: string;
  data?: FormDetails[];
}
