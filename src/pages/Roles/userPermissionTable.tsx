import { useLocation, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  useGetUserPerById,
  useGetAllModule,
  useGetAllPermission,
} from "@/features/api/permission";

import { Button } from "@/components/ui/button";
import useUpdateUserPermission from "@/features/api/permission/useUpdateUserPermission";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import FormCheckbox from "@/components/shared/Form/FormCheckbox/FormCheckbox";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { ChevronDown, ChevronRight } from "lucide-react";
import React from "react";
import { SpinnerIcon } from "@/components/shared/Icons";

// Interfaces
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

interface PermissionTableProps {
  data?: string;
  onChange?: (
    permissions: Array<{ moduleId: string; permissionId: string }>,
  ) => void;
}

interface PermissionState {
  [moduleName: string]: {
    [permissionName: string]: {
      checked: boolean;
      moduleId: string;
      permissionId: string;
    };
  };
}

interface UserPermission {
  srNo: number;
  adminUserId: string;
  moduleId: string;
  permissionId: string;
  moduleName: string;
  moduleKey: string;
  permissionName: string;
}

interface ModuleWithChildren extends ModuleDetails {
  children?: ModuleWithChildren[];
}

// PermissionTable component (inner)
function PermissionTableInner({ data, onChange }: PermissionTableProps) {
  const { data: moduleData, isLoading: moduleLoading } = useGetAllModule();
  const { data: permissionData, isLoading: permissionLoading } =
    useGetAllPermission();
  const { data: userPerm, isLoading: userDataLoading } = useGetUserPerById(
    data || "",
  );
  const isLoading = moduleLoading || userDataLoading || permissionLoading;
  const [permissions, setPermissions] = useState<PermissionState>({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(),
  );

  // Organize modules into a tree structure
  const organizeModules = (modules: ModuleDetails[]): ModuleWithChildren[] => {
    const moduleMap = new Map<string, ModuleWithChildren>();
    const rootModules: ModuleWithChildren[] = [];
    modules.forEach((module) => {
      moduleMap.set(module.moduleId, { ...module, children: [] });
    });
    modules.forEach((module) => {
      const moduleWithChildren = moduleMap.get(module.moduleId)!;
      if (module.parentId) {
        const parent = moduleMap.get(module.parentId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(moduleWithChildren);
        }
      } else {
        rootModules.push(moduleWithChildren);
      }
    });
    return rootModules;
  };

  useEffect(() => {
    if (moduleData?.data && permissionData?.data) {
      const initialPermissions: PermissionState = {};
      const userPermissions = (userPerm?.data || []) as UserPermission[];
      const userPermissionMap = new Map(
        userPermissions.map((perm) => [
          `${perm.moduleId}-${perm.permissionId}`,
          true,
        ]),
      );
      moduleData.data.forEach((module: ModuleDetails) => {
        initialPermissions[module.moduleName] = {};
        permissionData.data.forEach((permission: PermissionDetails) => {
          const isChecked = userPermissionMap.has(
            `${module.moduleId}-${permission.permissionId}`,
          );
          initialPermissions[module.moduleName][permission.permissionName] = {
            checked: isChecked,
            moduleId: module.moduleId,
            permissionId: permission.permissionId,
          };
        });
      });
      setPermissions(initialPermissions);
      setIsInitialized(true);
    }
  }, [moduleData, permissionData, userPerm]);

  const updateSelectedPermissions = (newPermissions: PermissionState) => {
    const selected: Array<{ moduleId: string; permissionId: string }> = [];
    Object.values(newPermissions).forEach((modulePermissions) => {
      Object.values(modulePermissions).forEach((permission) => {
        if (permission.checked) {
          selected.push({
            moduleId: permission.moduleId,
            permissionId: permission.permissionId,
          });
        }
      });
    });
    onChange?.(selected);
  };

  const togglePermission = (moduleName: string, permType: string) => {
    setPermissions((prev) => {
      const updated = {
        ...prev,
        [moduleName]: {
          ...prev[moduleName],
          [permType]: {
            ...prev[moduleName][permType],
            checked: !prev[moduleName]?.[permType].checked,
          },
        },
      };
      updateSelectedPermissions(updated);
      return updated;
    });
  };

  const toggleColumn = (permType: string) => {
    const allChecked = Object.values(permissions).every(
      (perm) => perm[permType]?.checked === true,
    );
    setPermissions((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((moduleName) => {
        updated[moduleName][permType] = {
          ...updated[moduleName][permType],
          checked: !allChecked,
        };
      });
      updateSelectedPermissions(updated);
      return updated;
    });
  };

  const toggleRow = (moduleName: string) => {
    const allChecked = Object.values(permissions[moduleName] || {}).every(
      (perm) => perm.checked,
    );
    setPermissions((prev) => {
      const updated = {
        ...prev,
        [moduleName]: { ...prev[moduleName] },
      };
      Object.keys(updated[moduleName]).forEach((perm) => {
        updated[moduleName][perm] = {
          ...updated[moduleName][perm],
          checked: !allChecked,
        };
      });
      updateSelectedPermissions(updated);
      return updated;
    });
  };

  const toggleModuleExpansion = (moduleId: string) => {
    setExpandedModules((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  const isColumnChecked = (permType: string) =>
    Object.values(permissions).every((perm) => perm[permType]?.checked);

  const isRowChecked = (moduleName: string) =>
    Object.values(permissions[moduleName] || {}).every((perm) => perm.checked);

  const renderModuleRow = (
    module: ModuleWithChildren,
    level: number = 0,
  ): React.ReactElement => {
    const isExpanded = expandedModules.has(module.moduleId);
    const hasChildren = module.children && module.children.length > 0;
    return (
      <React.Fragment key={module.moduleId}>
        <TableRow>
          <TableCell className="text-center">
            <div className="flex items-center gap-2">
              {hasChildren && (
                <button
                  onClick={() => toggleModuleExpansion(module.moduleId)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              )}
              <FormCheckbox
                checked={isRowChecked(module.moduleName)}
                onChange={() => toggleRow(module.moduleName)}
              />
            </div>
          </TableCell>
          <TableCell
            className="font-medium"
            style={{ paddingLeft: `${level * 20}px` }}
          >
            {module.moduleName}
          </TableCell>
          {permissionData?.data.map((permission) => (
            <TableCell
              key={`${module.moduleId}-${permission.permissionId}`}
              className="text-center"
            >
              <FormCheckbox
                checked={
                  permissions[module.moduleName]?.[permission.permissionName]
                    ?.checked ?? false
                }
                onChange={() =>
                  togglePermission(module.moduleName, permission.permissionName)
                }
                className="mx-auto"
              />
            </TableCell>
          ))}
        </TableRow>
        {isExpanded &&
          hasChildren &&
          module.children?.map((child) => renderModuleRow(child, level + 1))}
      </React.Fragment>
    );
  };

  if (
    (isLoading && !moduleData?.data) ||
    !permissionData?.data ||
    !isInitialized
  ) {
    return (
      <div>
        <SpinnerIcon />
      </div>
    );
  }

  const organizedModules = organizeModules(moduleData?.data ?? []);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead className="w-[250px] font-bold uppercase">
              Module
            </TableHead>
            {permissionData.data.map((permission) => (
              <TableHead
                key={permission.permissionId}
                className="text-center font-bold uppercase"
              >
                <div className="flex items-center justify-center gap-2">
                  <FormCheckbox
                    checked={isColumnChecked(permission.permissionName)}
                    onChange={() => toggleColumn(permission.permissionName)}
                  />
                  {permission.permissionDisplayName}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {organizedModules.map((module) => renderModuleRow(module))}
        </TableBody>
      </Table>
    </div>
  );
}

// Main merged component
export default function UserPermissionTableMerged() {
  const { id: employeeId } = useParams();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const updatePermission = useUpdateUserPermission();
  const { data: userPerm } = useGetUserPerById(employeeId || "");
  const { setBreadcrumbs } = useBreadcrumbs();
  const location = useLocation();
  const userName = location.state?.userName;

  useEffect(() => {
    setBreadcrumbs([
      {
        label: "User Permissions",
        href: "/dashboard/roles/user-permission",
      },
      { label: "Edit Permissions" },
      { label: `${userName || ""}` },
    ]);
  }, [setBreadcrumbs, userName]);

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
        <div>
          <h2 className="text-xl">
            Editing permissions for:{" "}
            {userName ? <span className="font-bold">{userName}</span> : "User"}
          </h2>
        </div>
        <Button
          onClick={handleSavePermissions}
          disabled={updatePermission.isPending}
        >
          {updatePermission.isPending ? "Saving..." : "Save Permissions"}
        </Button>
      </div>
      <div className="mt-8">
        <PermissionTableInner
          data={employeeId}
          onChange={handlePermissionChange}
        />
      </div>
    </div>
  );
}
