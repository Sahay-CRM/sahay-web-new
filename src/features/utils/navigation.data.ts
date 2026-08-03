export const companyNavigationData = [
  {
    id: 1,
    icon: "CalendarRange",
    label: "My Day",
    link: "/dashboard/repeat-task-list",
    permission: "View",
    moduleKey: "ROUTINE_TASK",
  },
  {
    id: 2,
    icon: "Presentation",
    label: "Organization ",
    permission: "View",
    moduleKey: [
      "DESIGNATION",
      "EMPLOYEE",
      "ORG_STRUCTURE",
      "BLUEPRINT",
      "SAHAY_EMP",
    ],
    // link: "/dashboard/meeting",
    items: [
      {
        id: 1,
        icon: "UserCheck",
        label: " Designation",
        link: "/dashboard/company-designation",
        permission: "View",
        moduleKey: "DESIGNATION",
      },
      {
        id: 2,
        icon: "Users",
        label: " Employee",
        link: "/dashboard/company-employee",
        permission: "View",
        moduleKey: "EMPLOYEE",
      },
      {
        id: 3,
        icon: "Network",
        label: "Structure",
        link: "/dashboard/organization-structure",
        permission: "View",
        moduleKey: "ORG_STRUCTURE",
      },
      {
        id: 4,
        icon: "LayoutTemplate",
        label: "Blueprint",
        link: "/dashboard/blueprint",
        permission: "View",
        moduleKey: "BLUEPRINT",
      },
      {
        id: 5,
        icon: "Users",
        label: "Sahay Teammate",
        link: "/dashboard/sahay-teammate",
        permission: "View",
        moduleKey: "SAHAY_EMP",
      },
    ],
  },
  {
    id: 3,
    icon: "ListTodo",
    label: "Performance Insights",
    link: "/dashboard/reports",
    permission: "View",
    moduleKey: "PERFORMANCE_REPORTS",
  },
  {
    id: 4,
    icon: "Calendar",
    label: "Calendar",
    link: "/dashboard/calendar",
    permission: "View",
    moduleKey: "IMPORTANT_DATE",
  },
  {
    id: 5,
    icon: "Presentation",
    label: "Meetings",
    permission: "View",
    moduleKey: ["MEETING_LIST", "LIVE_MEETING", "LIVE_MEETING_TEMPLATES"],
    // link: "/dashboard/meeting",
    items: [
      {
        id: 1,
        label: "Meeting List",
        link: "/dashboard/meeting",
        permission: "View",
        moduleKey: "MEETING_LIST",
      },
      {
        id: 2,
        label: "Live Meetings",
        link: "/dashboard/meeting/detail",
        permission: "View",
        moduleKey: "LIVE_MEETING",
      },
      {
        id: 3,
        label: "Live Meetings Templates",
        link: "/dashboard/repeat-meeting",
        permission: "View",
        moduleKey: "LIVE_MEETING_TEMPLATES",
      },
    ],
  },
  {
    id: 6,
    icon: "Target",
    label: "Agenda",
    permission: "View",
    moduleKey: ["OBJECTIVE", "ISSUES"],
    items: [
      {
        id: 1,
        label: "Issues",
        link: "/dashboard/issues",
        permission: "View",
        moduleKey: "ISSUES",
      },
      {
        id: 2,
        label: "Objectives",
        link: "/dashboard/objective",
        permission: "View",
        moduleKey: "OBJECTIVE",
      },
    ],
  },
  {
    id: 7,
    icon: "CheckSquare",
    label: "Tasks",
    permission: "View",
    moduleKey: ["TASK", "ROUTINE_TASK"],
    items: [
      {
        id: 1,
        label: "Task List",
        link: "/dashboard/tasks",
        permission: "View",
        moduleKey: "TASK",
      },
      {
        id: 2,
        label: "Task Repetition",
        link: "/dashboard/tasksrepeat",
        permission: "View",
        moduleKey: "ROUTINE_TASK",
      },
      {
        id: 3,
        label: "Reports Library",
        link: "/dashboard/company-reports",
        permission: "View",
        moduleKey: "TASK",
      },
    ],
  },
  {
    id: 8,
    icon: "FolderOpen",
    label: "Projects",
    link: "/dashboard/projects",
    permission: "View",
    moduleKey: "PROJECT_LIST",
  },
  {
    id: 9,
    icon: "BarChart3",
    label: "KPI List",
    permission: "View",
    moduleKey: ["DATAPOINT_LIST"],
    items: [
      {
        id: 1,
        label: "KPI List",
        link: "/dashboard/kpi",
        permission: "View",
        moduleKey: "DATAPOINT_LIST",
      },
      {
        id: 2,
        label: "KPI Group",
        link: "/dashboard/kpi/group-kpis",
        permission: "View",
        moduleKey: "DATAPOINT_LIST",
      },
    ],
  },
  {
    id: 10,
    icon: "TrendingUp",
    label: "KPI Dashboard",
    link: "/dashboard/kpi-dashboard",
    permission: "View",
    moduleKey: "DATAPOINT_TABLE",
  },
  {
    id: 11,
    icon: "Heart",
    label: "Business Health",
    permission: "View",
    moduleKey: ["COMPANY_LEVEL_ASSIGN", "HEALTH_WEIGHTAGE", "HEALTH_SCORE"],
    items: [
      {
        id: 1,
        label: "Health Weightage",
        link: "/dashboard/business/health-weightage",
        permission: "View",
        moduleKey: "HEALTH_WEIGHTAGE",
      },
      {
        id: 2,
        label: "Health Score",
        link: "/dashboard/business/healthscore-achieve",
        permission: "View",
        moduleKey: "HEALTH_SCORE",
      },
      {
        id: 3,
        label: "Company Level Assign",
        link: "/dashboard/business/company-level-assign",
        permission: "View",
        moduleKey: "COMPANY_LEVEL_ASSIGN",
      },
    ],
  },
  {
    id: 12,
    icon: "Presentation",
    label: "Other",
    permission: "View",
    moduleKey: ["TASK", "FORM", "REQUESTMASTER", "HANDOVER"],
    // link: "/dashboard/meeting",
    items: [
      {
        id: 1,
        icon: "Ticket",
        label: "My Ticket",
        link: "/dashboard/requests",
        permission: "View",
        moduleKey: "TASK",
      },
      {
        id: 2,
        icon: "ListTodo",
        label: "Forms",
        link: "/dashboard/forms",
        permission: "View",
        moduleKey: "FORM",
      },
      {
        id: 3,
        icon: "ListTodo",
        label: "Request Master",
        link: "/dashboard/request-master",
        permission: "View",
        moduleKey: "REQUESTMASTER",
      },
      {
        id: 4,
        icon: "ListTodo",
        label: "Handover",
        link: "/dashboard/handover",
        permission: "View",
        moduleKey: "HANDOVER",
      },
    ],
  },
  {
    id: 13,
    icon: "Shield",
    label: "Role & Permission",
    permission: "View",
    moduleKey: ["ROLES_PERMISSION", "KPI_PERMISSION"],
    items: [
      {
        id: 1,
        label: "User Permission",
        link: "/dashboard/roles/user-permission",
        permission: "View",
        moduleKey: "ROLES_PERMISSION",
      },
      {
        id: 2,
        label: "KPI Permission",
        link: "/dashboard/roles/kpi-permission",
        permission: "View",
        moduleKey: "KPI_PERMISSION",
      },
    ],
  },
  {
    id: 14,
    icon: "CalendarRange",
    label: "Daily Planning",
    permission: "View",
    // moduleKey: ["ROLES_PERMISSION", "KPI_PERMISSION"],
    items: [
      {
        id: 1,
        label: "Check-in",
        link: "/dashboard/daily-planning/check-in",
        permission: "View",
        moduleKey: "ROLES_PERMISSION",
      },
      {
        id: 2,
        label: "Check-out",
        link: "/dashboard/daily-planning/check-out",
        permission: "View",
        moduleKey: "ROLES_PERMISSION",
      },
    ],
  },
  {
    id: 23,
    icon: "GanttChart",
    label: "Gantt",
    permission: "View",
    moduleKey: "GANTT_CHART",
    items: [
      {
        id: 1,
        label: "Workspaces",
        link: "/dashboard/gantt/workspaces",
        permission: "View",
        moduleKey: "GANTT_CHART",
      },
      {
        id: 2,
        label: "Templates",
        link: "/dashboard/gantt/templates",
        permission: "View",
        moduleKey: "GANTT_CHART",
      },
    ],
  },
];

export const getRouteByLabel = (label: string): string | null => {
  const normalize = (val: string) => val.toLowerCase().trim();
  const allNavItems: CompanyNavItem[] = [];
  const collectItems = (items: CompanyNavItem[]) => {
    items.forEach((item) => {
      allNavItems.push(item);
      if (item.items && Array.isArray(item.items)) {
        collectItems(item.items);
      }
    });
  };
  collectItems(companyNavigationData);

  const found = allNavItems.find(
    (item) => normalize(item.label) === normalize(label),
  );

  return found?.link ?? null;
};
