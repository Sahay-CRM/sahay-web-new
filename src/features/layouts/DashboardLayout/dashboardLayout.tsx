import {
  useCallback,
  useEffect,
  useRef,
  useState,
  Suspense,
  lazy,
  memo,
} from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Bell, Info, LaptopMinimal, LogOut, User2Icon } from "lucide-react";

import { Breadcrumbs } from "@/components/shared/BreadCrumbs/breadcrumbs";
import VerticalNavBar from "@/components/shared/VerticalNavBar/VerticalNavBar";
import { useSidebarTheme } from "../useSidebarTheme";
import {
  logout,
  setAuth,
  setFireBaseToken,
  setUser,
  setUserPermission,
  setValidationKey,
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
import { verifyCompanyOtpMutation } from "@/features/api/login";
import { queryClient } from "@/queryClient";
import useGetEmployeeById from "@/features/api/companyEmployee/useEmployeeById";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { Button } from "@/components/ui/button";
import {
  requestFirebaseNotificationPermission,
  deleteFirebaseToken,
} from "@/firebaseConfig";
import {
  selectNotifications,
  clearNotifications,
  markNotificationRead,
  setNotifications,
} from "@/features/reducers/notification.reducer";
import { setCompaniesList } from "@/features/reducers/company.reducer";
import { fireTokenMutation } from "@/features/api";
import useGetUserNotification from "./useGetUserNotification";
import {
  updateNotiMutation,
  updateReadNotificationMutation,
} from "@/features/api/Notification";
import SidebarControlContext from "./SidebarControlContext";
import ModalData from "@/components/shared/Modal/ModalData";
import { ExclamationRoundIcon } from "@/components/shared/Icons";
import { useGetCompanyList } from "@/features/api/SelectCompany";
import { loginToFirebase } from "@/pages/auth/login/loginToFirebase";
import { useGetCompanyId } from "@/features/api/CompanyProfile";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useZoom } from "@/features/context/ZoomContext";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";

const CompanyModal = lazy(() => import("@/pages/auth/login/CompanyModal"));
const NotificationDropdown = lazy(() => import("./notificationDropdown"));

const MemoSidebar = memo(VerticalNavBar);
const MemoBreadcrumbs = memo(Breadcrumbs);

interface FailureReasonType {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const DashboardLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isMeetingDesc = /\/dashboard\/meeting\/detail\//.test(
    location.pathname,
  );
  const [open, setOpen] = useState(!isMeetingDesc);

  const [isCompanyModalOpen, setCompanyModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const user = useSelector(getUserDetail, shallowEqual);
  const userId = useSelector(getUserId);
  const notifications = useSelector(selectNotifications, shallowEqual);
  const isLoggedIn = useSelector(getIsLoading);

  const { mutate: foreToken } = fireTokenMutation();
  const { mutate: updateNotification } = updateNotiMutation();
  const { mutate: companyVerifyOtp } = verifyCompanyOtpMutation();
  const { mutate: readAllNoti } = updateReadNotificationMutation();

  const { data: permission } = useGetUserPermission();
  const { data: companyData } = useGetCompanyId();
  const { data: userData, failureReason } = useGetEmployeeById({
    filter: {
      employeeId: userId,
    },
    enable: !!userId,
  });

  const { data: notificationData } = useGetUserNotification();

  const { data: companies } = useGetCompanyList();
  const { bgColor } = useSidebarTheme();
  const { zoom, zoomIn, zoomOut, resetZoom, canZoomIn, canZoomOut } = useZoom();

  // useEffect(() => {
  //   if (companies && companies.length > 0) {
  //     const isModalShown = document.cookie
  //       .split("; ")
  //       .find((row) => row.startsWith("switchCompanyModalShown="));

  //     if (!isModalShown) {
  //       setCompanyModalOpen(true);
  //       document.cookie = "switchCompanyModalShown=true; path=/";
  //     }
  //   }
  // }, [companies]);

  useEffect(() => {
    const companiesData: {
      companyId: string;
      name: string;
      isCurrentCompany: boolean;
    }[] = [];

    if (companies && companies.length > 0) {
      companies.forEach((c) => {
        companiesData.push({
          companyId: c.companyId,
          name: c.companyName,
          isCurrentCompany: c.companyId === user?.companyId,
        });
      });
    }

    if (userData?.data?.company) {
      const userCompany = userData.data.company;
      const exists = companiesData.some(
        (c) => c.companyId === userCompany.companyId,
      );
      if (!exists) {
        companiesData.push({
          companyId: userCompany.companyId,
          name: userCompany.companyName,
          isCurrentCompany: true,
        });
      }
    }

    if (companiesData.length > 0) {
      dispatch(setCompaniesList(companiesData));
    }
  }, [companies, userData, dispatch, user?.companyId]);

  useEffect(() => {
    if (permission) {
      dispatch(setUserPermission(permission));
    }
  }, [dispatch, permission]);
  useEffect(() => {
    if (companyData) {
      dispatch(setValidationKey(String(companyData.validationKey)));
    }
  }, [dispatch, companyData]);

  useEffect(() => {
    if (notificationData?.data) {
      const unreadCount = notificationData.data.filter(
        (n) => n.isRead === false,
      ).length;
      dispatch(
        setNotifications({
          data: notificationData.data,
          totalCount: unreadCount,
        }),
      );
    }
  }, [dispatch, notificationData]);

  useEffect(() => {
    if (userData?.data) {
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

  useEffect(() => {
    if (isNotificationOpen) {
      const handleClickOutside = (e: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(e.target as Node)
        ) {
          setIsNotificationOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isNotificationOpen]);

  const toggleDrawer = useCallback(() => setOpen((prev) => !prev), []);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirmLogout = async () => {
    await deleteFirebaseToken();
    dispatch(logout());
    dispatch(clearNotifications());
    // document.cookie =
    //   "switchCompanyModalShown=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  };

  const handleMarkAsRead = (notification: AppNotification) => {
    updateNotification(
      {
        title: notification.title,
        notificationId: notification.notificationId,
        notifiedTime: notification.data?.notifiedTime ?? "",
        employeeId: userId,
      },
      {
        onSuccess: () => {
          const index = notifications.findIndex(
            (n) => n.notificationId === notification.notificationId,
          );
          if (index !== -1) dispatch(markNotificationRead(index));
          handleView(notification.data?.type, notification.data?.typeId);
        },
      },
    );
  };

  const handleLogin = (company: Company) => {
    setIsLoading(true);
    companyVerifyOtp(
      {
        selectedCompanyId: company.companyId,
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

                queryClient.invalidateQueries({
                  queryKey: ["get-company-list"],
                });
                queryClient.invalidateQueries({
                  queryKey: ["userPermission"],
                });
                queryClient.invalidateQueries({
                  queryKey: ["get-employee-by-id", userId],
                });
                setCompanyModalOpen(false);
                navigate("/");
              } else {
                queryClient.invalidateQueries({
                  queryKey: ["get-company-list"],
                });
                queryClient.invalidateQueries({
                  queryKey: ["userPermission"],
                });
                queryClient.invalidateQueries({
                  queryKey: ["get-employee-by-id", userId],
                });
                setCompanyModalOpen(false);
                navigate("/");
                window.location.reload();
              }
            }
          } catch (error) {
            toast(error instanceof Error ? error.message : "An error occurred");
          } finally {
            setIsLoading(false);
          }
        },
        onError: () => {
          setIsLoading(false);
        },
      },
    );
  };

  const handleAllRead = () => readAllNoti();
  const { breadcrumbs } = useBreadcrumbs();

  const dataFetchingErr = (failureReason as FailureReasonType)?.response?.data
    ?.message;

  if (isLoggedIn) return <Navigate to="/login" />;
  if (dataFetchingErr === "Invalid jwt token") {
    dispatch(logout());
    return <Navigate to="/login" />;
  }

  const handleView = (type?: string, typeId?: string) => {
    if (type && typeId) {
      navigate(`/dashboard/${type.toLowerCase()}s/view/${typeId}`);
    }
    setIsNotificationOpen(false);
  };

  // Convert to Date object
  const updateTime = new Date(companyData?.date ?? 0);
  const now = new Date();

  const diffInDays =
    (now.getTime() - updateTime.getTime()) / (1000 * 60 * 60 * 24);

  const showDot = diffInDays < 2;

  // const isCompanyView =
  //   user.employeeType === "CONSULTANT" || user.isSuperAdmin === true;

  // --- UI ---
  return (
    <>
      <SidebarControlContext.Provider value={{ open, setOpen }}>
        <div
          className="flex bg-gray-200 gap-x-4 overflow-hidden"
          style={{
            zoom: zoom / 100,
            height: `${10000 / zoom}vh`,
            width: `${10000 / zoom}vw`,
          }}
        >
          <div
            className={`${open ? "w-[16.25rem]" : "hidden sm:block sm:w-16"} bg-white rounded-tr-2xl transition-all duration-300`}
          >
            <MemoSidebar
              isExpanded={open}
              data={companyNavigationData}
              onToggleDrawer={toggleDrawer}
            />
          </div>

          <div className="flex flex-col flex-1 overflow-hidden gap-y-4">
            <div
              style={{ backgroundColor: bgColor }}
              className="h-16 flex items-center justify-between px-6 rounded-2xl mt-2 mx-4 sm:ml-0"
            >
              <div className="text-xl font-semibold flex items-center gap-x-2">
                <div
                  onClick={toggleDrawer}
                  className="w-6 flex items-center justify-center mr-3 cursor-pointer"
                >
                  <LucideIcon name="Menu" size="1.5rem" />
                </div>
                <MemoBreadcrumbs items={breadcrumbs} />
              </div>

              <div className="flex items-center justify-end gap-x-4 pt-1 relative">
                {/* Updates/Info */}
                <div className="relative">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="relative">
                          <Button
                            variant="ghost"
                            className="p-2 border relative"
                            onClick={() => navigate("/updates")}
                          >
                            <Info />
                          </Button>

                          {showDot && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary border-2 border-white"></span>
                          )}
                        </div>
                      </TooltipTrigger>

                      <TooltipContent side="bottom">
                        {showDot ? "New Updates" : "Updates"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* Notifications */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    className="p-2 border relative"
                    onClick={() => setIsNotificationOpen((prev) => !prev)}
                  >
                    <Bell />
                    {notifications.some((n) => !n.isRead) && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                        {notifications.filter((n) => !n.isRead).length}
                      </span>
                    )}
                  </Button>

                  {isNotificationOpen && (
                    <Suspense>
                      <NotificationDropdown
                        dropdownRef={dropdownRef}
                        notifications={notifications}
                        onMarkAsRead={handleMarkAsRead}
                        onAllRead={handleAllRead}
                        onViewAll={() => {
                          navigate("/dashboard/notifications");
                          setIsNotificationOpen(false);
                        }}
                      />
                    </Suspense>
                  )}
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center gap-x-1 bg-white border border-gray-200 rounded-lg p-1 h-[40px]">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-[32px] w-[32px] border border-gray-200"
                          onClick={zoomOut}
                          disabled={!canZoomOut}
                        >
                          <Minus size={16} className="size-[16px]" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Zoom Out</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-[32px] min-w-[45px] px-1 !text-[12px]"
                          onClick={resetZoom}
                          style={{ fontSize: "12px" }}
                        >
                          <span className="font-bold">{zoom}%</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Reset Zoom</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-[32px] w-[32px] border border-gray-200"
                          onClick={zoomIn}
                          disabled={!canZoomIn}
                        >
                          <Plus size={16} className="size-[16px]" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Zoom In</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {(companies?.length ?? 0) > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setCompanyModalOpen(true)}
                  >
                    Switch Company
                  </Button>
                )}

                {/* Profile dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center px-4 py-4-sm cursor-pointer mb-1">
                      <div className="flex w-[50px] h-[50px] lg:w-[50px] lg:h-[50px] sm:w-[30px] sm:h-[30px] md:w-[30px] md:h-[30px]">
                        <img
                          src={user?.photo || logoImg}
                          alt="profile"
                          className="w-full rounded-full object-contain bg-black"
                        />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="ml-2 mr-1 font-medium">
                          {user?.employeeName}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="min-w-56 rounded-lg bg-white p-2 border"
                    side="bottom"
                    align="end"
                    sideOffset={4}
                  >
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        onClick={() => navigate("/dashboard/profile")}
                      >
                        <User2Icon /> User Profile
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    {/* {isCompanyView && ( */}
                    {permission && permission.COMPANY_PROFILE.View && (
                      <>
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            onClick={() =>
                              navigate("/dashboard/company-profile")
                            }
                          >
                            <LaptopMinimal /> Company Profile
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                      </>
                    )}

                    <DropdownMenuItem onClick={() => setLogoutModalOpen(true)}>
                      <LogOut /> Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {isCompanyModalOpen && (companies?.length ?? 0) > 0 && (
                <Suspense>
                  <CompanyModal
                    companies={companies ?? []}
                    isModalOpen={isCompanyModalOpen}
                    onSelect={handleLogin}
                    modalClose={() => setCompanyModalOpen(false)}
                    isLoading={isLoading}
                  />
                </Suspense>
              )}
            </div>

            <main className="flex-1 overflow-auto bg-white mr-4">
              <Suspense
                fallback={
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700" />
                  </div>
                }
              >
                <Outlet />
              </Suspense>
            </main>
          </div>
        </div>
      </SidebarControlContext.Provider>

      {/* Logout Modal */}
      <ModalData
        isModalOpen={logoutModalOpen}
        modalTitle="Confirm Logout"
        modalClose={() => setLogoutModalOpen(false)}
        buttons={[
          {
            btnText: "Cancel",
            buttonCss: "py-1.5 px-5",
            btnClick: () => setLogoutModalOpen(false),
          },
          {
            btnText: "Confirm",
            buttonCss: "py-1.5 px-5",
            btnClick: handleConfirmLogout,
          },
        ]}
      >
        <div>
          <div className="flex justify-center mb-5 z-50">
            <span className="block text-red-700 w-20">
              <ExclamationRoundIcon />
            </span>
          </div>
          <div className="modal-header mb-5 text-center">
            <p>Are you sure you want to logout?</p>
            {user && (
              <p className="text-sm text-muted-foreground mt-1">
                Logged in as: {user?.employeeName}
              </p>
            )}
          </div>
        </div>
      </ModalData>
    </>
  );
};

export default DashboardLayout;
