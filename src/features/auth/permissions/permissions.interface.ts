export interface PermissionItem {
  moduleKey: string;
  permissions: string[];
}

export interface RawPermissionData {
  module: {
    moduleKey: string;
  };
  permission: {
    permissionName: string;
  };
}

export interface PermissionsContextType {
  permissions: PermissionItem[];
  loading: boolean;
}
