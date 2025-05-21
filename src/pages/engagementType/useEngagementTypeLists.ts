import { useCallback, useState } from "react";

export default function useEngagementTypeLists() {
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
    sortBy: "engagementTypeName",
    sortOrder: "asc",
    data: [
      {
        engagementTypeId: "f7d3c270-530f-4863-b47a-2a367d59f216",
        engagementTypeName: "Consulting (Small) - Once a Week (4-6 hrs)",
        createdBy: "01b22baa-52f1-466e-a3f5-316417b3e80e",
        updatedBy: "01b22baa-52f1-466e-a3f5-316417b3e80e",
        isDelete: false,
        createdDatetime: "2025-02-18T09:30:31.875Z",
        updatedDatetime: "2025-02-18T09:31:23.265Z",
      },
      {
        engagementTypeId: "b1a292a8-9d09-4c44-817c-97913be6b1aa",
        engagementTypeName: "Counselling (Startup) - Once a Month (1-2 hrs)",
        createdBy: "01b22baa-52f1-466e-a3f5-316417b3e80e",
        updatedBy: "01b22baa-52f1-466e-a3f5-316417b3e80e",
        isDelete: false,
        createdDatetime: "2025-02-18T09:30:51.611Z",
        updatedDatetime: "2025-02-18T09:31:53.657Z",
      },
      {
        engagementTypeId: "c2268d98-862f-431c-96df-2b4c2ce9f9ff",
        engagementTypeName: "Consulting (Micro) - Once a Week (2-3 hrs)",
        createdBy: "01b22baa-52f1-466e-a3f5-316417b3e80e",
        updatedBy: "01b22baa-52f1-466e-a3f5-316417b3e80e",
        isDelete: false,
        createdDatetime: "2025-02-18T09:30:01.609Z",
        updatedDatetime: "2025-02-18T09:32:10.709Z",
      },
      {
        engagementTypeId: "d1ea1c4c-41ae-4e8b-9d25-7030db5dc2da",
        engagementTypeName: "Consulting (Medium) - Twice a Week (4-6 hrs)",
        createdBy: "18051617-9f88-4ac2-9841-ab8cf82fa643",
        updatedBy: "01b22baa-52f1-466e-a3f5-316417b3e80e",
        isDelete: false,
        createdDatetime: "2025-02-01T12:08:54.322Z",
        updatedDatetime: "2025-02-18T09:32:25.024Z",
      },
      {
        engagementTypeId: "b7dbfce7-a170-4150-a61e-cb6f9cfa1982",
        engagementTypeName: "Consulting (Small) - Twice a Week (2-3 hrs)",
        createdBy: "01b22baa-52f1-466e-a3f5-316417b3e80e",
        updatedBy: "01b22baa-52f1-466e-a3f5-316417b3e80e",
        isDelete: false,
        createdDatetime: "2025-02-18T09:32:44.597Z",
        updatedDatetime: "2025-02-18T09:32:44.597Z",
      },
      {
        engagementTypeId: "b2c599ef-a797-49d4-b8aa-32ead3f7771c",
        engagementTypeName: "Consulting (Custom) - Permanent Onsite",
        createdBy: "01b22baa-52f1-466e-a3f5-316417b3e80e",
        updatedBy: "01b22baa-52f1-466e-a3f5-316417b3e80e",
        isDelete: false,
        createdDatetime: "2025-02-18T09:34:02.134Z",
        updatedDatetime: "2025-02-18T09:34:02.134Z",
      },
      {
        engagementTypeId: "9a941d19-86bd-40e8-8fa6-cab6e8dc8c54",
        engagementTypeName: "Consulting (Custom)",
        createdBy: "01b22baa-52f1-466e-a3f5-316417b3e80e",
        updatedBy: "01b22baa-52f1-466e-a3f5-316417b3e80e",
        isDelete: false,
        createdDatetime: "2025-02-18T09:34:12.952Z",
        updatedDatetime: "2025-02-18T09:34:12.952Z",
      },
    ],
  });
  const [modalData, setModalData] = useState<EngagementTypeDataProps>(
    {} as EngagementTypeDataProps,
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // const { mutate: deleteTeam } = deleteTeamMutation();

  const [isChildData, setIsChildData] = useState<string | undefined>();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 10,
    search: "",
  });
  // const { data: team, isLoading } = useGetTeamData({
  //   filter: paginationFilter,
  // });

  const closeDeleteModal = (): void => {
    setModalData({ engagementTypeId: "", engagementTypeName: "" });
    setAddModal(false);
    setIsChildData("");
    setIsDeleteModalOpen(false);
  };

  const handleAdd = () => {
    setModalData({ engagementTypeId: "", engagementTypeName: "" });
    setAddModal(true);
    setIsChildData("");
  };

  const openModal = useCallback(
    (data = { engagementTypeId: "", engagementTypeName: "" }) => {
      setAddModal(true);
      setModalData(data);
      setIsChildData("");
    },
    [],
  );

  const onDelete = useCallback((data: EngagementTypeDataProps) => {
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
    handleAdd,
    modalData,
    // isAuthorized: currentPagePermission.view,
    // currentPagePermission,
    isDeleteModalOpen,
    confirmDelete,
    isChildData,
  };
}
