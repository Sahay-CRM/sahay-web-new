interface ProjectInsight {
  businessFunction: string;
  total: number;
  active: number;
  delayed: number;
}

interface TaskInsight {
  businessFunction: string;
  total: number;
  filling: number;
}

interface LongTermTask {
  name: string;
  duration: string;
  dueDate: string;
  assignee: string;
  status: "In Progress" | "Completed" | "Pending";
}

interface LongTermProject {
  name: string;
  duration: string;
  dueDate?: string;
}

interface AgendaItem {
  name: string;
  duration: string;
}

interface DashboardData {
  taskInsights: {
    kpis: TaskInsight[];
    liveMeetings: {
      totalLiveMeetings: number;
      totalSahayLiveMeetings: number;
      missedLiveMeetings: number;
      notesPerMinute: number;
      otherNotesPerMeeting: number;
      noteTagsPerMeeting: number;
    };
    meetingInsights: {
      backendWork: number;
      chat: number;
      online: number;
      onsite: number;
      voiceCall: number;
      creationRate: number;
    };
    summary: {
      notUpdated: number;
      total: number;
      delayed: number;
    };
  };
  projectInsights: {
    businessFunctions: ProjectInsight[];
    summary: {
      zeroTask: number;
      delayed: number;
      creationRate: number;
    };
    longTermProjects: LongTermProject[];
    mostDelayedProjects: LongTermProject[];
    agenda: {
      unresolved: AgendaItem[];
      unresolvedCount: number;
      resolvedCount: number;
      parkedCount: number;
    };
  };
  longTermTasks: LongTermTask[];
}
