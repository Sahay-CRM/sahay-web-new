import { QueryClientProvider } from "@tanstack/react-query";
import AppRoutes from "./routes";
import { queryClient } from "./queryClient";
import AuthProvider from "./features/auth/AuthProvider";
import { SidebarThemeProvider } from "./features/auth/SidebarThemeProvider";
import { Toaster } from "sonner";
import { BreadcrumbProvider } from "./features/context/BreadcrumbContext";

function App() {
  return (
    <>
      <AuthProvider>
        <SidebarThemeProvider>
          <QueryClientProvider client={queryClient}>
            <BreadcrumbProvider>
              <AppRoutes />
              <Toaster richColors position="bottom-right" />
            </BreadcrumbProvider>
          </QueryClientProvider>
        </SidebarThemeProvider>
      </AuthProvider>
    </>
  );
}

export default App;
