// pages/UserPermissionEdit.tsx

import { useLocation } from "react-router-dom";
import PermissionTable from "../../components/shared/PermissionTable";

// Static/mock permission data
const mockPermissionData = [
  {
    adminUserId: "1",
    moduleId: "m1",
    permissionId: "p1",
    module: { moduleName: "Employee", moduleKey: "employee" },
    permission: { permissionId: "p1", permissionName: "View" },
  },
  {
    adminUserId: "1",
    moduleId: "m1",
    permissionId: "p2",
    module: { moduleName: "Employee", moduleKey: "employee" },
    permission: { permissionId: "p2", permissionName: "Add" },
  },
  {
    adminUserId: "1",
    moduleId: "m2",
    permissionId: "p3",
    module: { moduleName: "Project", moduleKey: "project" },
    permission: { permissionId: "p3", permissionName: "View" },
  },
  {
    adminUserId: "1",
    moduleId: "m2",
    permissionId: "p4",
    module: { moduleName: "Project", moduleKey: "project" },
    permission: { permissionId: "p4", permissionName: "Edit" },
  },
];

export default function UserPermissionEdit() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">
        Edit User Permission (Mock Data)
      </h2>
      <div>
        <div>
          <b>Employee ID:</b> {params.get("employeeId") || "1"}
        </div>
        <div>
          <b>Employee Name:</b> {params.get("employeeName") || "John Doe"}
        </div>
        <div>
          <b>Department:</b> {params.get("departmentName") || "Engineering"}
        </div>
        <div>
          <b>Designation:</b> {params.get("designationName") || "Developer"}
        </div>
      </div>

      <div className="mt-8">
        <PermissionTable data={mockPermissionData} />
      </div>
    </div>
  );
}
