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

  const maxVisible = 4;
  const visibleUsers = userList.slice(0, maxVisible);
  const remainingUsers = userList.slice(maxVisible);
  const remainingCount = remainingUsers.length;

  return (
    <div className="flex items-center -space-x-2 select-none">
      <TooltipProvider>
        {visibleUsers.map((user, idx) => {
          const initials = getInitials(user.name);
          return (
            <Tooltip key={idx}>
              <TooltipTrigger asChild>
                <div
                  className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-semibold shrink-0 border-2 border-white shadow-xs relative cursor-pointer"
                  style={{ zIndex: 10 - idx }}
                >
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
        {remainingCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0 border-2 border-white shadow-xs relative cursor-pointer"
                style={{ zIndex: 0 }}
              >
                <span>+{remainingCount}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[200px] p-2.5">
              <div className="font-semibold  text-xs mb-1">All Assignees:</div>
              <ul className="list-disc pl-4 text-xs font-medium space-y-0.5">
                {userList.map((u, i) => (
                  <li key={i}>{u.name}</li>
                ))}
              </ul>
            </TooltipContent>
          </Tooltip>
        )}
      </TooltipProvider>
    </div>
  );
}

export default AssigneeAvatars;
