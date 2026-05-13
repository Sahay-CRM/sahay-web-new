import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import ProjectCard from "../projectCard";

export default function BoardColumn({
  column,
  projects,
  handleCardClick,
  handleViewDocuments,
}: BoardColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  });

  const projectIds = projects.map((p) => p.projectId);

  return (
    <div className="flex flex-col w-[350px] bg-[#f8f9fa] rounded-xl border border-gray-100 shadow-sm max-h-full">
      <div className="p-2.5 flex items-center justify-between bg-white rounded-t-xl sticky top-0 z-10 border-b">
        <div className="flex px-3 items-center gap-2.5">
          <span className="font-bold text-gray-800 text-sm tracking-tight">
            {column.title}
          </span>
          <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
            {projects.length}
          </span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 p-3 overflow-y-auto min-h-[200px] no-scrollbar flex flex-col gap-4"
      >
        <SortableContext
          items={projectIds}
          strategy={verticalListSortingStrategy}
        >
          {projects.map((project) => (
            <div
              key={project.projectId}
              className="w-full cursor-pointer"
              onClick={() => handleCardClick(project)}
            >
              <ProjectCard
                projectId={project.projectId}
                name={project.projectName}
                description={project.projectDescription}
                assignees={project.employeeIds}
                endDate={project.projectDeadline}
                priority={project.projectStatus}
                color={project.color}
                coreParameterName={project.coreParameterName}
                projectDocuments={project.projectDocuments}
                projectDuration={project.projectDuration || ""}
                createdBy={project.createdBy}
                deadlineRequest={project.deadlineRequest}
                onViewDocuments={handleViewDocuments}
              />
            </div>
          ))}
        </SortableContext>

        {projects.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
            <p className="text-xs font-medium">No projects here</p>
          </div>
        )}
      </div>
    </div>
  );
}
