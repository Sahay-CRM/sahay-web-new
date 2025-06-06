import { useNavigate } from "react-router-dom";
import type { FC } from "react";
import { useSidebarTheme } from "@/features/auth/useSidebarTheme";
import { useSelector } from "react-redux";
import { getUserPermission } from "@/features/selectors/auth.selector";

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

interface DrawerAccordionProps {
  item: NavItem;
  isOpen: boolean;
  changeActiveIndex: () => void;
  postOnClick?: () => void;
  user: unknown;
}

const DrawerAccordion: FC<DrawerAccordionProps> = ({
  item,
  isOpen,
  changeActiveIndex,
  postOnClick = () => {},
}) => {
  const navigate = useNavigate();
  const hasChildren = Array.isArray(item.items) && item.items.length > 0;
  const { bgColor } = useSidebarTheme();
  const permissions = useSelector(getUserPermission);

  const onClick = () => {
    if (hasChildren) return changeActiveIndex();
    if (item?.link) return navigate(item.link);
  };

  // Check if parent item has permission
  const hasParentPermission = item.moduleKey
    ? Array.isArray(item.moduleKey)
      ? item.moduleKey.some((key) => permissions?.[key]?.View)
      : permissions?.[item.moduleKey]?.View
    : true;

  // If parent's View permission is false, don't render
  if (item.moduleKey && !hasParentPermission) {
    return null;
  }

  return (
    <div
      style={{ backgroundColor: bgColor }}
      className="w-full overflow-hidden py-1 px-4 text-gray-700"
    >
      <button
        className="flex items-center justify-between w-full text-left focus:outline-none text-sm hover:text-primary font-medium py-2 rounded-lg"
        onClick={onClick}
      >
        <div className="flex flex-1 items-center">
          <div className="w-6 flex items-center justify-center mr-3">
            <i className={`bx ${item?.icon} text-xl`} />
          </div>
          <span className="whitespace-nowrap overflow-hidden text-ellipsis hover:underline">
            {item?.label}
          </span>
        </div>
        {hasChildren && (
          <svg
            className={`w-5 h-5 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>

      {isOpen && hasChildren && (
        <div className="pr-4 py-2 text-sm ml-12 leading-5">
          <ul>
            {item.items?.map((child, index) => {
              // Only show child items that have permission
              if (!permissions?.[child.moduleKey]?.View) return null;

              return (
                <li
                  key={`${item.label}-${index}`}
                  className="hover:text-primary hover:underline hover:text-[14.5px] transition-colors cursor-pointer rounded-lg px-2 pb-2"
                  onClick={() => {
                    postOnClick();
                    navigate(child.link);
                  }}
                >
                  {child.label}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DrawerAccordion;
