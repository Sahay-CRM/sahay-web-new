import DashboardLayout from "@/features/layouts/DashboardLayout/dashboardLayout";
import { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

const Dashboard = lazy(() => import("../pages/homePage/HomePage"));
const Theme = lazy(() => import("../pages/theme/Theme"));

export default function EmployeeRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index Component={Dashboard} />
        <Route path="settings" Component={Theme} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
