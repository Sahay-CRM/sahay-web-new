export interface TaskData {
  status: string;
  color: string;
  value: number; // For graphs
}

export interface Task {
  name: string;
  dailyData: Record<string, TaskData>;
}

export interface Project {
  id: string;
  name: string;
  tasks: Task[];
}

export const dates = [
  "12-Dec-2025",
  "13-Dec-2025",
  "14-Dec-2025",
  "15-Dec-2025",
  "16-Dec-2025",
  "17-Dec-2025",
  "18-Dec-2025",
  "19-Dec-2025",
  "20-Dec-2025",
];

export const projectData: Project[] = [
  {
    id: "adishwar",
    name: "Adishwar",
    tasks: [
      {
        name: "Delayed tasks or Projects",
        dailyData: {
          "12-Dec-2025": { status: "Done", color: "#15803d", value: 10 },
          "13-Dec-2025": { status: "Yes, few", color: "#86efac", value: 7 },
          "14-Dec-2025": { status: "", color: "#ffffff", value: 0 },
          "15-Dec-2025": { status: "Yes, few", color: "#86efac", value: 7 },
          "16-Dec-2025": { status: "Yes, few", color: "#86efac", value: 7 },
          "17-Dec-2025": { status: "Yes, few", color: "#86efac", value: 7 },
          "18-Dec-2025": { status: "Yes, few", color: "#86efac", value: 7 },
          "19-Dec-2025": { status: "Yes, few", color: "#86efac", value: 7 },
          "20-Dec-2025": { status: "Yes, few", color: "#86efac", value: 7 },
        },
      },
      {
        name: "Meetings pending",
        dailyData: {
          "12-Dec-2025": { status: "Done", color: "#15803d", value: 10 },
          "13-Dec-2025": { status: "None", color: "#15803d", value: 10 },
          "14-Dec-2025": { status: "", color: "#ffffff", value: 0 },
          "15-Dec-2025": { status: "None", color: "#15803d", value: 10 },
          "16-Dec-2025": { status: "None", color: "#15803d", value: 10 },
          "17-Dec-2025": { status: "Yes, few", color: "#86efac", value: 7 },
          "18-Dec-2025": { status: "None", color: "#15803d", value: 10 },
          "19-Dec-2025": { status: "Yes, al...", color: "#991b1b", value: 2 },
          "20-Dec-2025": { status: "Yes, few", color: "#86efac", value: 7 },
        },
      },
      {
        name: "Meeting note-taking efficiency",
        dailyData: {
          "12-Dec-2025": { status: "Done", color: "#15803d", value: 10 },
          "13-Dec-2025": {
            status: "Slow & Inc...",
            color: "#991b1b",
            value: 2,
          },
          "14-Dec-2025": { status: "", color: "#ffffff", value: 0 },
          "15-Dec-2025": { status: "Slow ...", color: "#991b1b", value: 2 },
          "16-Dec-2025": { status: "Slow ...", color: "#991b1b", value: 2 },
          "17-Dec-2025": { status: "Slow ...", color: "#991b1b", value: 2 },
          "18-Dec-2025": { status: "Slow ...", color: "#991b1b", value: 2 },
          "19-Dec-2025": { status: "Slow ...", color: "#991b1b", value: 2 },
          "20-Dec-2025": { status: "Slow ...", color: "#991b1b", value: 2 },
        },
      },
      {
        name: "Project Task creation from meeting",
        dailyData: {
          "12-Dec-2025": { status: "Done", color: "#15803d", value: 10 },
          "13-Dec-2025": { status: "All created", color: "#15803d", value: 10 },
          "14-Dec-2025": { status: "", color: "#ffffff", value: 0 },
          "15-Dec-2025": { status: "Some ...", color: "#fca5a5", value: 4 },
          "16-Dec-2025": { status: "Some ...", color: "#fca5a5", value: 4 },
          "17-Dec-2025": { status: "Some ...", color: "#fca5a5", value: 4 },
          "18-Dec-2025": { status: "Some ...", color: "#fca5a5", value: 4 },
          "19-Dec-2025": { status: "Some ...", color: "#fca5a5", value: 4 },
          "20-Dec-2025": { status: "Some ...", color: "#fca5a5", value: 4 },
        },
      },
      {
        name: "KPI Creation",
        dailyData: {
          "12-Dec-2025": { status: "Done", color: "#15803d", value: 10 },
          "13-Dec-2025": { status: "Incomplet...", color: "#fca5a5", value: 4 },
          "14-Dec-2025": { status: "", color: "#ffffff", value: 0 },
          "15-Dec-2025": { status: "Incom...", color: "#fca5a5", value: 4 },
          "16-Dec-2025": { status: "Incom...", color: "#fca5a5", value: 4 },
          "17-Dec-2025": { status: "Incom...", color: "#fca5a5", value: 4 },
          "18-Dec-2025": { status: "Incom...", color: "#fca5a5", value: 4 },
          "19-Dec-2025": { status: "Incom...", color: "#fca5a5", value: 4 },
          "20-Dec-2025": { status: "Incom...", color: "#fca5a5", value: 4 },
        },
      },
      {
        name: "KPI data filing",
        dailyData: {
          "12-Dec-2025": { status: "Done", color: "#15803d", value: 10 },
          "13-Dec-2025": {
            status: "No data fill...",
            color: "#991b1b",
            value: 2,
          },
          "14-Dec-2025": { status: "", color: "#ffffff", value: 0 },
          "15-Dec-2025": { status: "Compl...", color: "#15803d", value: 10 },
          "16-Dec-2025": { status: "Compl...", color: "#15803d", value: 10 },
          "17-Dec-2025": { status: "Partial", color: "#86efac", value: 6 },
          "18-Dec-2025": { status: "Majorlt...", color: "#fca5a5", value: 3 },
          "19-Dec-2025": { status: "No dat...", color: "#991b1b", value: 2 },
          "20-Dec-2025": { status: "Compl...", color: "#15803d", value: 10 },
        },
      },
    ],
  },
  {
    id: "delwis",
    name: "Delwis",
    tasks: [
      {
        name: "Delayed tasks or Projects",
        dailyData: {
          "12-Dec-2025": { status: "Done", color: "#15803d", value: 10 },
          "13-Dec-2025": { status: "Yes, few", color: "#86efac", value: 7 },
          "14-Dec-2025": { status: "", color: "#ffffff", value: 0 },
          "15-Dec-2025": { status: "Yes, few", color: "#86efac", value: 7 },
          "16-Dec-2025": { status: "Yes, few", color: "#86efac", value: 7 },
          "17-Dec-2025": { status: "Yes, few", color: "#86efac", value: 7 },
          "18-Dec-2025": { status: "Yes, few", color: "#86efac", value: 7 },
          "19-Dec-2025": { status: "Yes, few", color: "#86efac", value: 7 },
          "20-Dec-2025": { status: "Yes, few", color: "#86efac", value: 7 },
        },
      },
    ],
  },
];
