import { useState } from "react";
import DrawerAccordion from "../DrawerAccordion";
import { UserIcon } from "../Icons";

import { useAuth } from "@/features/auth/useAuth";
import logoImg from "@/assets/logo_1.png";
import { baseUrl } from "@/features/utils/urls.utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { logout } from "@/features/reducers/auth.reducer";
import { useHasPermission } from "@/features/layouts/DashboardLayout/hasPermission";

const FullNavBar = ({ data }: FullNavBarProps) => {
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const { user } = useAuth();
  const profileImage = `${baseUrl}/share/profilePics/${user?.photo}`;

  const handleAccordionToggle = (index: number) => {
    setActiveIndex((prevIndex) => (prevIndex === index ? -1 : index));
  };
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };
  const accessibleItems = data?.filter((item) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useHasPermission(item.moduleKey, item.permission),
  );

  return (
    <div className="flex flex-col w-[260px] h-screen bg-white border-r">
      {/* Logo */}
      <div className="p-4 border-b">
        <img src={logoImg} alt="logo" className="w-[80%] mx-auto" />
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto px-2 space-y-1 py-4 scrollbar-none">
        {accessibleItems?.map((item, index) => {
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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {user?.role === "SUPERADMIN" ? (
            <div className="flex items-center mt-4 px-4 py-4 shadow-sm mt-auto cursor-pointer mb-4">
              <div className="flex w-[50px]">
                <img
                  src={profileImage}
                  alt="profile"
                  className="w-full rounded-full bg-black"
                />
              </div>
              <span className="ml-2 mr-1">
                {user?.adminUserName ||
                  user?.employeeName ||
                  user?.consultantName}
                <span className="flex font-normal text-xs">{user?.role}</span>
              </span>
            </div>
          ) : (
            <div className="flex justify-center mb-4 cursor-pointer">
              <img src={logoImg} alt="logo" className="w-[60%]" />
            </div>
          )}
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg bg-white p-2 border"
          side="right"
          align="end"
          sideOffset={4}
        >
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src={profileImage}
                  alt={
                    user?.adminUserName ||
                    user?.employeeName ||
                    user?.consultantName
                  }
                />
                <AvatarFallback className="rounded-lg">UE</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {user?.adminUserName ||
                    user?.employeeName ||
                    user?.consultantName}
                </span>
                <span className="truncate text-xs">{user?.role}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => navigate("/administrator-panel/profile")}
            >
              <UserIcon />
              User Profile
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default FullNavBar;
