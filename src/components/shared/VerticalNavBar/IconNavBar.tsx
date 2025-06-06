import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  getUserPermission,
  getUserDetail,
} from "@/features/selectors/auth.selector";
import logoImg from "@/assets/logo_mobile.png";
import { baseUrl } from "@/features/utils/urls.utils";
import { useSidebarTheme } from "@/features/auth/useSidebarTheme";

interface ChildItem {
  label: string;
  link: string;
  moduleKey: string;
  permission: string;
}

interface NavItem {
  icon?: string;
  label?: string;
  link?: string;
  items?: ChildItem[];
  moduleKey?: string | string[];
  permission?: string;
}

interface IconNavBarProps {
  data: NavItem[];
}

const IconNavBar: React.FC<IconNavBarProps> = ({ data }) => {
  const navigate = useNavigate();
  const permissions = useSelector(getUserPermission);
  const user = useSelector(getUserDetail);
  const { bgColor } = useSidebarTheme();

  const filteredMenuItems = data?.filter((item: NavItem) => {
    if (item.items) {
      return item.items.some(
        (child: ChildItem) => permissions?.[child.moduleKey]?.View,
      );
    }
    const moduleKeys = Array.isArray(item.moduleKey)
      ? item.moduleKey
      : [item.moduleKey];
    const filteredModuleKeys = moduleKeys.filter(
      (key): key is string => typeof key === "string" && !!key,
    );
    return filteredModuleKeys.some((key) => permissions?.[key]?.View);
  });

  return (
    <div
      style={{ backgroundColor: bgColor }}
      className="h-screen text-primary w-16 z-35 flex flex-col"
    >
      {/* Top Logo */}
      <div className="flex justify-center items-center p-4 mb-4 bg-white">
        <img
          src={
            user?.companyLogo
              ? `http://13.203.125.10:6050/share/logo/${user.companyLogo}`
              : logoImg
          }
          alt="logo"
          className="w-8 rounded-full object-contain bg-black"
        />
      </div>
      {/* Scrollable Icon Menu */}
      <div className="flex-1 overflow-y-auto py-2 flex flex-col items-center gap-2">
        {filteredMenuItems?.map((item: NavItem, index: number) => {
          // If item has children, show the first permitted child's link
          if (item.items) {
            const permittedChild = item.items.find(
              (child: ChildItem) => permissions?.[child.moduleKey]?.View,
            );
            if (!permittedChild) return null;
            return (
              <button
                key={index}
                className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-200"
                title={item.label}
                onClick={() => navigate(permittedChild.link)}
              >
                <i className={`bx ${item.icon} text-xl`} />
              </button>
            );
          }
          // For items without children
          let moduleKeys = Array.isArray(item.moduleKey)
            ? item.moduleKey
            : [item.moduleKey];
          moduleKeys = moduleKeys.filter(
            (key): key is string => typeof key === "string" && !!key,
          );
          if (
            !moduleKeys.length ||
            !moduleKeys.some((key) => key && permissions?.[key]?.View)
          )
            return null;
          return (
            <button
              key={index}
              className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-200"
              title={item.label}
              onClick={() => item.link && navigate(item.link)}
            >
              <i className={`bx ${item.icon} text-xl`} />
            </button>
          );
        })}
      </div>
      {/* Profile Avatar at Bottom */}
      <div className="flex justify-center items-center p-4 mt-auto">
        <div className="w-8 h-8">
          <img
            src={
              user?.photo
                ? `${baseUrl}/share/profilePics/${user?.photo}`
                : logoImg
            }
            alt="profile"
            className="w-full h-full rounded-full object-cover bg-white"
          />
        </div>
      </div>
    </div>
  );
};

export default React.memo(IconNavBar);
