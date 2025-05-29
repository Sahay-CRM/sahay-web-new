import { useCallback, useState } from "react";
/**
 * useCmsLayout is talon for CmsLayout
 * this function checks if user is loggedIn or not
 *
 * Parent
 *    CmsLayout
 */

export default function useDashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  // const { data: permission } = useGetUserPermission();

  // useEffect(() => {
  //   if (permission) {
  //     dispatch(setUserPermission(permission?.data));
  //   }
  // }, [dispatch, permission]);

  return {
    isSidebarOpen,
    toggleSidebar,
  };
}
