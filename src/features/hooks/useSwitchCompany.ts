import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { toast } from "sonner";
import { queryClient } from "@/queryClient";
import { setAuth, setFireBaseToken } from "@/features/reducers/auth.reducer";
import { verifyCompanyOtpMutation } from "@/features/api/login";
import { fireTokenMutation } from "@/features/api";
import { loginToFirebase } from "@/pages/auth/login/loginToFirebase";
import { requestFirebaseNotificationPermission } from "@/firebaseConfig";
import { getUserDetail } from "@/features/selectors/auth.selector";

export const useSwitchCompany = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUserDetail);
  const [isSwitching, setIsSwitching] = useState(false);

  const { mutate: companyVerifyOtp } = verifyCompanyOtpMutation();
  const { mutate: foreToken } = fireTokenMutation();

  const switchCompany = (companyId: string, companyName?: string) => {
    setIsSwitching(true);
    companyVerifyOtp(
      {
        selectedCompanyId: companyId,
        mobile: user?.employeeMobile ?? "",
      },
      {
        onSuccess: async (response) => {
          try {
            if (response?.status) {
              if (response.data.fbToken) {
                await loginToFirebase(response.data.fbToken);
              }
              dispatch(
                setAuth({
                  userId: response.data.employeeId,
                  token: response.data.token ?? null,
                  isLoading: false,
                  isAuthenticated: true,
                  fbToken: response.data.fbToken,
                }),
              );

              const firebaseToken =
                await requestFirebaseNotificationPermission();

              if (firebaseToken) {
                dispatch(setFireBaseToken(String(firebaseToken)));
                await new Promise((resolve, reject) => {
                  foreToken(
                    {
                      webToken: firebaseToken,
                      employeeId: response.data.employeeId,
                    },
                    {
                      onSuccess: resolve,
                      onError: reject,
                    },
                  );
                });
              }

              await Promise.all([
                queryClient.refetchQueries({ queryKey: ["get-company-list"] }),
                queryClient.refetchQueries({ queryKey: ["userPermission"] }),
                queryClient.refetchQueries({
                  queryKey: ["get-employee-by-id"],
                }),
              ]);

              toast.success(
                `Switched to ${companyName || "company"} successfully`,
              );

              // We reload to ensure all company-specific contexts and states are fully reset
              window.location.reload();
            }
          } catch (error) {
            toast.error(
              error instanceof Error ? error.message : "An error occurred",
            );
          } finally {
            setIsSwitching(false);
          }
        },
        onError: () => {
          setIsSwitching(false);
          toast.error("Failed to switch company");
        },
      },
    );
  };

  return { switchCompany, isSwitching };
};
