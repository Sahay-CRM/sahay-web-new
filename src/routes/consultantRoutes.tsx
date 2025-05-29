import { BrowserRouter, Routes } from "react-router-dom";

// const Dashboard = lazy(() => import("../pages/auth/login"));

export default function ConsultantRoutes() {
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
