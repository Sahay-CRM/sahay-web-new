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
import ViewMeetingModal from "./ViewProjectModal";
import RearrangeTabsSheet from "./RearrangeTabsSheet";
import SearchInput from "@/components/shared/SearchInput";
import { Link } from "react-router-dom";
import Pagination from "@/components/shared/Pagination/Pagination";
import { SpinnerIcon } from "@/components/shared/Icons";

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
    paginationFilter,
    setPaginationFilter,
    isViewModalOpen,
    viewModalData,
    setIsRearrangeOpen,
    isRearrangeOpen,
    permission,
    handleCardClick,
    setIsViewModalOpen,
    projectlistdata,
  } = useProjectTabs();

  const isLoading = isPending || isLoadingProject;

  return (
    <div className="w-full  h-[calc(100vh-90px)] flex flex-col">
      <div className="bg-white sticky top-0 z-30 p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex-shrink-0">
            {projects.length !== 0 && (
              <SearchInput
                className="w-60"
                placeholder="Search..."
                searchValue={paginationFilter?.search || ""}
                setPaginationFilter={setPaginationFilter}
              />
            )}
          </div>

          {/* Tabs + Buttons (wrap together) */}
          <div className="flex flex-wrap items-center gap-2 flex-1 justify-end">
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
                    className="absolute text-sm top-full right-0 mt-2 w-45 border bg-white shadow-lg rounded-md z-50"
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

            {/* Add Tab Button */}
            <button
              onClick={openDialogForAdd}
              className="p-2 bg-transparent border border-primary hover:bg-primary hover:text-white text-primary rounded-md flex items-center"
            >
              <Plus className="h-4 w-4" />
            </button>

            {permission.Add && (
              <Link to="/dashboard/projects/add">
                <Button
                  size="sm"
                  className="py-2 w-fit border bg-transparent hover:text-white text-primary border-primary"
                >
                  Add Company Project
                </Button>
              </Link>
            )}
          </div>
        </div>

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
      </div>

      {isLoading ? (
        <div className="animate-spin flex items-center justify-center w-full">
          <SpinnerIcon />
        </div>
      ) : (
        <div className="flex-1  p-4">
          {projects.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div
                onClick={() => {
                  const currentTab = tabs.find(
                    (t) => t.id === activeTab,
                  ) as TabItem;
                  openAddProjectDrawer(currentTab);
                }}
                className="w-full max-w-[360px] border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center p-10 cursor-pointer hover:border-blue-400 hover:text-primary transition"
              >
                <span className="text-4xl font-bold">+</span>
                <span className="mt-2 text-sm text-gray-500">Add Project</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center sm:justify-start gap-4 sm:gap-6 mb-4 px-1">
              {projects.map((project) => (
                <div
                  key={project.projectId}
                  className="w-full cursor-pointer sm:w-[48%] md:w-[45%] lg:w-[45%] max-w-[360px]"
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
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sticky Pagination */}
      {projectlistdata && projectlistdata.data?.length > 0 && (
        <div className="sticky bottom-0 bg-white z-10  py-1">
          <Pagination
            paginationDetails={projectlistdata as PaginationFilter}
            setPaginationFilter={setPaginationFilter}
          />
        </div>
      )}
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
              {editingTab ? "Edit Project Group" : "Add New Project Group"}
            </DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Enter Project Group Name"
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
