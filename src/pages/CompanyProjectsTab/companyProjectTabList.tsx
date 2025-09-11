import ProjectCard from "./projectCard";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import useProjectTabs from "./useProjectTabs";
import { Button } from "@/components/ui/button";
import AddProjectDrawer from "./AssignProject/AddProjectDrawer";
import { useState } from "react";
import ViewMeetingModal from "./ViewProjectModal";
import RearrangeTabsSheet from "./RearrangeTabsSheet";

export default function CompanyProjectTabList() {
  const {
    tabs,
    isPending,
    isLoadingProject,
    activeTab,
    longPressTab,
    isDialogOpen,
    newTabName,
    dropdownRef,
    deleteTab,
    startPress,
    cancelPress,
    handleTabChange,
    setIsDialogOpen,
    setNewTabName,
    projects,
    editingTab,
    openDialogForAdd,
    openDialogForEdit,
    confirmAddOrEditTab,
    setLongPressTab,
    isDrawerOpen,
    currentTabForProject,
    openAddProjectDrawer,
    closeAddProjectDrawer,
    updateGroupSequence,
  } = useProjectTabs();

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewModalData, setViewModalData] = useState<IProjectFormData>(
    {} as IProjectFormData,
  );
  const [isRearrangeOpen, setIsRearrangeOpen] = useState<TabItem | null>(null);

  const handleCardClick = (project: IProjectFormData) => {
    setViewModalData(project);
    setIsViewModalOpen(true);
  };
  const isLoading = isPending || isLoadingProject;

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  return (
    <div className="w-full h-screen flex flex-col">
      <div className="flex flex-wrap justify-end items-center gap-2 p-4 bg-white sticky top-0 z-50">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            draggable={tab.id !== "all"}
            className="relative"
            onMouseDown={() => startPress(tab)}
            onMouseUp={cancelPress}
            onMouseLeave={cancelPress}
            onTouchStart={() => startPress(tab)}
            onTouchEnd={cancelPress}
          >
            <input
              type="radio"
              name="tabset"
              id={tab.id}
              checked={activeTab === tab.id}
              onChange={() => handleTabChange(tab)}
              className="absolute left-[-200vw]"
            />
            <label
              htmlFor={tab.id}
              className={`px-3 py-1 cursor-pointer rounded-full font-semibold transition text-sm
          ${
            activeTab === tab.id
              ? "bg-primary text-white"
              : "text-black bg-white border border-gray-300"
          }`}
            >
              {tab.label}
            </label>

            {longPressTab?.id === tab.id && (
              <div
                ref={dropdownRef}
                className="absolute text-sm top-full right-0 mt-1 w-45 border bg-white shadow-lg rounded-md z-50"
              >
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => {
                    openDialogForEdit(tab);
                    setLongPressTab(null);
                  }}
                >
                  Edit
                </button>
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => deleteTab(tab.id)}
                >
                  Delete
                </button>
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => {
                    openAddProjectDrawer(tab);
                    setLongPressTab(null);
                  }}
                >
                  Manage Project
                </button>
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => {
                    setIsRearrangeOpen(tab);
                    setLongPressTab(null);
                  }}
                >
                  Manage Sequence
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Rearrange Tabs Sheet */}
        <RearrangeTabsSheet
          isOpen={!!isRearrangeOpen}
          onClose={() => setIsRearrangeOpen(null)}
          tabs={tabs}
          activeTab={isRearrangeOpen}
          onSave={(updatedTabs) => {
            const updatedTabsa = updatedTabs
              .map((tab) => tab.id)
              .filter((tabId) => tabId !== "all");
            updateGroupSequence({ groupSequenceArray: updatedTabsa });
          }}
        />

        {/* Add Tab Button */}
        <button
          onClick={openDialogForAdd}
          className="p-2 bg-primary text-white rounded-full flex items-center"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1  p-4">
        <div className="flex flex-wrap justify-center sm:justify-start gap-4 sm:gap-6 mb-4 px-1">
          {projects.map((project) => (
            <div
              key={project.projectId}
              className="w-full sm:w-[48%] md:w-[45%] lg:w-[45%] max-w-[360px]"
              onClick={() => handleCardClick(project)}
            >
              <ProjectCard
                name={project.projectName}
                description={project.projectDescription}
                assignees={project.employeeIds}
                endDate={project.projectDeadline}
                priority={project.projectStatusId}
                color={project.color}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <ViewMeetingModal
        isModalOpen={isViewModalOpen}
        modalData={viewModalData}
        modalClose={() => setIsViewModalOpen(false)}
      />
      <AddProjectDrawer
        isOpen={isDrawerOpen}
        onClose={closeAddProjectDrawer}
        tab={currentTabForProject}
      />

      {/* Add/Edit Tab Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTab ? "Edit Group" : "Add New Group"}
            </DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Enter tab name"
            value={newTabName}
            onChange={(e) => setNewTabName(e.target.value)}
          />
          <DialogFooter className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAddOrEditTab}>
              {editingTab ? "Save" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
