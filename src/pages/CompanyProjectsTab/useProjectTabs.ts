import { useState, useRef, useEffect } from "react";
import {
  useGetAllGroup,
  deleteGroupMutation,
  groupMutation,
  groupSequenceMutation,
  useGetCompanyProject,
  useGetAllProjectStatus,
} from "@/features/api/companyProject";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { useSelector } from "react-redux";
import { getUserPermission } from "@/features/selectors/auth.selector";
import { useGetCoreParameterDropdown } from "@/features/api/Business";

export default function useProjectTabs() {
  const [tabs, setTabs] = useState<TabItem[]>([{ id: "all", label: "All" }]);

  const { mutate: updateGroupSequence } = groupSequenceMutation();
  const { data: groupListRes, isPending } = useGetAllGroup({
    filter: {},
  });

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
  const [SelectedStatus, setSelectedStatus] = useState<{ selected?: string[] }>(
    {},
  );
  const [SelectedBussinessFunc, setSelectedBusinessFunc] = useState<{
    selected?: string[];
  }>({});
  const [SelectedOrder, setSelectedOrder] = useState<string>("asc");
  const [SelectedSortOrder, setSelectedSortOrder] =
    useState<string>("projectName");
  const [orderBy, setOrderBy] = useState<string>("asc");

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentTabForProject, setCurrentTabForProject] =
    useState<TabItem | null>(null);

  const { mutateAsync: addUpdateGroup } = groupMutation();
  const { mutate: deleteGroup } = deleteGroupMutation();
  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 25,
    totalPage: 1,
    totalCount: 0,
  });
  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([{ label: "Company Project", href: "" }]);
  }, [setBreadcrumbs]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewModalData, setViewModalData] = useState<IProjectFormData>(
    {} as IProjectFormData,
  );
  const [isRearrangeOpen, setIsRearrangeOpen] = useState<TabItem | null>(null);
  const permission = useSelector(getUserPermission).PROJECT_LIST;
  const handleCardClick = (project: IProjectFormData) => {
    setViewModalData(project);
    setIsViewModalOpen(true);
  };
  const {
    data: projectListData,
    isPending: isLoadingProject,
    refetch,
  } = useGetCompanyProject({
    filter: {
      groupId: filters.selected,
      statusArray: SelectedStatus.selected,
      businessFunctionIds: SelectedBussinessFunc.selected,
      sortBy: SelectedSortOrder || "projectName",
      sortOrder: SelectedOrder,
      ...paginationFilter,
    },
    enable: true,
  });
  const { data: projectStatusList } = useGetAllProjectStatus({
    filter: {},
  });
  const { data: coreParams } = useGetCoreParameterDropdown({
    filter: {},
  });

  const statusOptions = Array.isArray(projectStatusList?.data)
    ? projectStatusList.data.map((item: ProjectStatusRes) => ({
        label: item.projectStatus,
        value: item.projectStatusId,
        color: item.color || "#2e3195",
      }))
    : [];
  const bussinessFunctOptions = Array.isArray(coreParams?.data)
    ? coreParams.data.map((item: CoreParameterDataProps) => ({
        label: item.coreParameterName,
        value: item.coreParameterId,
      }))
    : [];
  // const bussinessFunctOptions = (coreParams?.data || []).map((status) => ({
  //   value: status.coreParameterId,
  //   label: status.coreParameterName,
  // }));
  const sortOrder = [
    { label: "Sort by A-Z", value: "asc" },
    { label: "Sort by Z-A", value: "desc" },
    { label: "Sort by Deadline", value: "projectDeadline" },
  ];

  const deleteTab = async (tab: TabItem) => {
    if (tab.id === "all") return;
    deleteGroup({ groupId: tab.id });
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
      setFilters({ selected: "" });
    } else {
      setFilters({ selected: tab.id });
    }
    refetch();
  };

  const projects =
    projectListData?.data?.map((project: CompanyProjectDataProps) => ({
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
      projectStatus: project.projectStatus ? String(project.projectStatus) : "",
      projectStatusId: project.projectStatusId,
      color: project.color || "#000000",
      coreParameterName: project.coreParameter?.coreParameterName,
      projectDocuments: Array.isArray(project.files)
        ? project.files.map((f: { fileId: string; fileName: string }) => ({
            fileId: f.fileId,
            fileName: f.fileName,
          }))
        : [],
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
    setCurrentTabForProject(tab);
    setIsDrawerOpen(true);
    refetch();
  };

  const closeAddProjectDrawer = () => {
    setCurrentTabForProject(null);
    setIsDrawerOpen(false);
    refetch();
  };

  const handleFilterChange = (selected: string[]) => {
    setSelectedStatus({
      selected,
    });
  };
  const handleFilterChangeBF = (selected: string[]) => {
    setSelectedBusinessFunc({
      selected,
    });
  };

  const handleOrderChange = (selected: string) => {
    if (selected === "projectDeadline") {
      setSelectedSortOrder("projectDeadline");
      setSelectedOrder("desc");
    } else if (selected === "asc" || selected === "desc") {
      setSelectedOrder(selected);
      setSelectedSortOrder("projectName");
    } else {
      setSelectedSortOrder(selected);
    }

    setOrderBy(selected);
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
    setPaginationFilter,
    paginationFilter,
    isViewModalOpen,
    viewModalData,
    setIsRearrangeOpen,
    isRearrangeOpen,
    permission,
    handleCardClick,
    setIsViewModalOpen,
    projectListData,
    statusOptions,
    handleFilterChange,
    handleFilterChangeBF,
    SelectedStatus,
    SelectedBussinessFunc,
    sortOrder,
    SelectedOrder,
    handleOrderChange,
    orderBy,
    bussinessFunctOptions,
  };
}
