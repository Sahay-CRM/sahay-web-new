import { Breadcrumbs } from "@/components/shared/BreadCrumbs/breadcrumbs";
// import { useBreadcrumbs } from "@/components/shared/context/BreadcrumbContext";
import VerticalNavBar from "@/components/shared/VerticalNavBar/VerticalNavBar";
import { useSidebarTheme } from "@/features/auth/useSidebarTheme";
import { logout, setUserPermission } from "@/features/reducers/auth.reducer";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import useGetUserPermission from "./useGetUserPermission";
import { companyNavigationData } from "@/features/utils/navigation.data";
import { getUserDetail } from "@/features/selectors/auth.selector";
import logoImg from "@/assets/logo_1.png";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserIcon } from "@/components/shared/Icons";
import { LogOut } from "lucide-react";
import { baseUrl } from "@/features/utils/urls.utils";

const DashboardLayout = () => {
  const [open, setOpen] = useState(true);
  const dispatch = useDispatch();
  const toggleDrawer = useCallback((e: { preventDefault: () => void }) => {
    e?.preventDefault();
    setOpen((prev) => !prev);
  }, []);
  const { data: permission } = useGetUserPermission();

  const breadcrumbs = [
    { label: "Admin", href: "/" },
    { label: "Countrysss", href: "/" },
  ];
  //  const { breadcrumbs } = useBreadcrumbs();
  const { bgColor } = useSidebarTheme();
  const user = useSelector(getUserDetail);
  const profileImage = `${baseUrl}/share/profilePics/${user?.photo}`;
  console.log(user, "<==");

  useEffect(() => {
    if (permission) {
      dispatch(setUserPermission(permission));
    }
  }, [dispatch, permission]);
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
  };

  <Breadcrumbs items={breadcrumbs} />;
  return (
    <div className="flex h-screen bg-gray-200 gap-x-4">
      <div
        className={`${
          open ? "w-[260px]" : "hidden sm:block sm:w-16"
        } bg-white rounded-tr-2xl transition-all duration-300`}
      >
        <VerticalNavBar isExpanded={open} data={companyNavigationData} />
      </div>
      <div className="flex flex-col flex-1 overflow-hidden gap-y-4">
        <div
          style={{
            backgroundColor: bgColor,
          }}
          className="h-16 flex items-center justify-between px-6 rounded-2xl mt-2 mx-4 sm:ml-0"
        >
          <div className="text-xl font-semibold flex items-center gap-x-2">
            <div
              onClick={toggleDrawer}
              className="w-6 flex items-center justify-center mr-3 cursor-pointer"
            >
              <i className={`bx bx-menu text-2xl`} />
            </div>
            {/* <Breadcrumbs items={breadcrumbs} /> */}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center px-4 py-4-sm mt-auto cursor-pointer mb-1">
                <div className="flex w-[50px] h-[50px]">
                  <img
                    src={logoImg}
                    alt="profile"
                    className="w-full rounded-full object-contain bg-black"
                  />
                </div>
                <span className="ml-2 mr-1">{user?.employeeName}</span>
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg bg-white p-2 border"
              side="bottom"
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={profileImage}
                      alt={user?.employeeName || user?.consultantName}
                    />
                    <AvatarFallback className="rounded-lg">UE</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {user?.adminUserName ||
                        user?.employeeName ||
                        user?.consultantName}
                    </span>
                    <span className="truncate text-xs">{user?.role}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => navigate("/administrator-panel/profile")}
                >
                  <UserIcon />
                  User Profile
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <main className="flex-1 overflow-auto p-6 bg-white mr-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
