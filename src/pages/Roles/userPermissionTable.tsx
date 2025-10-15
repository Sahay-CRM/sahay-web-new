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
import WarningDialog from "../kpiDashboard/WarningModal";
import PageNotAccess from "../PageNoAccess";
import { useSelector } from "react-redux";
import {
  getUserDetail,
  getUserPermission,
} from "@/features/selectors/auth.selector";
import { getRouteByLabel } from "@/features/utils/navigation.data";
import useGetEmployeeById from "@/features/api/companyEmployee/useEmployeeById";

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
  isReadOnly?: boolean; // New prop to make table read-only
}

interface PermissionState {
  [moduleName: string]: {
    [permissionName: string]: {
      checked: boolean;
      moduleId: string;
      permissionId: string;
      originalChecked: boolean;
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

function PermissionTableInner({
  data,
  onChange,
  isReadOnly = false,
}: PermissionTableProps) {
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

  const userData = useSelector(getUserDetail);

  // Get current user's permissions
  const currentUserPermissions = useSelector(getUserPermission);
  const canAddPermission =
    currentUserPermissions?.ROLES_PERMISSION?.Add || false;
  const canEditPermission =
    currentUserPermissions?.ROLES_PERMISSION?.Edit || false;

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
            originalChecked: isChecked,
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

  const togglePermission = (
    moduleName: string,
    permType: string,
    isDelete: boolean,
  ) => {
    if (isReadOnly && isDelete) return; // Prevent changes in read-only mode

    setPermissions((prev) => {
      const currentPermission = prev[moduleName]?.[permType];
      if (!currentPermission) return prev;

      const isCurrentlyChecked = currentPermission.checked;
      const wasOriginallyChecked = currentPermission.originalChecked;

      // Permission logic based on user's capabilities
      if (canAddPermission && canEditPermission) {
        // User can both add and edit - allow all changes
      } else if (canAddPermission && !canEditPermission) {
        // User can only add permissions, not remove them
        if (wasOriginallyChecked && !isCurrentlyChecked) {
          // Prevent unchecking originally checked permissions
          return prev;
        }
      } else if (canEditPermission && !canAddPermission) {
        // User can only edit (uncheck) permissions, not add new ones
        if (!wasOriginallyChecked && isCurrentlyChecked) {
          // Prevent checking originally unchecked permissions
          return prev;
        }
      } else {
        // User has neither Add nor Edit permission - no changes allowed
        return prev;
      }

      const updated = {
        ...prev,
        [moduleName]: {
          ...prev[moduleName],
          [permType]: {
            ...currentPermission,
            checked: !isCurrentlyChecked,
          },
        },
      };
      updateSelectedPermissions(updated);
      return updated;
    });
  };

  const toggleColumn = (permType: string, isDelete: boolean) => {
    if (isReadOnly && isDelete) return; // Prevent changes in read-only mode

    const allChecked = Object.values(permissions).every(
      (perm) => perm[permType]?.checked === true,
    );

    setPermissions((prev) => {
      const updated = { ...prev };
      let hasValidChange = false;

      Object.keys(updated).forEach((moduleName) => {
        const currentPermission = updated[moduleName][permType];
        const wasOriginallyChecked = currentPermission.originalChecked;
        const newCheckedState = !allChecked;

        // Check if this change is allowed based on permissions
        if (canAddPermission && canEditPermission) {
          // Allow all changes
          hasValidChange = true;
        } else if (canAddPermission && !canEditPermission) {
          // Only allow checking (adding) permissions, not unchecking
          if (wasOriginallyChecked && !newCheckedState) {
            return; // Skip this change
          }
          hasValidChange = true;
        } else if (canEditPermission && !canAddPermission) {
          // Only allow unchecking (removing) permissions, not adding
          if (!wasOriginallyChecked && newCheckedState) {
            return; // Skip this change
          }
          hasValidChange = true;
        } else {
          // No changes allowed
          return;
        }

        updated[moduleName][permType] = {
          ...currentPermission,
          checked: newCheckedState,
        };
      });

      if (hasValidChange) {
        updateSelectedPermissions(updated);
        return updated;
      }
      return prev;
    });
  };

  const toggleRow = (moduleName: string) => {
    if (isReadOnly) return; // Prevent changes in read-only mode

    const allChecked = Object.values(permissions[moduleName] || {}).every(
      (perm) => perm.checked,
    );

    setPermissions((prev) => {
      const updated = {
        ...prev,
        [moduleName]: { ...prev[moduleName] },
      };
      let hasValidChange = false;

      Object.keys(updated[moduleName]).forEach((permType) => {
        const currentPermission = updated[moduleName][permType];
        const wasOriginallyChecked = currentPermission.originalChecked;
        const newCheckedState = !allChecked;

        // Check if this change is allowed based on permissions
        if (canAddPermission && canEditPermission) {
          // Allow all changes
          hasValidChange = true;
        } else if (canAddPermission && !canEditPermission) {
          // Only allow checking (adding) permissions, not unchecking
          if (wasOriginallyChecked && !newCheckedState) {
            return; // Skip this change
          }
          hasValidChange = true;
        } else if (canEditPermission && !canAddPermission) {
          // Only allow unchecking (removing) permissions, not adding
          if (!wasOriginallyChecked && newCheckedState) {
            return; // Skip this change
          }
          hasValidChange = true;
        } else {
          // No changes allowed
          return;
        }

        updated[moduleName][permType] = {
          ...currentPermission,
          checked: newCheckedState,
        };
      });

      if (hasValidChange) {
        updateSelectedPermissions(updated);
        return updated;
      }
      return prev;
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

  // Check if a checkbox should be disabled
  const isCheckboxDisabled = (moduleName: string, permType: string) => {
    if (isReadOnly) return true;

    const currentPermission = permissions[moduleName]?.[permType];
    if (!currentPermission) return true;

    const isCurrentlyChecked = currentPermission.checked;
    const wasOriginallyChecked = currentPermission.originalChecked;

    if (canAddPermission && canEditPermission) {
      return false; // All changes allowed
    } else if (canAddPermission && !canEditPermission) {
      return wasOriginallyChecked && !isCurrentlyChecked;
    } else if (canEditPermission && !canAddPermission) {
      return !wasOriginallyChecked && isCurrentlyChecked;
    } else {
      return true; // No changes allowed
    }
  };

  const renderModuleRow = (
    module: ModuleWithChildren,
    level: number = 0,
  ): React.ReactElement => {
    const isExpanded = expandedModules.has(module.moduleId);
    const hasChildren = module.children && module.children.length > 0;

    const isRowToggleDisabled =
      isReadOnly ||
      Object.keys(permissions[module.moduleName] || {}).some((permType) =>
        isCheckboxDisabled(module.moduleName, permType),
      );

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
                disabled={isRowToggleDisabled}
              />
            </div>
          </TableCell>
          <TableCell
            className="font-medium"
            style={{ paddingLeft: `${level * 20}px` }}
          >
            {module.moduleName}
          </TableCell>
          {permissionData?.data
            // 👇 Only include "Delete" if employeeType is CONSULTANT
            .filter(
              (permission) =>
                userData.employeeType === "CONSULTANT"
                  ? true // show all, including Delete
                  : permission.permissionDisplayName !== "Delete", // hide Delete for others
            )
            .map((permission) => {
              const isDelete = permission.permissionDisplayName === "Delete";

              return (
                <TableCell
                  key={`${module.moduleId}-${permission.permissionId}`}
                  className="text-center"
                >
                  <FormCheckbox
                    checked={
                      permissions[module.moduleName]?.[
                        permission.permissionName
                      ]?.checked ?? false
                    }
                    onChange={() =>
                      togglePermission(
                        module.moduleName,
                        permission.permissionName,
                        isDelete,
                      )
                    }
                    disabled={isCheckboxDisabled(
                      module.moduleName,
                      permission.permissionName,
                    )}
                    className="mx-auto"
                  />
                </TableCell>
              );
            })}
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
            {permissionData?.data
              // 👇 Only show "Delete" if employeeType is CONSULTANT
              .filter(
                (permission) =>
                  userData.employeeType === "CONSULTANT"
                    ? true // show all
                    : permission.permissionDisplayName !== "Delete", // hide Delete for others
              )
              .map((permission) => {
                const isDelete = permission.permissionDisplayName === "Delete";

                return (
                  <TableHead
                    key={permission.permissionId}
                    className="text-center font-bold uppercase"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <FormCheckbox
                        checked={isColumnChecked(permission.permissionName)}
                        onChange={() =>
                          toggleColumn(permission.permissionName, isDelete)
                        }
                        disabled={
                          isReadOnly ||
                          (!canAddPermission && !canEditPermission)
                        }
                      />
                      {permission.permissionDisplayName}
                    </div>
                  </TableHead>
                );
              })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {organizedModules.map((module) => renderModuleRow(module))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function UserPermissionTableMerged() {
  const { id: employeeId } = useParams();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const updatePermission = useUpdateUserPermission();
  const { data: employeeApiData } = useGetEmployeeById({
    filter: {
      employeeId: employeeId,
    },
    enable: !!employeeId,
  });
  const { data: userPerm } = useGetUserPerById(employeeId || "");
  const { setBreadcrumbs } = useBreadcrumbs();
  const location = useLocation();
  const userName = location.state?.userName;
  const [hasChange, setHasChange] = useState(false);

  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null,
  );
  const [showWarning, setShowWarning] = useState(false);

  const permission = useSelector(getUserPermission).ROLES_PERMISSION;

  // Determine if user has only view permission
  const hasOnlyViewPermission =
    permission?.View && !permission?.Add && !permission?.Edit;
  const hasModifyPermission = permission?.Add || permission?.Edit;

  useEffect(() => {
    setBreadcrumbs([
      {
        label: "User Permissions",
        href: "/dashboard/roles/user-permission",
      },
      { label: "Edit Permissions" },
      { label: `${userName || ""}`, isHighlight: true },
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
    if (hasOnlyViewPermission) return; // Prevent changes if view only

    setPermissions(newPermissions);
    setHasChange(true);
  };

  const handleSavePermissions = () => {
    if (hasOnlyViewPermission) return; // Prevent save if view only

    if (employeeId) {
      updatePermission.mutate(
        {
          employeeId,
          permissions,
        },
        {
          onSuccess: () => {
            setHasChange(false);
          },
        },
      );
    }
  };

  const handleWarningSubmit = () => {
    handleSavePermissions();
    setShowWarning(false);
    setPendingNavigation(null);
  };

  const handleWarningDiscard = () => {
    if (pendingNavigation) {
      window.location.href = pendingNavigation;
    }
    setShowWarning(false);
    setPendingNavigation(null);
  };

  const handleWarningClose = () => {
    setShowWarning(false);
    setPendingNavigation(null);
  };

  useEffect(() => {
    if (hasOnlyViewPermission) return; // No need to set up navigation guards for view-only users

    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    const interceptNavigation = (
      originalFn: typeof history.pushState | typeof history.replaceState,
    ) => {
      return function (
        this: History,
        data: unknown,
        title: string,
        url?: string | URL | null,
      ) {
        if (hasChange && url && url !== location.pathname) {
          setPendingNavigation(
            typeof url === "string" ? url : url?.toString() || null,
          );
          setShowWarning(true);
          return;
        }
        return originalFn.call(this, data, title, url);
      };
    };

    history.pushState = interceptNavigation(originalPushState);
    history.replaceState = interceptNavigation(originalReplaceState);

    const handleClick = (event: Event) => {
      if (!hasChange) return;

      const target = event.target as HTMLElement;

      const isDrawerNavigation =
        target.closest("a[href]") ||
        target.closest('li[class*="cursor-pointer"]') ||
        target.closest('button[class*="hover:text-primary"]') ||
        target.closest('li[class*="hover:text-primary"]') ||
        target.closest('div[class*="cursor-pointer"]') ||
        target.closest('[data-sidebar="menu-button"]') ||
        target.closest('[data-slot="sidebar-menu-button"]');

      if (isDrawerNavigation) {
        const textContent = target.textContent?.toLowerCase().trim();
        const matchedRoute = textContent ? getRouteByLabel(textContent) : null;
        if (matchedRoute === null) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        if (matchedRoute && matchedRoute !== location.pathname) {
          setPendingNavigation(matchedRoute);
          setShowWarning(true);
        }
      }
    };

    document.addEventListener("click", handleClick, true);

    return () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      document.removeEventListener("click", handleClick, true);
    };
  }, [hasChange, location.pathname, hasOnlyViewPermission]);

  // Check if user has at least View permission
  if (permission && !permission.View) {
    return <PageNotAccess />;
  }

  if (employeeApiData?.data.isSuperAdmin) {
    return (
      <div className="h-full w-full text-3xl text-primary font-semibold uppercase flex flex-col items-center justify-center">
        Cannot assign permissions to a Super Admin.
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl">
            {hasOnlyViewPermission ? "Viewing" : "Editing"} permissions for :{" "}
            {userName ? (
              <span className="font-bold text-[#2e3090]">{userName}</span>
            ) : (
              "User"
            )}
          </h2>
          <div className="text-sm text-gray-600 mt-1">
            {hasOnlyViewPermission &&
              "You have view-only access. You cannot modify any permissions."}
            {hasModifyPermission &&
              permission.Add &&
              !permission.Edit &&
              "You can only add new permissions (cannot remove existing ones)"}
            {hasModifyPermission &&
              permission.Edit &&
              !permission.Add &&
              "You can only remove existing permissions (cannot add new ones)"}
            {hasModifyPermission &&
              permission.Add &&
              permission.Edit &&
              "You can add and remove permissions"}
          </div>
        </div>

        {/* Only show Save button if user has modify permissions */}
        {hasModifyPermission && (
          <Button
            onClick={handleSavePermissions}
            disabled={
              updatePermission.isPending || !hasChange || hasOnlyViewPermission
            }
          >
            {updatePermission.isPending ? "Saving..." : "Save Permissions"}
          </Button>
        )}
      </div>

      <div className="mt-8">
        <PermissionTableInner
          data={employeeId}
          onChange={handlePermissionChange}
          isReadOnly={hasOnlyViewPermission}
        />
      </div>

      {hasModifyPermission && (
        <WarningDialog
          open={showWarning}
          onSubmit={handleWarningSubmit}
          onDiscard={handleWarningDiscard}
          onClose={handleWarningClose}
        />
      )}
    </div>
  );
}
