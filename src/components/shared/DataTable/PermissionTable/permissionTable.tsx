import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import FormCheckbox from "../../Form/FormCheckbox/FormCheckbox";

// Type definitions
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
}

const PERMISSION_TYPES = ["View", "Add", "Edit", "Delete"];

export default function PermissionTable({ data }: PermissionTableProps) {
  const modulePermissionsMap: Record<string, Record<string, boolean>> = {};

  // Group by moduleName => { permissionName: true }
  data?.forEach((entry) => {
    const moduleName = entry.module.moduleName;
    const permissionName = entry.permission.permissionName;

    if (!modulePermissionsMap[moduleName]) {
      modulePermissionsMap[moduleName] = {};
    }
    modulePermissionsMap[moduleName][permissionName] = true;
  });

  const sortedModules = Object.keys(modulePermissionsMap).sort();

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader className="bg-primary">
          <TableRow className="bg-primary">
            <TableHead className="w-[250px] font-bold uppercase">
              Module
            </TableHead>
            {PERMISSION_TYPES.map((perm) => (
              <TableHead key={perm} className="text-center font-bold uppercase">
                {perm}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedModules.map((moduleName) => (
            <TableRow key={moduleName}>
              <TableCell className="font-medium">{moduleName}</TableCell>
              {PERMISSION_TYPES.map((perm) => (
                <TableCell key={perm} className="text-center">
                  <FormCheckbox
                    checked={!!modulePermissionsMap[moduleName][perm]}
                    disabled
                    className={cn(
                      "mx-auto",
                      modulePermissionsMap[moduleName][perm] && "bg-primary",
                    )}
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
