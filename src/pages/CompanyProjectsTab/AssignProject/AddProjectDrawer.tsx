import { FC, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import SearchInput from "@/components/shared/SearchInput";
import {
  useGetCompanyProject,
  addProjectToGroupMutation,
  removeProjectGroupMutation,
} from "@/features/api/companyProject";

// import your APIs

interface TabItem {
  id: string;
  label: string;
  color?: string;
  selectedIds?: string[];
}

interface AddProjectDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tab: TabItem | null;
}

const AddProjectDrawer: FC<AddProjectDrawerProps> = ({
  isOpen,
  onClose,
  tab,
}) => {
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 25,
    search: "",
  });

  useEffect(() => {
    if (isOpen) {
      setSelectedProjectIds(tab?.selectedIds || []);
    }
  }, [isOpen, tab]);

  const { data: projectlistdata, isLoading } = useGetCompanyProject({
    filter: { ...paginationFilter },
    enable: isOpen,
  });
  const { mutate: addProjectToGroup } = addProjectToGroupMutation();
  const { mutate: removeProjectFromGroup } = removeProjectGroupMutation();
  const projects =
    projectlistdata?.data?.map((p: CompanyProjectDataProps) => ({
      projectId: p.projectId,
      projectName: p.projectName,
      projectDescription: p.projectDescription,
      color: p.color,
    })) || [];

  const toggleProject = (projectId: string) => {
    setSelectedProjectIds((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId],
    );
  };

  const handleSave = async () => {
    if (!tab) return;

    const previousIds = tab.selectedIds || [];
    const toAdd = selectedProjectIds.filter((id) => !previousIds.includes(id));
    const toRemove = previousIds.filter(
      (id) => !selectedProjectIds.includes(id),
    );

    try {
      if (toAdd.length > 0) {
        await addProjectToGroup({ groupId: tab.id, projectIds: toAdd });
      }
      if (toRemove.length > 0) {
        await removeProjectFromGroup({ groupId: tab.id, projectIds: toRemove });
      }

      // optionally update the tab.selectedIds to reflect new state
      tab.selectedIds = selectedProjectIds;

      onClose();
    } catch (err) {
      console.error("Error updating projects:", err);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/30 z-40 transition-opacity ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 h-full w-[400px] bg-white shadow-lg z-50 transform transition-transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full p-4">
          <h2 className="text-lg font-semibold mb-4">
            Add Project to "{tab?.label}"
          </h2>

          <SearchInput
            placeholder="Search..."
            searchValue={paginationFilter.search || ""}
            setPaginationFilter={setPaginationFilter}
            className="ml-1 w-80"
          />

          <div className="flex flex-col mt-1 gap-2 flex-1 overflow-y-auto mb-4">
            {isLoading && (
              <p className="text-sm text-gray-500">Loading projects...</p>
            )}
            {!isLoading && projects.length === 0 && (
              <p className="text-sm text-gray-500">No projects found.</p>
            )}

            {!isLoading &&
              projects.map((project) => (
                <Tooltip key={project.projectId}>
                  <TooltipTrigger>
                    <label className="w-[360px] flex items-center gap-2 p-2 border rounded cursor-pointer text-sm hover:bg-gray-100">
                      <input
                        type="checkbox"
                        className="appearance-none w-4 h-4 border-2 border-gray-400 rounded-full checked:bg-primary checked:border-primary relative before:absolute before:top-1/2 before:left-1/2 before:w-2 before:h-2 before:bg-white before:rounded-full before:transform before:-translate-x-1/2 before:-translate-y-1/2 checked:before:bg-white"
                        checked={selectedProjectIds.includes(
                          project.projectId || "",
                        )}
                        onChange={() => toggleProject(project.projectId || "")}
                      />
                      <span>{project.projectName}</span>
                    </label>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-sm">
                    {project.projectDescription || "No description"}
                  </TooltipContent>
                </Tooltip>
              ))}
          </div>

          <div className="flex justify-end gap-2 mt-1">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={selectedProjectIds.length === 0}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddProjectDrawer;
