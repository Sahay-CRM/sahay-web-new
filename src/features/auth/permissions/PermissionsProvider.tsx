import { useState, useEffect, useMemo, useRef } from "react";
import type { ReactNode } from "react";
import axios from "axios";
import { baseUrl } from "@/features/utils/urls.utils";
import { useAuth } from "../useAuth";
import { PermissionsContext } from "./PermissionContext";

interface PermissionsProviderProps {
  children: ReactNode;
}

export const PermissionsProvider = ({ children }: PermissionsProviderProps) => {
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();
  const previousPermissionsRef = useRef<PermissionItem[] | null>(null);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setLoading(true);

        const url =
          user?.role === "SUPERADMIN"
            ? `${baseUrl}/adminUserPermission/0/${user?.adminUserId}`
            : `${baseUrl}/employeePermission/0/${user?.employeeId}`;

        const response = await axios.get<{ data: RawPermissionData[] }>(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: user?.token,
          },
        });

        const permissionData = response.data.data;

        const groupedData: Record<string, PermissionItem> =
          permissionData.reduce(
            (acc, curr) => {
              const moduleKey = curr.module.moduleKey;
              const permissionName = curr.permission.permissionName;

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
      } catch {
        // console.log("Something went wrong");
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
