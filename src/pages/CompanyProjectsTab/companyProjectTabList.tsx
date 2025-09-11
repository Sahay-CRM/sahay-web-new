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

export default function CompanyProjectTabList() {
  const {
    tabs,
    activeTab,
    longPressTab,
    dragItemIndex,
    isDialogOpen,
    newTabName,
    dropdownRef,
    deleteTab,
    startPress,
    cancelPress,
    handleTabChange,
    handleOrderUpdate,
    handleDragStart,
    handleDragEnd,
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
  } = useProjectTabs();

  return (
    <div className="w-full p-4">
      {/* Tabs container */}
      <div className="flex justify-end items-center gap-2 mb-4">
        {tabs.map((tab, index) => (
          <div
            key={tab.id}
            draggable={tab.id !== "all"}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => {
              e.preventDefault();
              if (
                dragItemIndex.current !== null &&
                dragItemIndex.current !== index
              ) {
                handleOrderUpdate(tabs[dragItemIndex.current].id, index);
                dragItemIndex.current = index;
              }
            }}
            onDragEnd={handleDragEnd}
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

            {/* Long-press dropdown */}
            {longPressTab?.id === tab.id && (
              <div
                ref={dropdownRef}
                className="absolute top-full right-0 mt-1 w-40 border bg-white shadow-lg rounded-md z-50"
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
                  Add Project
                </button>

                {/* <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => {
                    alert(`Remove Project for ${tab.label}`);
                  }}
                >
                  Remove Project
                </button> */}
              </div>
            )}
          </div>
        ))}

        <button
          onClick={openDialogForAdd}
          className="p-2 bg-primary text-white rounded-full flex items-center"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Project Cards */}
      <div className="flex mt-10 flex-wrap justify-center sm:justify-start gap-4 sm:gap-6 mb-4 px-1">
        {projects.map((project) => (
          <div
            key={project.id}
            className="w-full sm:w-[48%] md:w-[45%] lg:w-[45%] max-w-[360px]"
          >
            <ProjectCard
              name={project.name}
              description={project.description}
              assignees={project.assignees}
              endDate={project.deadline}
              priority={project.status}
              color={project.color}
            />
          </div>
        ))}
      </div>
      <AddProjectDrawer
        isOpen={isDrawerOpen}
        onClose={closeAddProjectDrawer}
        tab={currentTabForProject}
      />

      {/* Add Tab Modal */}
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
