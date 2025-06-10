interface PermissionsResponse {
  [moduleKey: string]: Permission;
}

interface ModuleDetails {
  srNo: number;
  moduleId: string;
  moduleName: string;
  moduleKey: string;
  parentId: string | null;
  parent?: string | null | string[];
}
interface PermissionDetails {
  srNo: number;
  permissionId: string;
  permissionName: string;
  permissionDisplayName: string;
  funtionalityId: string;
  sequence: number;
  createdDatetime: string; // ISO date string
  updatedDatetime: string; // ISO date string
}
