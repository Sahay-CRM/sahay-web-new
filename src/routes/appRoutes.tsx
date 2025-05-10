import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom"; // Added Routes import

const Login = lazy(() => import("../pages/auth/login"));
const Dashboard = lazy(() => import("../pages/homePage/HomePage"));

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <Login />
            </Suspense>
          }
        />
        <Route path="/dashboard" Component={Dashboard}>
          <Route index Component={Dashboard} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
