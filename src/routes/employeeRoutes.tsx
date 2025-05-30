import { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "@/features/layouts/DashboardLayout/dashboardLayout";
import AddCompanyEmployee from "@/pages/companyEmployee/AddEmployeeFormModal/addEmployee";
import AddCompanyTaskList from "@/pages/companyTask/CompanyTaskFormModal/AddCompanyTaskList";
import AddCompanyMeeting from "@/pages/Meeting/AddMeetingFormModal/addMeeting";
import AddCompanyProjectList from "@/pages/companyProjects/CompanyProjectFormModal/AddCompanyProjectList";

const Dashboard = lazy(() => import("../pages/homePage/HomePage"));
const Theme = lazy(() => import("../pages/theme/Theme"));
const Calendar = lazy(() => import("../pages/Calendar"));
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
const DatapointList = lazy(
  () => import("../pages/datapointList/DatapointList"),
);
const userpermissionlist = lazy(
  () => import("../pages/Roles/Userpermissionlist"),
);
const UserPermissionEdit = lazy(
  () => import("../pages/Roles/userPermissionTable"),
);
const Healthscore = lazy(
  () => import("../pages/HealthscoreWrapper/DatapointList"),
);

export default function EmployeeRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index Component={Dashboard} />
        <Route path="settings" Component={Theme} />
        <Route path="calendar" Component={Calendar} />
        <Route path="company-designation" Component={companydesignation} />
        <Route path="company-employee" Component={companyemployee} />
        <Route path="employees/add" element={<AddCompanyEmployee />} />
        <Route path="employees/edit/:id" element={<AddCompanyEmployee />} />
        <Route
          path="company-important-dates"
          Component={CompanyImportantDates}
        />
        <Route path="meeting" Component={CompanyMeeting} />
        <Route path="meeting/add" element={<AddCompanyMeeting />} />
        <Route path="meeting/edit/:id" element={<AddCompanyMeeting />} />
        <Route path="tasks" Component={CompanyTask} />
        <Route path="tasks/add" element={<AddCompanyTaskList />} />
        <Route
          path="tasks/edit/:id"
          element={<AddCompanyTaskList isEditMode />}
        />
        <Route path="projects" Component={CompanyProjects} />
        <Route path="projects/add" element={<AddCompanyProjectList />} />
        <Route
          path="projects/edit/:id"
          element={<AddCompanyProjectList isEditMode />}
        />
        <Route path="datapoint" Component={DatapointList} />
        <Route path="healthscore-achieve" Component={Healthscore} />

        <Route path="roles/user-permission">
          <Route index Component={userpermissionlist} />
          <Route path="edit/:id" Component={UserPermissionEdit} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
