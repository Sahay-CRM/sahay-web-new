import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth";
import logoImg from "@/assets/S_logo.png";
import dummyProfile from "@/assets/userDummy.jpg";
import { baseUrl } from "@/features/utils/urls.utils";
import { getUserPermission } from "@/features/selectors/auth.selector";
import { useSelector } from "react-redux";

interface ChildItem {
  label: string;
  link: string;
}
interface MenuItemProps {
  icon: string;
  label: string;
  items?: ChildItem[];
  link?: string;
  onToggleFullMenu?: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  label,
  items,
  link,
  onToggleFullMenu,
}) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const iconRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.top,
        left: rect.right + 8,
      });
    }
    setIsHovered(true);
  };

  const handleClick = () => {
    const hasChildren = items && items.length > 0;

    // Always toggle to full menu when clicking any icon
    onToggleFullMenu?.();

    // If no children, also navigate to the page
    if (!hasChildren && link) {
      navigate(link);
    }
  };

  return (
    <div
      className="relative z-[9998]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Icon Menu Item */}
      <div
        ref={iconRef}
        className={`px-4 py-3 cursor-pointer transition-colors duration-200 text-gray-700 hover:text-primary text-center`}
        onClick={handleClick}
      >
        <i className={`bx ${icon} text-2xl`} />
      </div>

      {isHovered && (
        <div
          className="fixed bg-white shadow-lg rounded-md px-3 py-2 z-[99999] whitespace-nowrap border"
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
          }}
        >
          <div className="text-sm font-medium text-primary">{label}</div>
        </div>
      )}
    </div>
  );
};

interface IconHoverVerticalNavProps extends FullNavBarProps {
  onToggleExpanded?: () => void;
}

const IconHoverVerticalNav: React.FC<IconHoverVerticalNavProps> = ({
  data,
  onToggleExpanded,
}) => {
  const permissions = useSelector(getUserPermission);
  const { user } = useAuth();

  const filteredMenuItems = data?.filter((item) => {
    if (item.items) {
      return item.items.some((child) => permissions?.[child.moduleKey]?.View);
    }
    const moduleKeys = Array.isArray(item.moduleKey)
      ? item.moduleKey
      : [item.moduleKey];
    return moduleKeys.some((key) => permissions?.[key]?.View);
  });

  return (
    <div className="h-screen text-primary w-16 z-[9998] flex flex-col relative">
      {/* Top Logo */}
      {user?.role === "SUPERADMIN" ? (
        <div className="flex justify-center items-center p-4 mb-4 bg-white">
          <img src={logoImg} alt="logo" className="w-8" />
        </div>
      ) : (
        <div className="flex justify-center items-center p-4 mb-4">
          <img src={logoImg} alt="logo" className="w-8" />
        </div>
      )}

      {/* Scrollable Icon Menu */}
      <div className="flex-1 overflow-y-auto py-2">
        {filteredMenuItems.map((item, index) => {
          return (
            <MenuItem
              key={index}
              icon={item.icon}
              label={item.label}
              items={item.items}
              link={item.link}
              onToggleFullMenu={onToggleExpanded}
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
              src={dummyProfile}
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
