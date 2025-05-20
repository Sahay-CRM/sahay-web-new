import { useCallback, useState } from "react";

export default function useStateList() {
  // const userPermission = useSelector(getUserPermission);
  // const currentPagePermission = usePermissionFromLocation("marketing");

  // const [selectedItems, setSelectedItems] = useState<TeamData[]>([]);
  const [addTeamModal, setAddTeamModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [team, setTeam] = useState({
    success: true,
    status: 200,
    message: "Ent Team Fetched",
    currentPage: 1,
    totalCount: 6,
    hasMore: false,
    pageSize: 10,
    totalPage: 1,
    sortBy: "teamName",
    sortOrder: "asc",
    data: [
      {
        teamId: "1c7ea9a8-3ad3-4db0-862d-a3ace75c9ad0",
        teamName: "India",
        createBy: "b457786d-b015-42b6-9372-8b52cc3cf446",
        updateBy: "b457786d-b015-42b6-9372-8b52cc3cf446",
        createdAt: "2025-03-25T11:31:04.738Z",
        updatedAt: "2025-03-25T11:31:04.738Z",
      },
      {
        teamId: "433dac93-3317-4ee0-ac61-11937a26393c",
        teamName: "Europe",
        createBy: "self",
        updateBy: "self",
        createdAt: "2025-03-12T05:32:52.603Z",
        updatedAt: "2025-03-12T05:32:52.603Z",
      },
      {
        teamId: "46330f51-074d-4146-add0-aa3c843cb71b",
        teamName: "USA",
        createBy: "b457786d-b015-42b6-9372-8b52cc3cf446",
        updateBy: "b457786d-b015-42b6-9372-8b52cc3cf446",
        createdAt: "2025-03-13T13:48:45.496Z",
        updatedAt: "2025-03-13T13:48:45.496Z",
      },
      {
        teamId: "8b68c967-69a2-422e-9d05-f5f4660ec153",
        teamName: "Nepal",
        createBy: "b457786d-b015-42b6-9372-8b52cc3cf446",
        updateBy: "b457786d-b015-42b6-9372-8b52cc3cf446",
        createdAt: "2025-03-24T10:38:19.616Z",
        updatedAt: "2025-03-24T10:38:19.616Z",
      },
      {
        teamId: "5175f7a4-da98-4507-8ec3-2070722aa84c",
        teamName: "Japan",
        createBy: "b457786d-b015-42b6-9372-8b52cc3cf446",
        updateBy: "b457786d-b015-42b6-9372-8b52cc3cf446",
        createdAt: "2025-03-27T12:48:53.581Z",
        updatedAt: "2025-03-27T12:49:02.653Z",
      },
    ],
  });
  const [modalData, setModalData] = useState<TeamData>({} as TeamData);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // const { mutate: deleteTeam } = deleteTeamMutation();

  const [isChildData, setIsChildData] = useState<string | undefined>();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 10,
    search: "",
  });
  // const { data: team, isLoading } = useGetTeamData({
  //   filter: paginationFilter,
  // });

  const closeDeleteModal = (): void => {
    setModalData({ teamId: "", teamName: "" });
    setAddTeamModal(false);
    setIsChildData("");
    setIsDeleteModalOpen(false);
  };

  const handleAddTeam = () => {
    setModalData({ teamId: "", teamName: "" });
    setAddTeamModal(true);
    setIsChildData("");
  };

  const openModal = useCallback((data = { teamId: "", teamName: "" }) => {
    setAddTeamModal(true);
    setModalData(data);
    setIsChildData("");
  }, []);

  const onDelete = useCallback((data: TeamData) => {
    setIsDeleteModalOpen(true);
    setModalData(data);
    setIsChildData("");
  }, []);

  const conformDelete = async () => {
    // deleteTeam(modalData.teamId, {
    //   onSuccess: () => {
    //     closeDeleteModal();
    //     setIsChildData("");
    //   },
    //   onError: (error: Error) => {
    //     const axiosError = error as AxiosError<{
    //       message?: string;
    //       status: number;
    //     }>;
    //     if (axiosError.response?.data?.status === 417) {
    //       setIsChildData(axiosError.response?.data?.message);
    //     } else if (axiosError.response?.data.status !== 417) {
    //       toast.error(
    //         `Error: ${axiosError.response?.data?.message || "An error occurred"}`
    //       );
    //     }
    //   },
    // });
  };

  return {
    team,
    // isLoading,
    closeDeleteModal,
    setPaginationFilter,
    // userPermission,
    // handleCheckboxChange,
    openModal,
    onDelete,
    // selectedItems,
    addTeamModal,
    handleAddTeam,
    modalData,
    // isAuthorized: currentPagePermission.view,
    // currentPagePermission,
    isDeleteModalOpen,
    conformDelete,
    isChildData,
  };
}
