import { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "@/features/layouts/DashboardLayout/dashboardLayout";
import AddCompanyEmployee from "@/pages/companyEmployee/AddEmployeeFormModal/addEmployee";
import AddCompanyTaskList from "@/pages/companyTask/CompanyTaskFormModal/AddCompanyTaskList";
import AddCompanyMeeting from "@/pages/Meeting/AddMeetingFormModal/addMeeting";

const Theme = lazy(() => import("../pages/theme/Theme"));
const Profile = lazy(() => import("../pages/profile/Profile"));

const companydesignation = lazy(
  () => import("../pages/companyDesignation/companyDesignation"),
);
const companyemployee = lazy(
  () => import("../pages/companyEmployee/companyEmployee"),
);
const CompanyImportantDates = lazy(
  () => import("../pages/companyImportantDates/CompanyImportantDates"),
);
const CompanyMeeting = lazy(() => import("../pages/Meeting/MeetingList"));
const CompanyTask = lazy(() => import("../pages/companyTask/CompanyTaskList"));
const CompanyProjects = lazy(
  () => import("../pages/companyProjects/CompanyProjects"),
);
const CompanyProjectView = lazy(
  () => import("../pages/companyProjects/ViewProject/ViewProject"),
);
const DatapointList = lazy(
  () => import("../pages/datapointList/DatapointList"),
);
const userpermissionlist = lazy(
  () => import("../pages/Roles/Userpermissionlist"),
);
const UserPermissionEdit = lazy(
  () => import("../pages/Roles/userPermissionTable"),
);
const Healthscore = lazy(() => import("../pages/healthScore"));

const HealthWeightage = lazy(() => import("../pages/HealthWeightage"));

const CompanyLevelAssign = lazy(() => import("../pages/CompanyLevel"));
const CompanyTaskView = lazy(() => import("../pages/companyTask/ViewProject"));

const AddCompanyProjectList = lazy(
  () => import("../pages/companyProjects/AddProject"),
);

const AddCompanyDatapoint = lazy(
  () => import("../pages/datapointList/AddDatapointFormModal"),
);
const AddGraph = lazy(() => import("../pages/homePage"));
// const AddGraph = lazy(() => import("../pages/Graph/graph"));

const Brand = lazy(() => import("../pages/Brand"));
const Product = lazy(() => import("../pages/Product"));

const KPIDashboard = lazy(() => import("../pages/kpiDashboard/KpiDashboard"));
// const KPIVisualize = lazy(
//   () => import("../pages/kpiDashboard/KpiVisualizePage"),
// );

const UserLog = lazy(() => import("../pages/UserLog"));
const AllNotifications = lazy(
  () => import("../pages/notification/AllNotifications"),
);
const DetailMeeting = lazy(() => import("../pages/Meeting/MeetingDesc"));

const Issues = lazy(() => import("../pages/Obj/Issues"));
const Objective = lazy(() => import("../pages/Obj/Objective"));

export default function EmployeeRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<AddGraph />} />

        <Route path="notifications" Component={AllNotifications} />

        <Route path="profile" Component={Profile} />
        <Route path="settings" Component={Theme} />
        <Route path="company-designation" Component={companydesignation} />
        <Route path="company-employee" Component={companyemployee} />
        <Route path="employees/add" element={<AddCompanyEmployee />} />
        <Route path="employees/edit/:id" element={<AddCompanyEmployee />} />
        <Route path="calendar" Component={CompanyImportantDates} />

        <Route path="meeting" Component={CompanyMeeting} />
        <Route path="meeting/add" element={<AddCompanyMeeting />} />
        <Route path="meeting/edit/:id" element={<AddCompanyMeeting />} />

        <Route path="meeting/detail/:id" Component={DetailMeeting} />

        <Route path="issues" Component={Issues} />
        <Route path="objective" Component={Objective} />

        <Route path="tasks" Component={CompanyTask} />
        <Route path="tasks/add" element={<AddCompanyTaskList />} />
        <Route path="tasks/view/:id" element={<CompanyTaskView />} />
        <Route path="tasks/edit/:id" element={<AddCompanyTaskList />} />
        <Route path="projects" Component={CompanyProjects} />
        <Route path="projects/add" element={<AddCompanyProjectList />} />
        <Route path="projects/edit/:id" element={<AddCompanyProjectList />} />
        <Route path="projects/view/:id" Component={CompanyProjectView} />

        <Route path="kpi" Component={DatapointList} />
        <Route path="kpi/add" element={<AddCompanyDatapoint />} />
        <Route path="kpi/edit/:id" element={<AddCompanyDatapoint />} />

        <Route path="datapoint" Component={DatapointList} />
        <Route path="kpi-dashboard" Component={KPIDashboard} />
        {/* <Route path="kpi-visualize" Component={KPIVisualize} /> */}

        <Route path="healthscore-achieve" Component={Healthscore} />

        <Route path="business">
          <Route path="health-weightage" Component={HealthWeightage} />
          <Route path="healthscore-achieve" Component={Healthscore} />
          <Route path="company-level-assign" Component={CompanyLevelAssign} />
        </Route>

        <Route path="roles/user-permission">
          <Route index Component={userpermissionlist} />
          <Route path="edit/:id" Component={UserPermissionEdit} />
        </Route>
        <Route path="brand" Component={Brand} />
        <Route path="product" Component={Product} />
        <Route path="user-log" Component={UserLog} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
