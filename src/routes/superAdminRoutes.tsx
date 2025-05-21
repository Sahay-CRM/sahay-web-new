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
const AddAdminUser = lazy(
  () => import("../pages/admin/adminUser/addAdminUser/AddAdminUser"),
);

const Calendar = lazy(() => import("../pages/Calendar"));

export default function SuperAdminRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to="/administrator-panel" replace />} />
      <Route path="/administrator-panel" element={<DashboardLayout />}>
        <Route index Component={Dashboard} />
        <Route path="profile" Component={Profile} />
        <Route path="calendar" Component={Calendar} />
        <Route path="settings" Component={Theme} />
        <Route path="location">
          <Route path="countries" Component={CountriesList} />
          <Route path="states" Component={StatesList} />
          <Route path="cities" Component={CitiesList} />
        </Route>
        <Route path="admin">
          <Route path="user" Component={AdminUser} />
          <Route path="user-add" Component={AddAdminUser} />
        </Route>
      </Route>
      <Route
        path="*"
        element={<Navigate to="/administrator-panel" replace />}
      />
    </Routes>
  );
}
