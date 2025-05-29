import { Breadcrumbs } from "@/components/shared/BreadCrumbs/breadcrumbs";
// import { useBreadcrumbs } from "@/components/shared/context/BreadcrumbContext";
import VerticalNavBar from "@/components/shared/VerticalNavBar/VerticalNavBar";
import { useAuth } from "@/features/auth/useAuth";
import { useSidebarTheme } from "@/features/auth/useSidebarTheme";
import { setUserPermission } from "@/features/reducers/auth.reducer";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Outlet } from "react-router-dom";
import useGetUserPermission from "./useGetUserPermission";
import { companyNavigationData } from "@/features/utils/navigation.data";

const DashboardLayout = () => {
  const [open, setOpen] = useState(true);
  const { user } = useAuth();
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
  useEffect(() => {
    if (permission) {
      dispatch(setUserPermission(permission?.data));
    }
  }, [dispatch, permission]);

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
          <div className="text-primary font-semibold">{user?.companyName}</div>
        </div>
        <main className="flex-1 overflow-auto p-6 bg-white mr-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
