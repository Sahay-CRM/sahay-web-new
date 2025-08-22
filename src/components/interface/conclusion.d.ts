interface AgendaResConclusion {
  srNo: number;
  detailMeetingAgendaIssueId: string;
  detailMeetingId: string;
  issueObjectiveId: string;
  agendaType: "issue" | "objective";
  actualTime: string;
  plannedTime: string;
  sequence: null;
  discussion: {
    taskUpdate: TaskUpdate[];
    projectUpdate: ProjectUpdate[];
    kpiUpdate: KpiUpdate[];
  };
  name: string;
}

interface MeetingConclusionData {
  agendaPlanned: string;
  agendaActual: string;
  meetingPlanned: string;
  meetingActual: string;
  conclusionPlanned: string;
  conclusionActual: string;
  agendaTotalPlanned: string;
  agendaTotalActual: string;
  noOfTasks?: number;
  noOfProjects?: number;
  noOfKPIs?: number;
  agenda: AgendaResConclusion[];
  discussionTotalActual?: string;
}

interface TaskUpdate {
  oldValues: TaskValues;
  newValues: TaskValues;
}

interface TaskValues {
  taskName: string;
  taskDescription: string;
  taskDeadline: string;
  taskType: string;
  taskStatus: string;
  project: string;
  meeting: string;
  subParameters: string;
  taskEmployees: string;
}

interface ProjectUpdate {
  oldValues: ProjectValues;
  newValues: ProjectValues;
}

interface ProjectValues {
  projectName: string;
  projectDescription: string;
  projectDeadline: string;
  projectStatus: string;
  subParameters: string;
  projectEmployees: string;
}

interface KpiUpdate {
  oldValues: KpiValues;
  newValues: KpiValues;
  oldData?: KpiRecordedData[];
  newData?: KpiRecordedData[];
}

interface KpiValues {
  kpiName: string;
  kpiFrequency: string;
  kpiValidationType: string;
  kpiVisualFrequencyTypes: null;
  kpiUnit: string;
  value1: string;
  value2: string | null;
  tag?: string;
}

interface KpiRecordedData {
  kpiId: string;
  startDate: string;
  endDate: string;
  data: string | null;
}

interface TipItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}
