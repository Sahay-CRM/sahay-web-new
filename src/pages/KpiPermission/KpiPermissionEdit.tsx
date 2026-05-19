import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import FormCheckbox from "@/components/shared/Form/FormCheckbox/FormCheckbox";
import { Button } from "@/components/ui/button";
import useDdAllKpiList from "@/features/api/KpiList/useDdAllKpiList";
import useGetEmployeeById from "@/features/api/companyEmployee/useEmployeeById";
import { SpinnerIcon } from "@/components/shared/Icons";
import useUpdateKpiPermission from "@/features/api/permission/useUpdateKpiPermission";
import useGetKpiPermission from "@/features/api/permission/useGetKpiPermission";
import useGetKpiPermissionMaster from "@/features/api/permission/useGetKpiPermissionMaster";
import { useSelector } from "react-redux";
import { getUserPermission } from "@/features/selectors/auth.selector";
import PageNotAccess from "../PageNoAccess";

interface KpiPermissionState {
  [kpiId: string]: {
    View: boolean;
    Edit: boolean;
    Delete: boolean;
  };
}

export default function KpiPermissionEdit() {
  const { id: employeeId } = useParams();
  const location = useLocation();
  const userName = location.state?.userName;
  const { setBreadcrumbs } = useBreadcrumbs();

  const [permissions, setPermissions] = useState<KpiPermissionState>({});
  const [hasChange, setHasChange] = useState(false);
  const permission = useSelector(getUserPermission).KPI_PERMISSION;
  const updateKpiPermission = useUpdateKpiPermission();
  const { data: userKpiPerms, isLoading: isUserPermLoading } =
    useGetKpiPermission(employeeId || "");
  const { data: permissionMaster, isLoading: isMasterLoading } =
    useGetKpiPermissionMaster();

  const { data: employeeApiData } = useGetEmployeeById({
    filter: {
      employeeId: employeeId,
    },
    enable: !!employeeId,
  });

  const { data: kpiData, isLoading: isKpiLoading } = useDdAllKpiList({
    filter: {
      isPaging: false,
    },
    enable: true,
  });

  useEffect(() => {
    setBreadcrumbs([
      {
        label: "KPI Permissions",
        href: "/dashboard/roles/kpi-permission",
      },
      { label: "Edit Permissions" },
      ...(userName ? [{ label: `${userName}`, isHighlight: true }] : []),
    ]);
  }, [setBreadcrumbs, userName]);

  // Find dynamic permission IDs from the master list
  const viewPermission = permissionMaster?.data?.find(
    (p) => p.title.toLowerCase() === "view",
  );
  const editPermission = permissionMaster?.data?.find(
    (p) => p.title.toLowerCase() === "edit",
  );
  const deletePermission = permissionMaster?.data?.find(
    (p) => p.title.toLowerCase() === "delete",
  );

  const viewPermissionId = viewPermission?.id || "View";
  const editPermissionId = editPermission?.id || "Edit";
  const deletePermissionId = deletePermission?.id || "Delete";

  // Initialize permissions
  useEffect(() => {
    if (kpiData?.data) {
      const initialPermissions: KpiPermissionState = {};
      const userPermissions = userKpiPerms?.data || [];

      const userPermissionMap = new Map(
        userPermissions.map((perm) => [
          `${perm.datapointId}-${perm.permissionId}`,
          true,
        ]),
      );

      kpiData.data.forEach((kpi) => {
        initialPermissions[kpi.kpiId] = {
          View: userPermissionMap.has(`${kpi.kpiId}-${viewPermissionId}`),
          Edit: userPermissionMap.has(`${kpi.kpiId}-${editPermissionId}`),
          Delete: userPermissionMap.has(`${kpi.kpiId}-${deletePermissionId}`),
        };
      });
      setPermissions(initialPermissions);
    }
  }, [
    kpiData,
    userKpiPerms,
    viewPermissionId,
    editPermissionId,
    deletePermissionId,
  ]);

  const togglePermission = (
    kpiId: string,
    type: "View" | "Edit" | "Delete",
  ) => {
    setPermissions((prev) => ({
      ...prev,
      [kpiId]: {
        ...prev[kpiId],
        [type]: !prev[kpiId][type],
      },
    }));
    setHasChange(true);
  };

  const toggleColumn = (type: "View" | "Edit" | "Delete") => {
    const allChecked = Object.values(permissions).every((p) => p[type]);
    const newCheckedState = !allChecked;

    setPermissions((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((kpiId) => {
        updated[kpiId] = {
          ...updated[kpiId],
          [type]: newCheckedState,
        };
      });
      return updated;
    });
    setHasChange(true);
  };

  const toggleRow = (kpiId: string) => {
    const perm = permissions[kpiId];
    const allChecked = perm.View && perm.Edit && perm.Delete;
    const newCheckedState = !allChecked;

    setPermissions((prev) => ({
      ...prev,
      [kpiId]: {
        View: newCheckedState,
        Edit: newCheckedState,
        Delete: newCheckedState,
      },
    }));
    setHasChange(true);
  };

  const isColumnChecked = (type: "View" | "Edit" | "Delete") => {
    const values = Object.values(permissions);
    if (values.length === 0) return false;
    return values.every((p) => p[type]);
  };

  const handleSavePermissions = () => {
    if (!employeeId) return;

    // Construct the payload structure as requested
    const formattedPermissions: {
      datapointId: string;
      permissionId: string;
    }[] = [];

    Object.entries(permissions).forEach(([kpiId, perms]) => {
      if (perms.View) {
        formattedPermissions.push({
          datapointId: kpiId,
          permissionId: viewPermissionId,
        });
      }
      if (perms.Edit) {
        formattedPermissions.push({
          datapointId: kpiId,
          permissionId: editPermissionId,
        });
      }
      if (perms.Delete) {
        formattedPermissions.push({
          datapointId: kpiId,
          permissionId: deletePermissionId,
        });
      }
    });

    updateKpiPermission.mutate(
      {
        employeeId,
        permissions: formattedPermissions,
      },
      {
        onSuccess: () => {
          setHasChange(false);
        },
      },
    );
  };

  if (
    isKpiLoading ||
    !employeeApiData ||
    isUserPermLoading ||
    isMasterLoading
  ) {
    return (
      <div className="flex h-full items-center justify-center">
        <SpinnerIcon />
      </div>
    );
  }

  if (employeeApiData?.data?.isSuperAdmin) {
    return (
      <div className="h-full w-full text-3xl text-primary font-semibold uppercase flex flex-col items-center justify-center">
        Cannot assign permissions to a Super Admin.
      </div>
    );
  }
  if (permission && permission.View === false) {
    return <PageNotAccess />;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl">
            Editing KPI permissions for :{" "}
            {userName ? (
              <span className="font-bold text-[#2e3090]">{userName}</span>
            ) : (
              "User"
            )}
          </h2>
        </div>

        <Button
          onClick={handleSavePermissions}
          disabled={updateKpiPermission.isPending || !hasChange}
        >
          {updateKpiPermission.isPending ? "Saving..." : "Save Permissions"}
        </Button>
      </div>

      <div className="mt-8 rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead className="w-[250px] font-bold uppercase">
                KPI Name
              </TableHead>
              <TableHead className="text-center font-bold uppercase">
                <div className="flex items-center justify-center gap-2">
                  <FormCheckbox
                    checked={isColumnChecked("View")}
                    onChange={() => toggleColumn("View")}
                  />
                  View
                </div>
              </TableHead>
              <TableHead className="text-center font-bold uppercase">
                <div className="flex items-center justify-center gap-2">
                  <FormCheckbox
                    checked={isColumnChecked("Edit")}
                    onChange={() => toggleColumn("Edit")}
                  />
                  Edit
                </div>
              </TableHead>
              <TableHead className="text-center font-bold uppercase">
                <div className="flex items-center justify-center gap-2">
                  <FormCheckbox
                    checked={isColumnChecked("Delete")}
                    onChange={() => toggleColumn("Delete")}
                  />
                  Delete
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {kpiData?.data?.map((kpi) => (
              <TableRow key={kpi.kpiId}>
                <TableCell className="text-center">
                  <FormCheckbox
                    checked={
                      permissions[kpi.kpiId]?.View &&
                      permissions[kpi.kpiId]?.Edit &&
                      permissions[kpi.kpiId]?.Delete
                    }
                    onChange={() => toggleRow(kpi.kpiId)}
                  />
                </TableCell>
                <TableCell className="font-medium">{kpi.KPIName}</TableCell>
                <TableCell className="text-center">
                  <FormCheckbox
                    checked={permissions[kpi.kpiId]?.View || false}
                    onChange={() => togglePermission(kpi.kpiId, "View")}
                    className="mx-auto"
                  />
                </TableCell>
                <TableCell className="text-center">
                  <FormCheckbox
                    checked={permissions[kpi.kpiId]?.Edit || false}
                    onChange={() => togglePermission(kpi.kpiId, "Edit")}
                    className="mx-auto"
                  />
                </TableCell>
                <TableCell className="text-center">
                  <FormCheckbox
                    checked={permissions[kpi.kpiId]?.Delete || false}
                    onChange={() => togglePermission(kpi.kpiId, "Delete")}
                    className="mx-auto"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
