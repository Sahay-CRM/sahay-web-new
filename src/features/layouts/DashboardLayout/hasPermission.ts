// import { useSelector } from "react-redux";
// import { getUserPermission } from "@/features/selectors/auth.selector";

// export const useHasPermission = (
//   moduleKey: string | string[],
//   routePermission: string
// ): boolean => {
//   const permissions = useSelector(getUserPermission);

//   if (!permissions || !Array.isArray(permissions)) return false;

//   const moduleKeysArray = Array.isArray(moduleKey) ? moduleKey : [moduleKey];

//   return moduleKeysArray.some((key) =>
//     permissions.some((item) => {
//       const itemKeys = Array.isArray(item.moduleKey)
//         ? item.moduleKey
//         : [item.moduleKey];
//       return itemKeys.includes(key) && item.permissionName === routePermission;
//     })
//   );
// };

import { useSelector } from "react-redux";
import { getUserPermission } from "@/features/selectors/auth.selector";

export const useHasPermission = (
  moduleKey: string | string[],
  routePermission: string,
): boolean => {
  const permissions = useSelector(getUserPermission);

  if (!permissions || !Array.isArray(permissions)) return false;

  const moduleKeysArray = Array.isArray(moduleKey) ? moduleKey : [moduleKey];

  return moduleKeysArray.some((key) =>
    permissions.some((item) => {
      // Guard against missing moduleKey or permissionName
      if (!item || !item.moduleKey || !item.permissionName) return false;

      const itemKeys = Array.isArray(item.moduleKey)
        ? item.moduleKey
        : [item.moduleKey];

      return itemKeys.includes(key) && item.permissionName === routePermission;
    }),
  );
};
