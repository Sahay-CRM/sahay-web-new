import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "@/features/auth/permissions/usePermissions";
import { useAuth } from "@/features/auth/useAuth";
import { hasPermission } from "@/features/utils/app.utils";
import logoImg from "@/assets/logo_mobile.png";
import { baseUrl } from "@/features/utils/urls.utils";
import { useSidebarTheme } from "@/features/auth/useSidebarTheme";

interface ChildItem {
  label: string;
  link: string;
}
interface MenuItemProps {
  icon: string;
  label: string;
  items?: ChildItem[];
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, items }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const hasChildren = items && items.length > 0;
  const { bgColor } = useSidebarTheme();

  return (
    <div
      className="z-35"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Icon Menu Item */}
      <div
        style={{ backgroundColor: bgColor }}
        className={`px-4 py-3 cursor-pointer transition-colors duration-200 text-gray-700 hover:text-primary text-center`}
      >
        <i className={`bx ${icon} text-2xl`} />
      </div>

      {isHovered && hasChildren && (
        <div className="absolute bg-white shadow-lg rounded-r-md w-48 z-40">
          <div className="font-medium py-3 px-4 h-[58px] text-sm text-primary flex items-center">
            {label}
          </div>
          <div className="p-2">
            {items!.map((item, index) => (
              <div
                key={index}
                className="block py-2 px-2 rounded transition-colors duration-200 text-sm font-regular text-gray-600 hover:text-primary cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  navigate(item.link);
                }}
              >
                {item.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const IconHoverVerticalNav: React.FC<FullNavBarProps> = ({ data }) => {
  const { permissions } = usePermissions();
  const { user } = useAuth();
  const { bgColor } = useSidebarTheme();

  return (
    <div
      style={{ backgroundColor: bgColor }}
      className="h-screen text-primary w-16 z-35 flex flex-col"
    >
      {/* Top Logo */}
      {user?.role === "SUPERADMIN" ? (
        <div className="flex justify-center items-center p-4 mb-4 bg-white">
          <img src={logoImg} alt="logo" className="w-8" />
        </div>
      ) : (
        <div className="flex justify-center items-center p-4 mb-4">
          <img
            src={`${baseUrl}/share/profilePics/${user?.photo}`}
            alt="logo"
            className="w-8"
          />
        </div>
      )}

      {/* Scrollable Icon Menu */}
      <div className="flex-1 overflow-y-auto py-2">
        {data.map((item, index) => {
          const hasRoutePermission = hasPermission(
            permissions,
            item.moduleKey,
            item.permission,
          );

          if (!hasRoutePermission) return null;

          return (
            <MenuItem
              key={index}
              icon={item.icon}
              label={item.label}
              items={item.items}
            />
          );
        })}
      </div>

      {/* Profile Avatar at Bottom */}
      <div className="flex justify-center items-center p-4 mt-auto">
        {user?.role === "SUPERADMIN" ? (
          <div className="w-8 h-8">
            <img
              src={`${baseUrl}/share/profilePics/${user?.photo}`}
              alt="profile"
              className="w-full h-full rounded-full object-cover bg-white"
            />
          </div>
        ) : (
          <div className="w-8 h-8">
            <img
              src={logoImg}
              alt="profile"
              className="w-full h-full rounded-full object-cover bg-white"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(IconHoverVerticalNav);
