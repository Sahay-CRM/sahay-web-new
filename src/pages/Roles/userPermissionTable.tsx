import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useGetUserPerById } from "@/features/api/permission";
import { useBreadcrumbs } from "@/components/shared/context/BreadcrumbContext";
import PermissionTable from "@/components/shared/PermissionTable";
import { Button } from "@/components/ui/button";
import useUpdateUserPermission from "@/features/api/permission/useUpdateUserPermission";

interface Permission {
  moduleId: string;
  permissionId: string;
}

interface ModulePermission {
  Add: boolean;
  Edit: boolean;
  Delete: boolean;
  View: boolean;
}

export default function UserPermissionTable() {
  const { id: employeeId } = useParams();

  const [permissions, setPermissions] = useState<Permission[]>([]);
  const updatePermission = useUpdateUserPermission();
  const { data: userPerm } = useGetUserPerById(employeeId || "");
  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([
      { label: "Admin", href: "/" },
      {
        label: "User Permissions",
        href: "/dashboard/role/user-permission",
      },
      { label: "Edit Permissions" },
    ]);
  }, [setBreadcrumbs]);

  useEffect(() => {
    if (userPerm?.data) {
      const initialPermissions: Permission[] = [];
      const modulePermissions = userPerm.data as {
        [moduleKey: string]: ModulePermission;
      };

      Object.entries(modulePermissions).forEach(([moduleKey, perms]) => {
        if (perms.Add) {
          initialPermissions.push({ moduleId: moduleKey, permissionId: "Add" });
        }
        if (perms.Edit) {
          initialPermissions.push({
            moduleId: moduleKey,
            permissionId: "Edit",
          });
        }
        if (perms.Delete) {
          initialPermissions.push({
            moduleId: moduleKey,
            permissionId: "Delete",
          });
        }
        if (perms.View) {
          initialPermissions.push({
            moduleId: moduleKey,
            permissionId: "View",
          });
        }
      });

      setPermissions(initialPermissions);
    }
  }, [userPerm]);

  const handlePermissionChange = (newPermissions: Permission[]) => {
    setPermissions(newPermissions);
  };

  const handleSavePermissions = () => {
    if (!employeeId) {
      return;
    }

    updatePermission.mutate({
      employeeId,
      permissions,
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Edit User Permission</h2>

        <Button
          onClick={handleSavePermissions}
          disabled={updatePermission.isPending}
        >
          {updatePermission.isPending ? "Saving..." : "Save Permissions"}
        </Button>
      </div>

      <div className="mt-8">
        <PermissionTable data={employeeId} onChange={handlePermissionChange} />
      </div>
    </div>
  );
}
