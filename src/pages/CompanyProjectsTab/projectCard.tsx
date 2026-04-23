import { Clock, Edit, Eye, Image } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TableTooltip } from "@/components/shared/DataTable/tableTooltip";
import { getInitials } from "@/features/utils/app.utils";
import { useNavigate } from "react-router-dom";
import { isColorDark } from "@/features/utils/color.utils";
import { useZoom } from "@/features/context/ZoomContext";
interface ProjectCardProps {
  projectId: string;
  name: string;
  description: string;
  assignees: string[];
  endDate: string;
  priority: string;
  color: string;
  coreParameterName?: string;
  projectDocuments?: {
    fileId: string;
    fileName: string;
  }[];
  projectDuration: string;
  createdBy?: {
    employeeId: string;
    employeeName: string;
  };
  deadlineRequest?: string;
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
  endDate,
  priority,
  color,
  coreParameterName,
  projectDocuments,
  projectDuration,
  createdBy,
  deadlineRequest,
  onViewDocuments,
}: ProjectCardProps) {
  const { zoom } = useZoom();
  const scale = zoom / 100;
  const navigate = useNavigate();
  const handleEdit = () => {
    navigate(`/dashboard/projects/edit/${projectId}`);
  };

  const handleView = () => {
    navigate(`/dashboard/projects/view/${projectId}`);
  };

  return (
    <div className="bg-white border shadow-md rounded-xl p-4 relative hover:shadow-md transition flex flex-col w-full h-full">
      {deadlineRequest === "PENDING" && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="absolute top-0 left-0 w-4 h-4 overflow-hidden rounded-tl-xl cursor-help z-10">
              <div
                className="absolute top-0 left-0 w-full h-full bg-red-600 animate-pulse"
                style={{ clipPath: "polygon(0% 0%, 100% 0%, 0% 100%)" }}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="top">
            Deadline change request pending
          </TooltipContent>
        </Tooltip>
      )}
      <div>
        <div className="flex items-start justify-between mb-1">
          <div className="flex items-center gap-2 pr-2">
            <h3
              className="text-base font-semibold text-gray-800 flex-1 break-words"
              style={{ fontSize: `${16 * scale}px` }}
            >
              {name}
            </h3>
          </div>

          <div className="flex ">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEdit();
              }}
              className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-primary transition"
            >
              <Edit
                className="h-4 w-4"
                style={{ width: 16 * scale, height: 16 * scale }}
              />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleView();
              }}
              className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-primary transition"
            >
              <Eye
                className="h-4 w-4"
                style={{ width: 16 * scale, height: 16 * scale }}
              />
            </button>
            {projectDocuments && projectDocuments.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDocuments?.(projectDocuments, projectId);
                }}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-primary transition"
              >
                <Image
                  className="h-4 w-4"
                  style={{ width: 16 * scale, height: 16 * scale }}
                />
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
          style={{ fontSize: `${14 * scale}px` }}
        >
          {description}
        </p>
        {/* <p className="text-gray-500 text-sm mb-2">{description}</p> */}

        <div
          className="mb-1.5 text-sm text-gray-600 flex flex-wrap items-center gap-1"
          style={{ fontSize: `${14 * scale}px` }}
        >
          <span className="font-semibold ">Assignees :</span>

          {assignees.slice(0, 7).map((name, idx) => (
            <span key={idx} className="inline-flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <p
                    className="rounded-full bg-gray-100 text-xs flex items-center justify-center font-medium"
                    style={{
                      width: 24 * scale,
                      height: 24 * scale,
                      fontSize: `${12 * scale}px`,
                    }}
                  >
                    {getInitials(name)}
                  </p>
                </TooltipTrigger>
                <TooltipContent>{name}</TooltipContent>
              </Tooltip>
            </span>
          ))}

          {/* Agar extra assignees ho to +X show karo */}
          {assignees.length > 7 && (
            <span
              className="rounded-full bg-gray-200 text-xs flex items-center justify-center font-medium cursor-default"
              style={{
                width: 24 * scale,
                height: 24 * scale,
                fontSize: `${12 * scale}px`,
              }}
            >
              +{assignees.length - 7}
            </span>
          )}
        </div>
        <div
          className="mb-2 text-sm text-gray-600 flex items-center gap-1"
          style={{ fontSize: `${14 * scale}px` }}
        >
          <span className="font-semibold  whitespace-nowrap">
            Business Function :
          </span>
          <span className="truncate max-w-[300px]" title={coreParameterName}>
            {coreParameterName}
          </span>
        </div>
        <div
          className="mb-2 flex items-center gap-2 text-sm text-gray-600"
          style={{ fontSize: `${14 * scale}px` }}
        >
          <span className="font-semibold whitespace-nowrap flex items-center gap-1">
            Project Deadline :
          </span>
          <TableTooltip text={`${endDate || ""}`} />
        </div>
        <div
          className="mb-2 flex items-center gap-2 text-sm text-gray-600"
          style={{ fontSize: `${14 * scale}px` }}
        >
          <span className="font-semibold  whitespace-nowrap">Created By :</span>
          <TableTooltip text={`${createdBy || ""}`} />
        </div>
      </div>

      {/* Bottom section */}
      <div className="flex items-center justify-between right-0 border-t pt-2 mt-auto">
        {/* Date (smaller font) */}
        <div
          className="flex items-center gap-2 text-sm text-gray-600"
          style={{ fontSize: `${14 * scale}px` }}
        >
          <Clock
            className="text-gray-400"
            style={{ width: 16 * scale, height: 16 * scale }}
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <div style={{ fontSize: `${12 * scale}px` }}>
                {projectDuration}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Project Duration : {projectDuration}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Priority pill bottom-right */}
        {priority && (
          <div className="absolute  mt-1 right-0 pt-1">
            <div
              className=" py-1.5 pl-6 pr-3 rounded-l-full font-semibold cursor-pointer"
              style={{
                color: isColorDark(color) ? "#fff" : "#000",
                borderRight: `2px solid ${color}`,
                background: `${color}`,
                fontSize: `${14 * scale}px`,
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
