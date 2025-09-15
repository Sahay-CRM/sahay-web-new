import { Calendar, Edit, Eye } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TableTooltip } from "@/components/shared/DataTable/tableTooltip";
import { getInitials } from "@/features/utils/app.utils";
import { useNavigate } from "react-router-dom";
interface ProjectCardProps {
  projectId: string;
  name: string;
  description: string;
  assignees: string[];
  startDate?: string;
  endDate: string;
  priority: string;
  color: string;
}

export default function ProjectCard({
  projectId,
  name,
  description,
  assignees,
  startDate,
  endDate,
  priority,
  color,
}: ProjectCardProps) {
  const navigate = useNavigate();
  const handleEdit = () => {
    navigate(`/dashboard/projects/edit/${projectId}`);
  };

  const handleView = () => {
    navigate(`/dashboard/projects/view/${projectId}`);
  };

  return (
    <div className="bg-white border shadow-lg rounded-xl p-5 relative hover:shadow-md transition flex flex-col w-full h-full">
      <div>
        <div className="flex items-start justify-between mb-1">
          <h3 className="text-md font-semibold text-gray-800 flex-1 pr-2 break-words">
            {name}
          </h3>

          <div className="flex ">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEdit();
              }}
              className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-primary transition"
            >
              <Edit className="h-4 w-4" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleView();
              }}
              className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-primary transition"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* <div className="text-gray-500 text-sm mb-2 line-clamp-2 overflow-hidden">
          <TableTooltip text={description} />
        </div> */}
        {/* <p className="text-gray-500 text-sm mb-2 line-clamp-2" title={description}>{description}</p> */}
        <p className="text-gray-500 text-sm mb-2">{description}</p>

        <div className="mb-3 text-sm text-gray-600  flex flex-wrap items-center gap-1">
          <span className="font-semibold mr-2">Assignees:</span>

          {assignees.map((name, idx) => (
            <span key={idx} className="inline-flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className=" rounded-full h-6 w-6  bg-gray-100 text-xs  flex items-center justify-center font-medium">
                    {getInitials(name)}
                  </p>
                </TooltipTrigger>
                <TooltipContent>{name}</TooltipContent>
              </Tooltip>
              {idx < assignees.length - 1 && <span>,</span>}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom section */}
      <div className="flex items-center justify-between right-0 border-t pt-2 mt-auto">
        {/* Date (smaller font) */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <div className="max-w-[150px]">
            <TableTooltip
              text={`${startDate ? `${startDate} - ` : ""}${endDate || ""}`}
            />
          </div>
        </div>

        {/* Priority pill bottom-right */}
        {priority && (
          <div className="absolute  mt-1 right-0 pt-1">
            <div
              className="max-w-[200px] py-2 pl-6 pr-3 rounded-l-full text-sm font-semibold cursor-pointer"
              style={{
                color: color,
                borderRight: `2px solid ${color}`,
                background: `${color}20`,
              }}
            >
              <TableTooltip text={priority} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
