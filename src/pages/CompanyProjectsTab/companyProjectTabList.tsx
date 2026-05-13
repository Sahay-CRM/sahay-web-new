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
import ViewProjectModal from "./ViewProjectModal";
import RearrangeTabsSheet from "./RearrangeTabsSheet";
import SearchInput from "@/components/shared/SearchInput";
import { Link } from "react-router-dom";
import { SpinnerIcon } from "@/components/shared/Icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import DropdownSearchMenu from "@/components/shared/DropdownSearchMenu/DropdownSearchMenu";
import FormSelect from "@/components/shared/Form/FormSelect";
import DateRangePicker from "@/components/shared/DateRange";
import { useState } from "react";
import { ViewProjectDocsModal } from "./ViewProjectDocumentModal";
import ProjectBoard from "./Board/ProjectBoard";

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
    statusOptions,
    handleFilterChange,
    handleFilterChangeBF,
    SelectedStatus,
    SelectedBussinessFunc,
    sortOrder,
    handleOrderChange,
    orderBy,
    bussinessFunctOptions,
    projectDateRange,
    appliedDateRange,
    handleDateRangeChange,
    handleDateRangeApply,
    handleDateRangeSaveApply,
    handleDateRangeReset,
    refetch,
  } = useProjectTabs();
  const [isViewDocsModalOpen, setIsViewDocsModalOpen] = useState(false);
  const [viewDocsModalData, setViewDocsModalData] = useState<IProjectFormData>(
    {} as IProjectFormData,
  );

  const handleViewDocuments = (
    projectDocuments: { fileId: string; fileName: string }[],
    projectId: string,
  ) => {
    setViewDocsModalData((prev) => ({
      ...prev,
      projectDocuments,
      projectId,
    }));
    setIsViewDocsModalOpen(true);
  };

  const isLoading = isPending || isLoadingProject;
  const [viewMode, setViewMode] = useState<"list" | "board">("list");

  return (
    <div className="w-full  h-[calc(100vh-90px)] flex flex-col">
      <div className="bg-white sticky top-0 z-30 px-4 pt-4 pb-1 ">
        <div className="flex flex-col gap-1">
          {/* Row 1: Global Filters & Primary Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <SearchInput
                className="w-60"
                placeholder="Search..."
                searchValue={paginationFilter?.search || ""}
                setPaginationFilter={setPaginationFilter}
              />

              <DropdownSearchMenu
                label="Status"
                options={statusOptions}
                selected={SelectedStatus?.selected}
                onChange={(selected) => {
                  handleFilterChange(selected);
                }}
                multiSelect
              />
              <DropdownSearchMenu
                label="Business Function"
                options={bussinessFunctOptions}
                selected={SelectedBussinessFunc?.selected}
                onChange={(selected) => {
                  handleFilterChangeBF(selected);
                }}
                multiSelect
              />
              <FormSelect
                placeholder="Order By"
                options={sortOrder}
                value={orderBy}
                onChange={(selected) => {
                  handleOrderChange(selected as string);
                }}
                className="h-10"
              />
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() =>
                  setViewMode(viewMode === "list" ? "board" : "list")
                }
                className="h-9 px-4 text-[11px] font-bold border-primary/30 text-primary hover:bg-primary/5 rounded-full flex items-center gap-2"
              >
                {viewMode === "list" ? <>View as column</> : <>View as List</>}
              </Button>

              <DateRangePicker
                value={{
                  from: projectDateRange.projectStartDate,
                  to: projectDateRange.projectDeadline,
                }}
                onChange={handleDateRangeChange}
                onApply={handleDateRangeApply}
                onSaveApply={handleDateRangeSaveApply}
                defaultDate={{
                  startDate: appliedDateRange.projectStartDate,
                  deadline: appliedDateRange.projectDeadline,
                }}
                isClear
                handleClear={handleDateRangeReset}
              />

              {permission.Add && (
                <Link to="/dashboard/projects/add">
                  <Button
                    size="sm"
                    className="py-2 px-4 border bg-primary text-white border-primary rounded-lg font-bold shadow-sm hover:opacity-90 transition-all"
                  >
                    Add New Project
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Row 2: Group Navigation (Tabs) */}
          <div className="flex flex-wrap items-center justify-end ">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={openDialogForAdd}
                      className="p-1.5 bg-transparent border border-primary/30 hover:bg-primary/5 text-primary rounded-full flex items-center transition-all shadow-sm"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs text-white ">Add New Group</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
                        onClick={() => deleteTab(tab)}
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
            </div>
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
        <div className="animate-spin flex items-center justify-center w-full h-full">
          <SpinnerIcon />
        </div>
      ) : viewMode === "board" ? (
        <ProjectBoard
          projects={projects}
          handleCardClick={handleCardClick}
          handleViewDocuments={handleViewDocuments}
          refetch={refetch}
        />
      ) : (
        <div className="flex-1 px-4 py-2 overflow-y-auto">
          {activeTab === "all" && projects.length === 0 ? (
            <div className="h-[calc(100vh-200px)] w-full text-2xl flex items-center justify-center">
              No Data Available
            </div>
          ) : activeTab !== "all" && projects.length === 0 ? (
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
                <span className="mt-2 text-sm text-gray-500">
                  Add Project to this Group
                </span>
              </div>
            </div>
          ) : activeTab === "all" ? (
            <div className="space-y-10 pb-10">
              {Object.entries(
                projects.reduce(
                  (acc, project) => {
                    const bf =
                      project.coreParameterName ||
                      "Unassigned Business Function";
                    if (!acc[bf]) acc[bf] = [];
                    acc[bf].push(project);
                    return acc;
                  },
                  {} as Record<string, typeof projects>,
                ),
              ).map(([businessFunction, functionProjects]) => (
                <div key={businessFunction} className="space-y-6">
                  <div className="flex items-center gap-4 py-2">
                    <div className="flex-1 h-[1px] bg-slate-300"></div>
                    <h2 className="text-lg font-semibold text-primary  whitespace-nowrap px-2">
                      {businessFunction}
                    </h2>
                    <div className="flex-1 h-[1px] bg-slate-300"></div>
                  </div>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-4 sm:gap-6 px-1">
                    {functionProjects.map((project) => (
                      <div
                        key={project.projectId}
                        className="w-full cursor-pointer sm:w-[48%] md:w-[30%] lg:w-[25%] max-w-[360px]"
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
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap justify-center sm:justify-start gap-4 sm:gap-6 mb-4 px-1">
              {projects.map((project) => (
                <div
                  key={project.projectId}
                  className="w-full cursor-pointer sm:w-[48%] md:w-[30%] lg:w-[25%] max-w-[360px]"
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
            </div>
          )}
        </div>
      )}

      <ViewProjectModal
        isModalOpen={isViewModalOpen}
        modalData={viewModalData}
        modalClose={() => setIsViewModalOpen(false)}
      />
      <ViewProjectDocsModal
        isModalOpen={isViewDocsModalOpen}
        modalData={viewDocsModalData}
        modalClose={() => setIsViewDocsModalOpen(false)}
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
