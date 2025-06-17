import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { LogOut, User2Icon } from "lucide-react";

import { Breadcrumbs } from "@/components/shared/BreadCrumbs/breadcrumbs";
import VerticalNavBar from "@/components/shared/VerticalNavBar/VerticalNavBar";
import { useSidebarTheme } from "@/features/auth/useSidebarTheme";
import {
  logout,
  setAuth,
  setUser,
  setUserPermission,
} from "@/features/reducers/auth.reducer";
import useGetUserPermission from "./useGetUserPermission";
import { companyNavigationData } from "@/features/utils/navigation.data";
import {
  getIsLoading,
  getUserDetail,
  getUserId,
} from "@/features/selectors/auth.selector";
import logoImg from "@/assets/userDummy.jpg";
import LucideIcon from "@/components/shared/Icons/LucideIcon";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ImageBaseURL } from "@/features/utils/urls.utils";
import CompanyModal from "@/pages/auth/login/CompanyModal";
import { useGetCompanyList } from "@/features/api/SelectCompany";
import { verifyCompanyOtpMutation } from "@/features/api/login";
import { useAuth } from "@/features/auth/useAuth";
import { queryClient } from "@/queryClient";
import useGetEmployeeById from "@/features/api/companyEmployee/useEmployeeById";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";

interface FailureReasonType {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const DashboardLayout = () => {
  const [open, setOpen] = useState(true);
  const dispatch = useDispatch();
  const toggleDrawer = useCallback((e: { preventDefault: () => void }) => {
    e?.preventDefault();
    setOpen((prev) => !prev);
  }, []);

  const handleToggleDrawer = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);
  const [isCompanyModalOpen, setCompanyModalOpen] = useState(false);
  const { setToken } = useAuth();
  const user = useSelector(getUserDetail);
  const userId = useSelector(getUserId);
  const navigate = useNavigate();

  const isLoggedIn = useSelector(getIsLoading);

  const { data: permission } = useGetUserPermission();
  const { mutate: companyVerifyOtp } = verifyCompanyOtpMutation();

  const { data: userData, failureReason } = useGetEmployeeById(userId);

  const dataFetchingErr =
    typeof failureReason === "object" &&
    failureReason !== null &&
    "response" in failureReason &&
    (failureReason as FailureReasonType).response?.data?.message
      ? (failureReason as FailureReasonType).response?.data?.message
      : undefined;
  console.log(dataFetchingErr);

  const { data: companies } = useGetCompanyList();

  //  const { breadcrumbs } = useBreadcrumbs();
  const { bgColor } = useSidebarTheme();

  useEffect(() => {
    if (permission) {
      dispatch(setUserPermission(permission));
    }
  }, [dispatch, permission]);

  useEffect(() => {
    if (userData && userData.data) {
      const empData = userData.data;
      const updatedEmpData = {
        ...empData,
        ...(empData?.companyLogo && {
          companyLogo: `${ImageBaseURL}/share/company/logo/${empData.companyLogo}`,
        }),
        ...(empData?.photo && {
          photo: `${ImageBaseURL}/share/profilePics/${empData.photo}`,
        }),
      };
      dispatch(setUser(updatedEmpData));
    }
  }, [dispatch, userData]);

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleLogin = async (data: Company) => {
    const verifyCompanyData = {
      selectedCompanyId: data.companyId,
      mobile: user?.employeeMobile ?? "",
    };

    companyVerifyOtp(verifyCompanyData, {
      onSuccess: (response) => {
        if (response?.status) {
          setToken(response?.data?.token ?? "", response?.data);
          dispatch(
            setAuth({
              token: response.data.token ?? null,
              isLoading: false,
              isAuthenticated: true,
              userId: response.data.employeeId,
            }),
          );
          queryClient.resetQueries({
            queryKey: ["get-company-list"],
          });
          queryClient.resetQueries({
            queryKey: ["get-employee-by-id", userId],
          });
          navigate("/dashboard");
          window.location.reload();
          setCompanyModalOpen(false);
        }
      },
    });
  };

  const { breadcrumbs } = useBreadcrumbs();
  if (isLoggedIn) return <Navigate to="/login" />;

  if (dataFetchingErr === "Invalid jwt token") {
    dispatch(logout());
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex h-screen bg-gray-200 gap-x-4">
      <div
        className={`${
          open ? "w-[260px]" : "hidden sm:block sm:w-16"
        } bg-white rounded-tr-2xl transition-all duration-300`}
      >
        <VerticalNavBar
          isExpanded={open}
          data={companyNavigationData}
          onToggleDrawer={handleToggleDrawer}
        />
      </div>
      <div className="flex flex-col flex-1 overflow-hidden gap-y-4">
        <div
          style={{
            backgroundColor: bgColor,
          }}
          className="h-16 flex items-center justify-between px-6 rounded-2xl mt-2 mx-4 sm:ml-0"
        >
          <div className="text-xl font-semibold flex items-center gap-x-2">
            {" "}
            <div
              onClick={toggleDrawer}
              className="w-6 flex items-center justify-center mr-3 cursor-pointer"
            >
              <LucideIcon name="Menu" size={24} />
            </div>
            <Breadcrumbs items={breadcrumbs} />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center px-4 py-4-sm mt-auto cursor-pointer mb-1">
                <div className="flex w-[50px] h-[50px]">
                  <img
                    src={user?.photo ? user?.photo : logoImg}
                    alt="profile"
                    className="w-full rounded-full object-contain bg-black"
                  />
                </div>
                <div className="flex flex-col items-start">
                  <span className="ml-2 mr-1 font-medium">
                    {user?.employeeName}
                  </span>
                  {/* <span className="ml-2 mr-1 text-sm">
                    {user?.role ||
                      (user && "employeeType" in user
                        ? (user as { employeeType?: string }).employeeType
                        : undefined)}
                  </span> */}
                </div>
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg bg-white p-2 border"
              side="bottom"
              align="end"
              sideOffset={4}
            >
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => navigate("/dashboard/profile")}
                >
                  <User2Icon />
                  User Profile
                </DropdownMenuItem>
              </DropdownMenuGroup>
              {(companies?.length ?? 0) > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => setCompanyModalOpen(true)}>
                      <User2Icon />
                      Switch Company
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {isCompanyModalOpen && (companies?.length ?? 0) > 0 && (
            <CompanyModal
              companies={companies ?? []}
              isModalOpen={isCompanyModalOpen}
              onSelect={(company) => {
                handleLogin(company);
              }}
              modalClose={() => setCompanyModalOpen(false)}
            />
          )}
        </div>
        <main className="flex-1 overflow-auto p-6 bg-white mr-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
