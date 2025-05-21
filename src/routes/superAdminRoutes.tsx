import { Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "@/features/layouts/DashboardLayout/dashboardLayout";
import { lazy } from "react";

const Dashboard = lazy(() => import("../pages/homePage/HomePage"));
const Profile = lazy(() => import("../pages/profile/Profile"));
const Theme = lazy(() => import("../pages/theme/Theme"));
const CountriesList = lazy(
  () => import("../pages/location/country/CountriesList"),
);
const StatesList = lazy(() => import("../pages/location/state/StatesList"));
const CitiesList = lazy(() => import("../pages/location/city/CitiesList"));
const AdminUser = lazy(() => import("../pages/admin/adminUser/AdminUser"));
const AdminUserType = lazy(
  () => import("../pages/admin/adminType/AdminTypeLists"),
);
const DepartmentList = lazy(
  () => import("../pages/department/DepartmentLists"),
);
const ConsultantList = lazy(
  () => import("../pages/consultant/ConsultantsLists"),
);
const AddConsultant = lazy(
  () => import("../pages/consultant/addConsultant/AddConsultant"),
);
const AddAdminUser = lazy(
  () => import("../pages/admin/adminUser/addAdminUser/AddAdminUser"),
);
const EngagementTypeList = lazy(
  () => import("../pages/engagementType/EngagementTypeLists"),
);
const IndustryList = lazy(() => import("../pages/industry/IndustryLists"));
const CoreParameterLists = lazy(
  () => import("../pages/parameter/coreParameter/CoreParameterLists"),
);
const SubParameterLists = lazy(
  () => import("../pages/parameter/subParameter/SubParameterLists"),
);

const CompaniesLists = lazy(() => import("../pages/companies/CompaniesLists"));

export default function SuperAdminRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to="/administrator-panel" replace />} />
      <Route path="/administrator-panel" element={<DashboardLayout />}>
        <Route index Component={Dashboard} />
        <Route path="profile" Component={Profile} />
        <Route path="settings" Component={Theme} />
        <Route path="departments" Component={DepartmentList} />
        <Route path="consultants" Component={ConsultantList} />
        <Route path="add-consultants" Component={AddConsultant} />
        <Route path="engagement-type" Component={EngagementTypeList} />
        <Route path="industries" Component={IndustryList} />
        <Route path="companies" Component={CompaniesLists} />
        <Route path="location">
          <Route path="countries" Component={CountriesList} />
          <Route path="states" Component={StatesList} />
          <Route path="cities" Component={CitiesList} />
        </Route>
        <Route path="admin">
          <Route path="user" Component={AdminUser} />
          <Route path="user-add" Component={AddAdminUser} />
          <Route path="user-type" Component={AdminUserType} />
        </Route>
        <Route path="parameter">
          <Route path="sub-parameter" Component={SubParameterLists} />
          <Route path="core-parameter" Component={CoreParameterLists} />
        </Route>
      </Route>
      <Route
        path="*"
        element={<Navigate to="/administrator-panel" replace />}
      />
    </Routes>
  );
}
