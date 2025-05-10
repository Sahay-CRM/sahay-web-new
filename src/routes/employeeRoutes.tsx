import { lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

const Dashboard = lazy(() => import("../pages/homePage/HomePage"));

export default function EmployeeRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard" Component={Dashboard}>
          <Route index Component={Dashboard} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
