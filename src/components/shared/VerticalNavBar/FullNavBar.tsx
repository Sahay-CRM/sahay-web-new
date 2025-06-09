import { useState } from "react";
import DrawerAccordion from "../DrawerAccordion";

import logoImg from "@/assets/logo_1.png";
import { useSelector } from "react-redux";
import {
  getUserDetail,
  getUserPermission,
} from "@/features/selectors/auth.selector";
import { Link } from "react-router-dom";
import { ImageBaseURL } from "@/features/utils/urls.utils";

const FullNavBar = ({ data }: FullNavBarProps) => {
  const permissions = useSelector(getUserPermission);

  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const user = useSelector(getUserDetail);
  const companyUrl = `${ImageBaseURL}/share/logo/${user?.companyLogo}`;

  const handleAccordionToggle = (index: number) => {
    setActiveIndex((prevIndex) => (prevIndex === index ? -1 : index));
  };

  const filteredMenuItems = data?.filter((item) => {
    // If item has children, check if any child has permission
    if (item.items) {
      return item.items.some((child) => permissions?.[child.moduleKey]?.View);
    }
    // For items without children, check the item's own permission
    const moduleKeys = Array.isArray(item.moduleKey)
      ? item.moduleKey
      : [item.moduleKey];
    return moduleKeys.some((key) => permissions?.[key]?.View);
  });

  return (
    <div className="flex flex-col w-[260px] h-screen bg-white border-r">
      <Link to="/">
        <div className="flex items-center px-4 py-4 shadow-sm mt-auto cursor-pointer mb-4">
          <div className="flex w-[70px] h-[50px]">
            <img
              src={user?.companyLogo ? companyUrl : logoImg}
              alt="profile"
              className="w-full rounded-full object-contain bg-black"
            />
          </div>
          <span className="ml-2 mr-1">{user?.companyName}</span>
        </div>
      </Link>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto px-2 space-y-1 py-4 scrollbar-none">
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
