import { useState } from "react";
import DrawerAccordion from "../DrawerAccordion";

import companyLogo from "@/assets/company-logo.jpeg";
import logoImg from "@/assets/Sahay_Logo_only.png";
import { useSelector } from "react-redux";
import {
  getUserDetail,
  getUserPermission,
} from "@/features/selectors/auth.selector";
import { Link } from "react-router-dom";

const FullNavBar = ({ data }: FullNavBarProps) => {
  const permissions = useSelector(getUserPermission);

  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const user = useSelector(getUserDetail);

  const handleAccordionToggle = (index: number) => {
    setActiveIndex((prevIndex) => (prevIndex === index ? -1 : index));
  };

  // 🔥 Flatten logic added here
  const filteredMenuItems = data
    ?.map((item) => {
      // If item has children
      if (item.items) {
        // Keep only children with permission
        const allowedChildren = item.items.filter(
          (child) => permissions?.[child.moduleKey]?.View,
        );

        if (allowedChildren.length === 0) return null;

        // If only one child, flatten it to behave like a single menu item
        if (allowedChildren.length === 1) {
          return {
            ...allowedChildren[0],
            icon: item.icon, // Inherit parent icon for consistency
          };
        }

        // Otherwise keep the parent with filtered children
        return {
          ...item,
          items: allowedChildren,
        };
      }

      // For items without children, check permission
      const moduleKeys = Array.isArray(item.moduleKey)
        ? item.moduleKey.filter((k): k is string => !!k)
        : item.moduleKey
          ? [item.moduleKey]
          : [];

      if (moduleKeys.some((key) => permissions?.[key]?.View)) {
        return item;
      }

      return null;
    })
    .filter((i): i is NonNullable<typeof i> => i !== null);

  return (
    <div className="flex flex-col w-[260px] h-screen bg-white border-r">
      <Link to="/">
        <div className="flex items-center px-4 py-4 shadow-sm mt-auto cursor-pointer mb-4">
          <div className="flex w-[70px] h-[50px]">
            <img
              src={user?.companyLogo ? user?.companyLogo : companyLogo}
              alt="profile"
              className="w-full rounded-full object-cover"
            />
          </div>
          <span className="ml-2 mr-1">{user?.companyName}</span>
        </div>
      </Link>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto px-2 space-y-1 pb-4 scrollbar-none">
        {filteredMenuItems?.map((item, index) => {
          return (
            <DrawerAccordion
              key={index}
              item={item}
              isOpen={activeIndex === index}
              changeActiveIndex={() => handleAccordionToggle(index)}
              postOnClick={() => {}}
              user={user}
            />
          );
        })}
      </nav>

      <div className="flex justify-center mb-4 cursor-pointer">
        <img src={logoImg} alt="logo" className="w-[60%]" />
      </div>
    </div>
  );
};

export default FullNavBar;
