import { useEffect, useState } from "react";
import FormCheckbox from "@/components/shared/Form/FormCheckbox/FormCheckbox";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

interface PermissionData {
  adminUserId: string;
  moduleId: string;
  permissionId: string;
  module: {
    moduleName: string;
    moduleKey: string;
  };
  permission: {
    permissionId: string;
    permissionName: string;
  };
}

interface PermissionTableProps {
  data: PermissionData[];
  onChange?: (updated: Record<string, Record<string, boolean>>) => void;
}

const PERMISSION_TYPES = ["View", "Add", "Edit", "Delete"];

export default function PermissionTable({
  data,
  onChange,
}: PermissionTableProps) {
  const [permissions, setPermissions] = useState<
    Record<string, Record<string, boolean>>
  >({});

  useEffect(() => {
    const map: Record<string, Record<string, boolean>> = {};

    data.forEach((entry) => {
      const moduleName = entry.module.moduleName;
      const permissionName = entry.permission.permissionName;

      if (!map[moduleName]) {
        map[moduleName] = {};
      }

      map[moduleName][permissionName] = true;
    });

    setPermissions(map);
  }, [data]);

  const togglePermission = (moduleName: string, permType: string) => {
    setPermissions((prev) => {
      const updated = {
        ...prev,
        [moduleName]: {
          ...prev[moduleName],
          [permType]: !prev[moduleName]?.[permType],
        },
      };
      onChange?.(updated);
      return updated;
    });
  };

  const toggleColumn = (permType: string) => {
    const allChecked = Object.values(permissions).every(
      (perm) => perm[permType] === true,
    );

    setPermissions((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((moduleName) => {
        updated[moduleName][permType] = !allChecked;
      });
      onChange?.(updated);
      return updated;
    });
  };

  const toggleRow = (moduleName: string) => {
    const allChecked = PERMISSION_TYPES.every(
      (perm) => permissions[moduleName]?.[perm],
    );

    setPermissions((prev) => {
      const updated = {
        ...prev,
        [moduleName]: {
          ...prev[moduleName],
        },
      };

      PERMISSION_TYPES.forEach((perm) => {
        updated[moduleName][perm] = !allChecked;
      });

      onChange?.(updated);
      return updated;
    });
  };

  const isColumnChecked = (permType: string) =>
    Object.values(permissions).every((perm) => perm[permType]);

  const isRowChecked = (moduleName: string) =>
    PERMISSION_TYPES.every((perm) => permissions[moduleName]?.[perm]);

  const sortedModules = Object.keys(permissions).sort();

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead className="w-[250px] font-bold uppercase">
              Module
            </TableHead>
            {PERMISSION_TYPES.map((permType) => (
              <TableHead
                key={permType}
                className="text-center font-bold uppercase"
              >
                <div className="flex items-center justify-center gap-2">
                  <FormCheckbox
                    checked={isColumnChecked(permType)}
                    onChange={() => toggleColumn(permType)}
                  />
                  {permType}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedModules.map((moduleName) => (
            <TableRow key={moduleName}>
              {/* Row-level master checkbox */}
              <TableCell className="text-center">
                <FormCheckbox
                  checked={isRowChecked(moduleName)}
                  onChange={() => toggleRow(moduleName)}
                />
              </TableCell>
              <TableCell className="font-medium">{moduleName}</TableCell>
              {PERMISSION_TYPES.map((permType) => (
                <TableCell key={permType} className="text-center">
                  <FormCheckbox
                    checked={!!permissions[moduleName]?.[permType]}
                    onChange={() => togglePermission(moduleName, permType)}
                    className="mx-auto"
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
