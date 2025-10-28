import { Calendar, Edit, Eye, Image } from "lucide-react";
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
  coreParameterName?: string;
  projectDocuments?: {
    fileId: string;
    fileName: string;
  }[];
  onViewDocuments?: (
    projectDocuments: { fileId: string; fileName: string }[],
    projectId: string,
  ) => void;
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
  coreParameterName,
  projectDocuments,
  onViewDocuments,
}: ProjectCardProps) {
  const navigate = useNavigate();
  const handleEdit = () => {
    navigate(`/dashboard/projects/edit/${projectId}`);
  };

  const handleView = () => {
    navigate(`/dashboard/projects/view/${projectId}`);
  };

  return (
    <div className="bg-white border shadow-md rounded-xl p-4 relative hover:shadow-md transition flex flex-col w-full h-full">
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
            {projectDocuments && projectDocuments.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDocuments?.(projectDocuments, projectId);
                }}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-primary transition"
              >
                <Image className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* <div className="text-gray-500 text-sm mb-2 line-clamp-2 overflow-hidden">
          <TableTooltip text={description} />
        </div> */}
        <p
          className="text-gray-500 text-sm mb-1.5 line-clamp-2"
          title={description}
        >
          {description}
        </p>
        {/* <p className="text-gray-500 text-sm mb-2">{description}</p> */}

        <div className="mb-1.5 text-sm text-gray-600 flex flex-wrap items-center gap-1">
          <span className="font-semibold ">Assignees :</span>

          {assignees.slice(0, 7).map((name, idx) => (
            <span key={idx} className="inline-flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="rounded-full h-6 w-6 bg-gray-100 text-xs flex items-center justify-center font-medium">
                    {getInitials(name)}
                  </p>
                </TooltipTrigger>
                <TooltipContent>{name}</TooltipContent>
              </Tooltip>
            </span>
          ))}

          {/* Agar extra assignees ho to +X show karo */}
          {assignees.length > 7 && (
            <span className="rounded-full h-6 w-6 bg-gray-200 text-xs flex items-center justify-center font-medium cursor-default">
              +{assignees.length - 7}
            </span>
          )}
        </div>
        <div className="mb-2 text-sm text-gray-600 flex items-center gap-1">
          <span className="font-semibold  whitespace-nowrap">
            Business Function :
          </span>
          <span className="truncate max-w-[300px]" title={coreParameterName}>
            {coreParameterName}
          </span>
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
              className="max-w-[200px] py-1.5 pl-6 pr-3 rounded-l-full text-sm font-semibold cursor-pointer"
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
