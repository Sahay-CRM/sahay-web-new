import { useCallback, useState } from "react";

export default function useConsultantsLists() {
  // const userPermission = useSelector(getUserPermission);
  // const currentPagePermission = usePermissionFromLocation("marketing");

  // const [selectedItems, setSelectedItems] = useState<TeamData[]>([]);
  const [addModal, setAddModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [dataList, _setDataList] = useState({
    success: true,
    status: 200,
    message: "List Fetched",
    currentPage: 1,
    totalCount: 12,
    hasMore: false,
    pageSize: 10,
    totalPage: 2,
    sortBy: "consultantName",
    sortOrder: "asc",
    data: [
      {
        consultantId: "4c28e786-1b11-441e-8baa-d3396b0a8ad2",
        consultantName: "Jay Joshi",
        consultantMobile: "+919725163588",
        consultantEmail: "jay@userex.in",
        photo: "af754c31-2f6c-481f-8b47-2a86fbec5607.webp",
        pancard: null,
      },
      {
        consultantId: "d75087b1-185e-48ae-9890-a471d8ec30be",
        consultantName: "Pritesh",
        consultantMobile: "+917600204057",
        consultantEmail: "support@userex.in",
        photo: "0ccf996b-9f41-41a1-a180-8bc09571bcc7.webp",
        pancard: null,
      },
      {
        consultantId: "cfbfe52d-cbc1-42c1-a50a-18d9422f434a",
        consultantName: "Rahul Makahaniya",
        consultantMobile: "+918866826313",
        consultantEmail: "rahul@userex.in",
        photo: "2c052d6a-97b7-4fbc-9fe5-a3ef25a0702f.webp",
        pancard: null,
      },
      {
        consultantId: "464ef41f-3044-4e97-a637-7b3531bb525a",
        consultantName: "Rushiraj Patel",
        consultantMobile: "+919687655143",
        consultantEmail: "rushiraj@sahay.group",
        photo: null,
        pancard: "",
      },
    ],
  });
  const [modalData, setModalData] = useState<ConsultantDataProps>(
    {} as ConsultantDataProps,
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // const { mutate: deleteTeam } = deleteTeamMutation();

  const [isChildData, setIsChildData] = useState<string | undefined>();

  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 10,
    search: "",
  });
  // const { data: team, isLoading } = useGetTeamData({
  //   filter: paginationFilter,
  // });

  const closeDeleteModal = (): void => {
    setModalData({ consultantId: "", consultantName: "" });
    setAddModal(false);
    setIsChildData("");
    setIsDeleteModalOpen(false);
  };

  const openModal = useCallback(
    (data = { consultantId: "", consultantName: "" }) => {
      setAddModal(true);
      setModalData(data);
      setIsChildData("");
    },
    [],
  );

  const onDelete = useCallback((data: ConsultantDataProps) => {
    setIsDeleteModalOpen(true);
    setModalData(data);
    setIsChildData("");
  }, []);

  const confirmDelete = async () => {
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
    dataList,
    // isLoading,
    closeDeleteModal,
    setPaginationFilter,
    // userPermission,
    // handleCheckboxChange,
    openModal,
    onDelete,
    // selectedItems,
    addModal,
    paginationFilter,
    modalData,
    // isAuthorized: currentPagePermission.view,
    // currentPagePermission,
    isDeleteModalOpen,
    confirmDelete,
    isChildData,
  };
}
