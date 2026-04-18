const mockDashboardData: DashboardData = {
  taskInsights: {
    summary: {
      notUpdated: 50,
      total: 50,
      delayed: 50,
    },
    kpis: [
      { businessFunction: "Human Resource", total: 5, filling: 5 },
      { businessFunction: "Finance", total: 2, filling: 2 },
      { businessFunction: "Unknowns", total: 8, filling: 8 },
      { businessFunction: "Operations", total: 10, filling: 7 },
      { businessFunction: "Marketing", total: 4, filling: 4 },
      { businessFunction: "Sales", total: 12, filling: 10 },
      { businessFunction: "IT Support", total: 3, filling: 2 },
      { businessFunction: "Legal", total: 1, filling: 1 },
    ],
    liveMeetings: {
      totalLiveMeetings: 50,
      totalSahayLiveMeetings: 50,
      missedLiveMeetings: 50,
      notesPerMinute: 50,
      otherNotesPerMeeting: 50,
      noteTagsPerMeeting: 50,
    },
    meetingInsights: {
      backendWork: 50,
      chat: 50,
      online: 50,
      onsite: 50,
      voiceCall: 50,
      creationRate: 50,
    },
  },
  longTermTasks: [
    {
      name: "yearly multi date (02/05)",
      duration: "1 year",
      dueDate: "02/05/2026 11:59 PM",
      assignee: "Anil Moolchandani",
      status: "In Progress",
    },
    {
      name: "yearly multi date (02/05)",
      duration: "1 year",
      dueDate: "02/05/2026 11:59 PM",
      assignee: "Anil Moolchandani",
      status: "In Progress",
    },
    {
      name: "yearly multi date (02/05)",
      duration: "1 year",
      dueDate: "02/05/2026 11:59 PM",
      assignee: "Anil Moolchandani",
      status: "In Progress",
    },
    {
      name: "yearly multi date (02/05)",
      duration: "1 year",
      dueDate: "02/05/2026 11:59 PM",
      assignee: "Anil Moolchandani",
      status: "In Progress",
    },
    {
      name: "yearly multi date (02/05)",
      duration: "1 year",
      dueDate: "02/05/2026 11:59 PM",
      assignee: "Anil Moolchandani",
      status: "In Progress",
    },
  ],
  projectInsights: {
    businessFunctions: [
      { businessFunction: "Human Resource", total: 5, active: 5, delayed: 5 },
      { businessFunction: "Finance", total: 2, active: 2, delayed: 2 },
      { businessFunction: "Unknowns", total: 8, active: 8, delayed: 8 },
      { businessFunction: "Operations", total: 15, active: 10, delayed: 5 },
      { businessFunction: "Marketing", total: 7, active: 5, delayed: 2 },
      { businessFunction: "Sales", total: 20, active: 18, delayed: 2 },
      { businessFunction: "IT Support", total: 4, active: 4, delayed: 0 },
    ],
    summary: {
      zeroTask: 50,
      delayed: 50,
      creationRate: 50,
    },
    longTermProjects: [
      {
        name: "Competitor Social Media Tracking",
        duration: "1 year",
        dueDate: "15/05/2025",
      },
      {
        name: "Documentation and Logistics",
        duration: "1 year",
        dueDate: "16/05/2025",
      },
      {
        name: "Performance Management System",
        duration: "1 year",
        dueDate: "18/05/2025",
      },
      {
        name: "Streamlining Accounts Department",
        duration: "1 year",
        dueDate: "18/05/2025",
      },
      {
        name: "Targeted marketing to employees of...",
        duration: "1 year",
        dueDate: "18/05/2025",
      },
    ],
    mostDelayedProjects: [
      { name: "yearly multi date (02/05)", duration: "1 year" },
      { name: "yearly multi date (02/05)", duration: "1 year" },
      { name: "yearly multi date (02/05)", duration: "1 year" },
      { name: "yearly multi date (02/05)", duration: "1 year" },
      { name: "yearly multi date (02/05)", duration: "1 year" },
    ],
    agenda: {
      unresolved: [
        {
          name: "Attendance & Absenteeism Tracking Report",
          duration: "1 year",
        },
        { name: "Employee Behaviour & Punctuality", duration: "1 year" },
        {
          name: "Lack of availability of structure Promotional Material",
          duration: "1 year",
        },
        { name: "Escalations for Management", duration: "1 year" },
        { name: "LAT AM access challenges", duration: "1 year" },
      ],
      unresolvedCount: 50,
      resolvedCount: 50,
      parkedCount: 50,
    },
  },
};
export default mockDashboardData;
