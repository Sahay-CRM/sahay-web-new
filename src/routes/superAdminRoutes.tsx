
import { Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "@/features/layouts/DashboardLayout/dashboardLayout";
import { lazy } from "react";

const Dashboard = lazy(() => import("../pages/homePage/HomePage"));
const Profile = lazy(() => import("../pages/profile/Profile"));
const Theme = lazy(() => import("../pages/theme/Theme"));
const CountriesList = lazy(
  () => import("../pages/location/country/CountriesList"),
);

export default function SuperAdminRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to="/administrator-panel" replace />} />
      <Route path="/administrator-panel" element={<DashboardLayout />}>
        <Route index Component={Dashboard} />
        <Route path="profile" Component={Profile} />
        <Route path="settings" Component={Theme} />
        <Route path="location">
          <Route path="countries" Component={CountriesList} />
        </Route>
      </Route>
      <Route
        path="*"
        element={<Navigate to="/administrator-panel" replace />}
      />
    </Routes>
import { BrowserRouter, Routes } from "react-router-dom";

// const Dashboard = lazy(() => import("../pages/auth/login"));

export default function SuperAdminRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" Component={CMsLayout}>
          <Route index Component={Dashboard} />
        </Route> */}
      </Routes>
    </BrowserRouter>
  );
}
