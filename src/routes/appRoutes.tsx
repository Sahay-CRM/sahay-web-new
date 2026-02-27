import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { lazy, Suspense } from "react";
import { useSelector } from "react-redux";
import { getToken } from "@/features/selectors/auth.selector";
import EmployeeRoutes from "./employeeRoutes";

const Login = lazy(() => import("../pages/auth/login"));
const PrivacyPolicy = lazy(
  () => import("../pages/PrivacyPolicy/PrivacyPolicy"),
);
const TermsAndConditions = lazy(
  () => import("../pages/TermsAndConditions/TermsAndConditions"),
);
const ContactUs = lazy(() => import("../pages/ContactUs/ContactUs"));
const FormPreview = lazy(
  () => import("../pages/FormBuilder/preview/FormPreviewPage"),
);
const AppRoutes = () => {
  const token = useSelector(getToken);

  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/form/:id" element={<FormPreview />} />
          {token ? (
            <Route path="/*" element={<EmployeeRoutes />} />
          ) : (
            <>
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          )}
        </Routes>
      </Suspense>
    </Router>
  );
};

export default AppRoutes;
