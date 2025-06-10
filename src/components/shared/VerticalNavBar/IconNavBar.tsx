import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logoImg from "@/assets/S_logo.png";
import mainLogoImg from "@/assets/logo_1.png";
import {
  getUserPermission,
  getUserDetail,
} from "@/features/selectors/auth.selector";
import { useSelector } from "react-redux";
import LucideIcon from "@/components/shared/Icons/LucideIcon";
import { type IconName } from "@/components/shared/Icons/iconMap";

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

    // Always open the full menu for any icon click
    onToggleFullMenu?.();

    // If menu has NO children and has a direct link, navigate to that page
    // If menu HAS children, only open full menu (no navigation)
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
      {/* Icon Menu Item */}{" "}
      <div
        ref={iconRef}
        className={`px-4 py-3 cursor-pointer transition-colors duration-200 text-gray-700 hover:text-primary text-center`}
        onClick={handleClick}
      >
        <LucideIcon name={icon as IconName} size={24} />
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

// Company Logo Component with Tooltip
const CompanyLogo: React.FC = () => {
  const user = useSelector(getUserDetail);
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const logoRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (logoRef.current) {
      const rect = logoRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.top,
        left: rect.right + 8,
      });
    }
    setIsHovered(true);
  };

  return (
    <div
      className="relative z-[9998]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div ref={logoRef} className="flex justify-center items-center p-4 mb-4">
        <div className="w-8 h-8">
          <img
            src={user?.companyLogo ? user?.companyLogo : mainLogoImg}
            alt="company logo"
            className="w-full h-full rounded-full object-contain bg-black"
          />
        </div>
      </div>
      {isHovered && user?.companyName && (
        <div
          className="fixed bg-white shadow-lg rounded-md px-3 py-2 z-[99999] whitespace-nowrap border"
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
          }}
        >
          <div className="text-sm font-medium text-primary">
            {user.companyName}
          </div>
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
      {/* Top Company Logo with Tooltip */}
      <CompanyLogo />

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

      {/* S Logo at Bottom */}
      <div className="flex justify-center items-center p-4 mt-auto">
        <img src={logoImg} alt="logo" className="w-8" />
      </div>
    </div>
  );
};

export default React.memo(IconHoverVerticalNav);
