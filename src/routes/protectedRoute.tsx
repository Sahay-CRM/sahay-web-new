import { usePermissions } from "@/features/auth/permissions/usePermissions";
import { hasPermission } from "@/features/utils/app.utils";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  moduleKey: string;
  permission: string;
}

const ProtectedRoute = ({
  children,
  moduleKey,
  permission,
}: ProtectedRouteProps) => {
  const { permissions } = usePermissions();

  const hasRoutePermission = hasPermission(permissions, moduleKey, permission);

  if (!hasRoutePermission) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
