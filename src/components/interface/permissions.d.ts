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

interface Permission {
  Add: boolean;
  Edit: boolean;
  Delete: boolean;
  View: boolean;
}

interface PermissionsResponse {
  [moduleKey: string]: Permission;
}