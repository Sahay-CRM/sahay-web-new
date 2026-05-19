import { useEffect, useState, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { toast } from "sonner";
import {
  useAddUpdateCompanyProject,
  useGetAllProjectStatus,
} from "@/features/api/companyProject";
import BoardColumn from "./BoardColumn";
import ProjectCard from "../projectCard";

export default function ProjectBoard({
  projects: initialProjects,
  handleCardClick,
  handleViewDocuments,
  refetch,
}: ProjectBoardProps) {
  const { mutate: updateProject } = useAddUpdateCompanyProject();
  const { data: statusData, isLoading: isStatusLoading } =
    useGetAllProjectStatus({
      filter: {},
      enable: true,
    });

  const [projects, setProjects] = useState<BoardProject[]>([]);
  const [activeProject, setActiveProject] = useState<BoardProject | null>(null);
  const [initialStatusId, setInitialStatusId] = useState<string | null>(null);

  useEffect(() => {
    if (initialProjects) {
      setProjects([...initialProjects]);
    }
  }, [initialProjects]);

  const columns = useMemo(() => {
    return (statusData?.data ?? []).map((status) => ({
      id: status.projectStatusId,
      title: status.projectStatus,
      color: status.color || "#2e3195",
    }));
  }, [statusData]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const onDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const project = projects.find((p) => p.projectId === active.id);
    setActiveProject(project || null);
    setInitialStatusId(project?.projectStatusId || null);
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveAProject = active.data.current?.type !== "Column";
    const isOverAProject = over.data.current?.type !== "Column";

    if (!isActiveAProject) return;

    if (isActiveAProject && isOverAProject) {
      setProjects((projects) => {
        const activeIndex = projects.findIndex((p) => p.projectId === activeId);
        const overIndex = projects.findIndex((p) => p.projectId === overId);

        if (
          projects[activeIndex].projectStatusId !==
          projects[overIndex].projectStatusId
        ) {
          const updatedProjects = [...projects];
          updatedProjects[activeIndex] = {
            ...updatedProjects[activeIndex],
            projectStatusId: projects[overIndex].projectStatusId,
          };
          return arrayMove(updatedProjects, activeIndex, overIndex);
        }

        return arrayMove(projects, activeIndex, overIndex);
      });
    }

    const isOverAColumn = over.data.current?.type === "Column";

    if (isActiveAProject && isOverAColumn) {
      setProjects((projects) => {
        const activeIndex = projects.findIndex((p) => p.projectId === activeId);
        const updatedProjects = [...projects];
        updatedProjects[activeIndex] = {
          ...updatedProjects[activeIndex],
          projectStatusId: overId as string,
        };
        return arrayMove(updatedProjects, activeIndex, activeIndex);
      });
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      setActiveProject(null);
      return;
    }

    const projectId = active.id as string;
    const overId = over.id as string;

    const project = projects.find((p) => p.projectId === projectId);
    if (!project) return;

    let newStatusId = project.projectStatusId;

    if (over.data.current?.type === "Column") {
      newStatusId = overId;
    } else {
      const overProject = projects.find((p) => p.projectId === overId);
      if (overProject) {
        newStatusId = overProject.projectStatusId;
      }
    }

    if (newStatusId !== initialStatusId) {
      updateProject(
        { projectId, projectStatusId: newStatusId },
        {
          onSuccess: () => {
            toast.success("Project status updated");
            refetch();
          },
          onError: () => {
            toast.error("Failed to update project status");
            refetch();
          },
        },
      );
    }

    setActiveProject(null);
  };

  if (isStatusLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 scrollbar-thin scrollbar-thumb-gray-200">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="flex gap-6 h-full min-w-max pb-4">
          {columns.map((col) => (
            <BoardColumn
              key={col.id}
              column={col}
              projects={projects.filter((p) => p.projectStatusId === col.id)}
              handleCardClick={handleCardClick}
              handleViewDocuments={handleViewDocuments}
            />
          ))}
        </div>

        <DragOverlay
          dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
              styles: {
                active: {
                  opacity: "0.5",
                },
              },
            }),
          }}
        >
          {activeProject ? (
            <div className="scale-105 rotate-2 transition-transform w-[330px]">
              <ProjectCard
                projectId={activeProject.projectId}
                name={activeProject.projectName}
                description={activeProject.projectDescription}
                assignees={activeProject.employeeIds}
                endDate={activeProject.projectDeadline}
                priority={activeProject.projectStatus}
                color={activeProject.color}
                coreParameterName={activeProject.coreParameterName}
                projectDocuments={activeProject.projectDocuments}
                projectDuration={activeProject.projectDuration || ""}
                createdBy={activeProject.createdBy}
                deadlineRequest={activeProject.deadlineRequest}
                onViewDocuments={handleViewDocuments}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
