import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Bell, LogOut, User2Icon } from "lucide-react";

import { Breadcrumbs } from "@/components/shared/BreadCrumbs/breadcrumbs";
import VerticalNavBar from "@/components/shared/VerticalNavBar/VerticalNavBar";
import { useSidebarTheme } from "@/features/auth/useSidebarTheme";
import {
  logout,
  setAuth,
  setFireBaseToken,
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
  selectNotificationTotalCount,
} from "@/features/reducers/notification.reducer";
import { fireTokenMutation } from "@/features/api";
import useGetUserNotification from "./useGetUserNotification";
import { updateNotiMutation } from "@/features/api/Notification";
import SidebarControlContext from "./SidebarControlContext";
import ModalData from "@/components/shared/Modal/ModalData";
import { ExclamationRoundIcon } from "@/components/shared/Icons";

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

  // Collapse sidebar by default on MeetingDesc page
  const isMeetingDesc = /\/dashboard\/meeting\/detail\//.test(
    location.pathname
  );

  const [open, setOpen] = useState(!isMeetingDesc ? true : false);

  const toggleDrawer = useCallback((e: { preventDefault: () => void }) => {
    e?.preventDefault();
    setOpen((prev) => !prev);
  }, []);

  const [isCompanyModalOpen, setCompanyModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { setToken } = useAuth();

  const user = useSelector(getUserDetail);
  const userId = useSelector(getUserId);
  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectNotificationTotalCount);
  const isLoggedIn = useSelector(getIsLoading);

  const { mutate: foreToken } = fireTokenMutation();
  const { mutate: updateNotification } = updateNotiMutation();
  const { mutate: companyVerifyOtp } = verifyCompanyOtpMutation();

  const { data: permission } = useGetUserPermission();
  const { data: userData, failureReason } = useGetEmployeeById(userId);
  const { data: notificationData } = useGetUserNotification();

  const dataFetchingErr =
    typeof failureReason === "object" &&
    failureReason !== null &&
    "response" in failureReason &&
    (failureReason as FailureReasonType).response?.data?.message
      ? (failureReason as FailureReasonType).response?.data?.message
      : undefined;
  const { data: companies } = useGetCompanyList();

  const handleToggleDrawer = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const { bgColor } = useSidebarTheme();

  useEffect(() => {
    if (permission) {
      dispatch(setUserPermission(permission));
    }
  }, [dispatch, permission]);

  useEffect(() => {
    if (notificationData && Array.isArray(notificationData.data)) {
      dispatch(
        setNotifications({
          data: notificationData.data,
          totalCount: notificationData.totalCount,
        })
      );
    }
  }, [dispatch, notificationData]);

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
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const openLogoutModal = () => setLogoutModalOpen(true);
  const closeLogoutModal = () => setLogoutModalOpen(false);
  const handleConfirmLogout = async () => {
    await deleteFirebaseToken();
    dispatch(logout());
    dispatch(clearNotifications());
  };

  const handleMarkAsRead = (notification: AppNotification) => {
    const updateData = {
      title: notification.title,
      notificationId: notification.notificationId,
      notifiedTime: notification.data?.notifiedTime ?? "",
      employeeId: userId,
    };
    updateNotification(updateData, {
      onSuccess: () => {
        const index = notifications.findIndex(
          (n) => n.notificationId === notification.notificationId
        );

        if (index !== -1) {
          dispatch(markNotificationRead(index));
        }

        handleView(notification.data?.type, notification.data?.typeId);
      },
    });
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
              userId: response.data.employeeId,
              token: response.data.token ?? null,
              isLoading: false,
              isAuthenticated: true,
            })
          );
          requestFirebaseNotificationPermission().then((firebaseToken) => {
            if (firebaseToken && typeof firebaseToken === "string") {
              dispatch(setFireBaseToken(firebaseToken));
            } else if (firebaseToken) {
              dispatch(setFireBaseToken(String(firebaseToken)));
            }
            foreToken(
              {
                webToken: firebaseToken,
                employeeId: response.data.employeeId,
              },
              {
                onSuccess: () => {
                  queryClient.resetQueries({ queryKey: ["get-company-list"] });
                  queryClient.resetQueries({ queryKey: ["userPermission"] });
                  queryClient.resetQueries({
                    queryKey: ["get-employee-by-id", userId],
                  });
                  window.location.reload();
                  setCompanyModalOpen(false);
                },
              }
            );
          });
          return;
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

  const handleView = (type?: string, typeId?: string) => {
    if (type === "TASK" && typeId) {
      navigate(`/dashboard/tasks/view/${typeId}`);
    } else if (type === "PROJECT" && typeId) {
      navigate(`/dashboard/projects/view/${typeId}`);
    } else if (type === "MEETING" && typeId) {
      navigate(`/dashboard/meeting/detail/${typeId}`);
    }
    setIsNotificationOpen(false);
  };

  return (
    <>
      <SidebarControlContext.Provider value={{ open, setOpen }}>
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
              <div className="flex items-center justify-end gap-x-4 pt-1 relative">
                {/* notification */}
                <div className="relative">
                  <div>
                    <Button
                      variant="ghost"
                      className="p-2 border relative"
                      onClick={() => {
                        setIsNotificationOpen((prev) => !prev);
                      }}
                    >
                      <Bell />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                          {unreadCount}
                        </span>
                      )}
                    </Button>
                  </div>
                  {isNotificationOpen && (
                    <div>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsNotificationOpen(false)}
                        style={{ background: "transparent" }}
                      />
                      <div className="absolute right-0 top-12 bg-white shadow-2xl border rounded-lg p-4 w-[400px] z-20">
                        {notifications.length > 0 ? (
                          <>
                            <ul className="h-80 overflow-scroll">
                              {notifications
                                .slice(0, 5)
                                .map((notification: AppNotification, index) => (
                                  <li
                                    key={index}
                                    className={`border py-1 mb-1 last:mb-0 rounded-md px-2 ${
                                      notification?.isRead
                                        ? "bg-gray-200"
                                        : "bg-white"
                                    } cursor-pointer hover:bg-gray-300 transition`}
                                    onClick={() => {
                                      handleMarkAsRead(notification);
                                    }}
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex-grow">
                                        <div>
                                          <span className="font-semibold text-sm">
                                            {notification?.title}
                                          </span>
                                        </div>
                                        <p className="text-[13px] mt-1 text-gray-600">
                                          {(() => {
                                            const words =
                                              notification?.body?.split(" ") ||
                                              [];
                                            if (words.length > 8) {
                                              return (
                                                words.slice(0, 8).join(" ") +
                                                " [...]"
                                              );
                                            }
                                            return notification?.body;
                                          })()}
                                        </p>
                                      </div>
                                    </div>
                                  </li>
                                ))}
                            </ul>
                            <div className="text-center mt-2 border-t">
                              <Button
                                variant="link"
                                onClick={() => {
                                  navigate("/dashboard/notifications");
                                  setIsNotificationOpen(false);
                                }}
                              >
                                View All Notifications
                              </Button>
                            </div>
                          </>
                        ) : (
                          <p className="text-sm text-gray-600">
                            No new notifications
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="w-fit">
                  <Button
                    variant="outline"
                    className=""
                    onClick={() => setCompanyModalOpen(true)}
                  >
                    Switch Company
                  </Button>
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
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={openLogoutModal}>
                      <LogOut />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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
            <main className="flex-1 overflow-auto bg-white mr-4">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarControlContext.Provider>

      <ModalData
        isModalOpen={logoutModalOpen}
        modalTitle="Confirm Logout"
        modalClose={closeLogoutModal}
        buttons={[
          {
            btnText: "Cancel",
            buttonCss: "py-1.5 px-5",
            btnClick: closeLogoutModal,
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
