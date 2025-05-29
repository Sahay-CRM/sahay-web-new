import { useState, useEffect, useMemo, useRef, ReactNode } from "react";
import axios from "axios";
import { PermissionItem, RawPermissionData } from "./permissions.interface";
import { baseUrl } from "@/features/utils/urls.utils";
import { PermissionsContext } from "./PermissionContext";
import { useSelector } from "react-redux";
import { getUserDetail } from "@/features/selectors/auth.selector";
import { toast } from "sonner";

interface PermissionsProviderProps {
  children: ReactNode;
}

export const PermissionsProvider = ({ children }: PermissionsProviderProps) => {
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const user = useSelector(getUserDetail);
  const previousPermissionsRef = useRef<PermissionItem[] | null>(null);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setLoading(true);

        const url =
          user?.role === "SUPERADMIN"
            ? `${baseUrl}/admin/user-permission/get/${user?.adminUserId}`
            : `${baseUrl}/admin/user-permission/get/${user?.employeeId}`;

        const response = await axios.get<{ data: RawPermissionData[] }>(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
        });

        const permissionData = response.data.data;

        const groupedData: Record<string, PermissionItem> =
          permissionData.reduce(
            (acc, curr) => {
              const moduleKey = curr.moduleKey;
              const permissionName = curr.permissionName;

              if (!acc[moduleKey]) {
                acc[moduleKey] = { moduleKey, permissions: [] };
              }

              if (!acc[moduleKey].permissions.includes(permissionName)) {
                acc[moduleKey].permissions.push(permissionName);
              }

              return acc;
            },
            {} as Record<string, PermissionItem>,
          );

        const result = Object.values(groupedData);

        if (
          JSON.stringify(previousPermissionsRef.current) !==
          JSON.stringify(result)
        ) {
          previousPermissionsRef.current = result;
          setPermissions(result);
        }
      } catch (error) {
        toast.error("Error fetching permissions", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchPermissions();
  }, [user, user?.token]);

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
