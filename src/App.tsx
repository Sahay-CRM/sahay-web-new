import { QueryClientProvider } from "@tanstack/react-query";
import AppRoutes from "./routes";
import { queryClient } from "./queryClient";
// import AuthProvider from "./features/auth/AuthProvider";
import { SidebarThemeProvider } from "./features/layouts/SidebarThemeProvider";
import { Toaster } from "sonner";
import { BreadcrumbProvider } from "./features/context/BreadcrumbContext";
import { ZoomProvider } from "./features/context/ZoomContext";
import { useEffect } from "react";
import { onFirebaseMessageListener } from "./firebaseConfig";
import { FormProvider, useForm } from "react-hook-form";

function App() {
  useEffect(() => {
    onFirebaseMessageListener();
  }, []);

  const methods = useForm();

  return (
    <>
      {/* <AuthProvider> */}
      <ZoomProvider>
        <SidebarThemeProvider>
          <QueryClientProvider client={queryClient}>
            <BreadcrumbProvider>
              <FormProvider {...methods}>
                <AppRoutes />
                <Toaster richColors position="bottom-right" />
              </FormProvider>
            </BreadcrumbProvider>
          </QueryClientProvider>
        </SidebarThemeProvider>
      </ZoomProvider>
      {/* </AuthProvider> */}
    </>
  );
}

export default App;
