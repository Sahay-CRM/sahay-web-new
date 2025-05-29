import { ThemeProvider } from "./context/ThemeContext";
import { ThemeToggle } from "./components/ThemeToggle";
import AuthProvider from "./features/auth/AuthProvider";
import { SidebarThemeProvider } from "./features/auth/SidebarThemeProvider";
import { PermissionsProvider } from "./features/auth/permissions/PermissionsProvider";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./../queryClient";
import AppRoutes from "./routes";

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground transition-colors">
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <AuthProvider>
          <SidebarThemeProvider>
            <PermissionsProvider>
              <QueryClientProvider client={queryClient}>
                {/* <BreadcrumbProvider> */}
                <AppRoutes />
                {/* </BreadcrumbProvider> */}
              </QueryClientProvider>
            </PermissionsProvider>
          </SidebarThemeProvider>
        </AuthProvider>
      </div>
    </ThemeProvider>
  );
}

export default App;
