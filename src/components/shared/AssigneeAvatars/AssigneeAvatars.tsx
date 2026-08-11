import { getInitials } from "@/features/utils/app.utils";
import { ImageBaseURL } from "@/features/utils/urls.utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface AssigneeUser {
  employeeId?: string;
  employeeName?: string;
  name?: string;
  employeeImage?: string;
  avatar?: string;
}

interface AssigneeAvatarsProps {
  users?: (AssigneeUser | string)[];
}

export function AssigneeAvatars({ users }: AssigneeAvatarsProps) {
  if (!users || users.length === 0) {
    return <span className="text-gray-400 text-xs">-</span>;
  }

  const userList: { name: string; image?: string }[] = users
    .map((u) => {
      if (typeof u === "string") {
        return { name: u.trim() };
      }
      return {
        name: u?.employeeName || u?.name || "",
        image: u?.employeeImage || u?.avatar || undefined,
      };
    })
    .filter((u) => u.name.length > 0);

  if (userList.length === 0) {
    return <span className="text-gray-400 text-xs">-</span>;
  }

  return (
    <div className="flex items-center gap-1 flex-wrap">
      <TooltipProvider>
        {userList.map((user, idx) => {
          const initials = getInitials(user.name);
          return (
            <Tooltip key={idx}>
              <TooltipTrigger asChild>
                <div className="w-7 h-7 rounded-full bg-[#2e3195] text-white flex items-center justify-center text-xs font-semibold shrink-0 cursor-pointer shadow-xs border border-white">
                  {user.image ? (
                    <img
                      src={`${ImageBaseURL}/share/profilePics/${user.image}`}
                      alt={user.name}
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">{user.name}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </TooltipProvider>
    </div>
  );
}

export default AssigneeAvatars;
