import { QueryClientProvider } from "@tanstack/react-query";
import AppRoutes from "./routes";
import { queryClient } from "./queryClient";
import AuthProvider from "./features/auth/AuthProvider";
import { SidebarThemeProvider } from "./features/auth/SidebarThemeProvider";
import { PermissionsProvider } from "./features/auth/permissions/PermissionsProvider";

function App() {
  return (
    <>
      <AuthProvider>
        <SidebarThemeProvider>
          <PermissionsProvider>
            <QueryClientProvider client={queryClient}>
              <AppRoutes />
            </QueryClientProvider>
          </PermissionsProvider>
        </SidebarThemeProvider>
      </AuthProvider>
    </>
  );
}

export default App;
