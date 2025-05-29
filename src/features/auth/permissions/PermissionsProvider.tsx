import { useState, useMemo, ReactNode } from "react";
import { PermissionItem } from "./permissions.interface";
import { PermissionsContext } from "./PermissionContext";

interface PermissionsProviderProps {
  children: ReactNode;
}

export const PermissionsProvider = ({ children }: PermissionsProviderProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState<boolean>(true);

  // useEffect(() => {
  //   const fetchPermissions = async () => {
  //     try {
  //       setLoading(true);

  //       const url =
  //         user?.role === "SUPERADMIN"
  //           ? `${baseUrl}/admin/user-permission/get/${user?.adminUserId}`
  //           : `${baseUrl}/admin/user-permission/get/${user?.employeeId}`;

  //       const response = await axios.get<{ data: RawPermissionData[] }>(url, {
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${user?.token}`,
  //         },
  //       });

  //       const permissionData = response.data.data;

  //       const groupedData: Record<string, PermissionItem> =
  //         permissionData.reduce(
  //           (acc, curr) => {
  //             const moduleKey = curr.moduleKey;
  //             const permissionName = curr.permissionName;

  //             if (!acc[moduleKey]) {
  //               acc[moduleKey] = { moduleKey, permissions: [] };
  //             }

  //             if (!acc[moduleKey].permissions.includes(permissionName)) {
  //               acc[moduleKey].permissions.push(permissionName);
  //             }

  //             return acc;
  //           },
  //           {} as Record<string, PermissionItem>,
  //         );

  //       const result = Object.values(groupedData);

  //       if (
  //         JSON.stringify(previousPermissionsRef.current) !==
  //         JSON.stringify(result)
  //       ) {
  //         previousPermissionsRef.current = result;
  //         setPermissions(result);
  //       }
  //     } catch (error) {
  //       toast.error("Error fetching permissions", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   if (user) fetchPermissions();
  // }, [user, user?.token]);

  const value = useMemo(
    () => ({ permissions, loading }),
    [permissions, loading],
  );

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
};
