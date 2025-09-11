import { useState, useRef, useEffect } from "react";
import {
  useGetAllGroup,
  useGetCompanyProjectAll,
  deleteGroupMutation,
  groupMutation,
  groupSequenceMutation,
} from "@/features/api/companyProject";

export default function useProjectTabs() {
  const [tabs, setTabs] = useState<TabItem[]>([{ id: "all", label: "All" }]);

  const { mutate: updateGroupSequence } = groupSequenceMutation();
  const { data: groupListRes, isPending } = useGetAllGroup();

  useEffect(() => {
    if (groupListRes?.data) {
      const apiTabs = groupListRes.data.map((group: GroupData) => ({
        id: group.groupId,
        label: group.groupName,
        groupType: group.groupType,
        selectedIds: group.selectedIds,
        sequence: group.sequence,
      }));

      setTabs([{ id: "all", label: "All" }, ...apiTabs]);
    }
  }, [groupListRes]);

  const [activeTab, setActiveTab] = useState<string>("all");
  const [longPressTab, setLongPressTab] = useState<TabItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTabName, setNewTabName] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [editingTab, setEditingTab] = useState<TabItem | null>(null);
  interface Filters {
    selected: string;
  }
  const [filters, setFilters] = useState<Filters>({ selected: "" });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentTabForProject, setCurrentTabForProject] =
    useState<TabItem | null>(null);

  const { mutateAsync: addUpdateGroup } = groupMutation();
  const { mutate: deleteGroup } = deleteGroupMutation();

  const { data: projectlistdata, isPending: isLoadingProject } =
    useGetCompanyProjectAll({
      filter: { groupId: filters.selected },
      enable: true,
    });

  const deleteTab = async (id: string) => {
    if (id === "all") return;
    deleteGroup(id);
  };
  const startPress = (tab: TabItem) => {
    if (tab.id === "all") return;
    timerRef.current = setTimeout(() => setLongPressTab(tab), 800);
  };

  const cancelPress = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setLongPressTab(null);
      }
    }

    if (longPressTab) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [longPressTab]);

  const handleTabChange = (tab: TabItem) => {
    setActiveTab(tab.id);

    if (tab.id === "all") {
      setFilters({ selected: "" }); // empty string for "All"
    } else {
      setFilters({ selected: tab.id }); // single string
    }
  };

  const projects =
    projectlistdata?.data?.map((project: CompanyProjectDataProps) => ({
      projectId: project.projectId || "",
      projectName: project.projectName || "",
      projectDescription: project.projectDescription || "",
      employeeIds:
        project.ProjectEmployees?.map((emp: Employee) => emp.employeeName) ||
        [],
      subParameterIds: [],
      projectDeadline: project.projectDeadline
        ? new Date(project.projectDeadline).toLocaleDateString("en-GB")
        : "No deadline",
      projectStatusId: project.projectStatus
        ? String(project.projectStatus)
        : "",
      color: project.color || "#000000",
    })) || [];

  const openDialogForAdd = () => {
    setEditingTab(null);
    setNewTabName("");
    setIsDialogOpen(true);
  };

  const openDialogForEdit = (tab: TabItem) => {
    setEditingTab(tab);
    setNewTabName(tab.label);
    setIsDialogOpen(true);
  };

  const confirmAddOrEditTab = async () => {
    if (!newTabName.trim()) return;

    if (editingTab) {
      const payload = {
        groupId: editingTab.id,
        groupName: newTabName,
        groupType: "PROJECT",
      };

      const res = await addUpdateGroup(payload);

      const updatedTabs = tabs.map((tab) =>
        tab.id === editingTab.id ? { ...tab, label: res.data.groupName } : tab,
      );
      setTabs(updatedTabs);

      if (activeTab === editingTab.id) {
        setFilters({ selected: res.data.groupName });
      }
    } else {
      const payload = {
        groupName: newTabName,
        groupType: "PROJECT",
      };

      const res = await addUpdateGroup(payload);

      const newTab = { id: res.data.groupId, label: res.data.groupName };
      setTabs([...tabs, newTab]);
      setActiveTab(res.data.groupId);
      setFilters({ selected: res.data.groupName });
    }

    setNewTabName("");
    setEditingTab(null);
    setIsDialogOpen(false);
  };

  const openAddProjectDrawer = (tab: TabItem) => {
    setCurrentTabForProject(tab); // store tab info
    setIsDrawerOpen(true);
  };

  const closeAddProjectDrawer = () => {
    setCurrentTabForProject(null);
    setIsDrawerOpen(false);
  };
  return {
    tabs,
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
    openAddProjectDrawer,
    closeAddProjectDrawer,
    currentTabForProject,
    isDrawerOpen,
    setLongPressTab,
    updateGroupSequence,
    isPending,
    isLoadingProject,
  };
}
