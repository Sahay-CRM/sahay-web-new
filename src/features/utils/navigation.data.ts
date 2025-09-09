export const companyNavigationData = [
  {
    id: 1,
    icon: "UserCheck",
    label: "Company Designation",
    link: "/dashboard/company-designation",
    permission: "View",
    moduleKey: "DESIGNATION",
  },
  {
    id: 2,
    icon: "Users",
    label: "Company Employee",
    link: "/dashboard/company-employee",
    permission: "View",
    moduleKey: "EMPLOYEE",
  },
  {
    id: 3,
    icon: "Calendar",
    label: "Calendar",
    link: "/dashboard/calendar",
    permission: "View",
    moduleKey: "IMPORTANT_DATE",
  },
  {
    id: 4,
    icon: "Presentation",
    label: "Meetings",
    permission: "View",
    // moduleKey: "MEETING_LIST",
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
    id: 5,
    icon: "Target",
    label: "Agenda",
    permission: "View",
    // moduleKey: "OBJECTIVE",
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
        label: "Objective",
        link: "/dashboard/objective",
        permission: "View",
        moduleKey: "OBJECTIVE",
      },
    ],
  },
  {
    id: 6,
    icon: "CheckSquare",
    label: "Company Task List",
    permission: "View",
    moduleKey: "TASK",
    items: [
      {
        id: 1,
        label: "Company Task List",
        link: "/dashboard/tasks",
        permission: "View",
        moduleKey: "TASK",
      },
      {
        id: 2,
        label: "Company Repetition Task ",
        link: "/dashboard/tasksrepeat",
        permission: "View",
        moduleKey: "TASK",
      },
    ],
  },
  // {
  //   id: 6,
  //   icon: "CheckSquare",
  //   label: "Company Task List",
  //   link: "/dashboard/tasks",
  //   permission: "View",
  //   moduleKey: "TASK",
  // },
  {
    id: 7,
    icon: "FolderOpen",
    label: "Company Project List",
    link: "/dashboard/projects",
    permission: "View",
    moduleKey: "PROJECT_LIST",
  },
  // {
  //   id: 8,
  //   icon: "BarChart3",
  //   label: "KPI List",
  //   link: "/dashboard/kpi",
  //   permission: "View",
  //   moduleKey: "DATAPOINT_LIST",
  // },
  {
    id: 8,
    icon: "BarChart3",
    label: "KPI List",
    permission: "View",
    // moduleKey: "DATAPOINT_LIST",
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
    id: 9,
    icon: "TrendingUp",
    label: "KPI Dashboard",
    link: "/dashboard/kpi-dashboard",
    permission: "View",
    moduleKey: "DATAPOINT_TABLE",
  },
  // {
  //   id: 9,
  //   icon: "bx bxs-business",
  //   label: "Health Score",
  //   link: "/dashboard/healthscore-achieve",
  //   permission: "View",
  //   moduleKey: "HEALTH_SCORE",
  // },
  {
    id: 10,
    icon: "Heart",
    label: "Business Health",
    permission: "View",
    // moduleKey: "BUSINESS_HEALTH",
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
        id: 2,
        label: "Company Level Assign",
        link: "/dashboard/business/company-level-assign",
        permission: "View",
        moduleKey: "COMPANY_LEVEL_ASSIGN",
      },
    ],
  },
  {
    id: 11,
    icon: "Shield",
    label: "Role & Permission",
    link: "/dashboard/roles/user-permission",
    permission: "View",
    moduleKey: "ROLES_PERMISSION",
  },
  {
    id: 12,
    icon: "ListTodo",
    label: "My Day",
    link: "/dashboard/todo-list",
    permission: "View",
    moduleKey: "TASK",
  },
  {
    id: 13,
    icon: "GitPullRequestArrow",
    label: "My Requests",
    link: "/dashboard/requests",
    permission: "View",
    moduleKey: "TASK",
  },
  // {
  //   id: 12,
  //   icon: "Tag",
  //   label: "Brand",
  //   link: "/dashboard/brand",
  //   permission: "View",
  //   moduleKey: "BRAND",
  // },
  // {
  //   id: 13,
  //   icon: "Package",
  //   label: "Product",
  //   link: "/dashboard/product",
  //   permission: "View",
  //   moduleKey: "PRODUCT",
  // },
  // {
  //   id: 14,
  //   icon: "Logs",
  //   label: "User Log",
  //   link: "/dashboard/user-log",
  //   permission: "View",
  //   moduleKey: "USER_LOGS",
  // },
  // {
  //   id: 15,
  //   icon: "bx bx-cog",
  //   label: "Settings",
  //   link: "/dashboard/calendar",
  //   permission: "View",
  //   moduleKey: "ROLES_PERMISSION",
  // },
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
