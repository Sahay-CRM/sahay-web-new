import { QueryClientProvider } from "@tanstack/react-query";
import AppRoutes from "./routes";
import { queryClient } from "./queryClient";
import AuthProvider from "./features/auth/AuthProvider";
import { SidebarThemeProvider } from "./features/auth/SidebarThemeProvider";
import { BreadcrumbProvider } from "./components/shared/context/BreadcrumbContext";

function App() {
  return (
    <>
      <AuthProvider>
        <SidebarThemeProvider>
          <QueryClientProvider client={queryClient}>
            <BreadcrumbProvider>
              <AppRoutes />
            </BreadcrumbProvider>
          </QueryClientProvider>
        </SidebarThemeProvider>
      </AuthProvider>
    </>
  );
}

export default App;
