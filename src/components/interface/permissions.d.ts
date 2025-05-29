interface PermissionItem {
  moduleKey: string;
  permissions: string[];
}

interface RawPermissionData {
  module: {
    moduleKey: string;
  };
  permission: {
    permissionName: string;
  };
}

interface PermissionsContextType {
  permissions: PermissionItem[];
  loading: boolean;
}
