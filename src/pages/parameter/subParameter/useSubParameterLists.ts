import { useCallback, useState } from "react";

export default function useSubParameterLists() {
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
    sortBy: "coreParameterName",
    sortOrder: "asc",
    data: [
      {
        coreParameterId: "5b0368d6-0a10-4c55-9d7a-4be9a5585c82",
        coreParameterName: "Unknown",
        departmentId: "d8236e26-7685-4b2c-b3a3-d8e39e3dbabd",
        department: {
          departmentName: "Human Resource",
        },
      },
      {
        coreParameterId: "c2aa18ed-605e-415e-b8c0-c9091347a514",
        coreParameterName: "Finance & Account",
        departmentId: "4f90a02c-e13b-40c2-b107-eae066042f96",
        department: {
          departmentName: "Finance",
        },
      },
      {
        coreParameterId: "d4beea37-0be2-4f3a-b2da-227b24eceee3",
        coreParameterName: "Human Resource",
        departmentId: "d8236e26-7685-4b2c-b3a3-d8e39e3dbabd",
        department: {
          departmentName: "Human Resource",
        },
      },
      {
        coreParameterId: "8f87f18c-2928-44de-801a-b6404130d53f",
        coreParameterName: "Marketing",
        departmentId: "85afb5dd-6d19-4d96-990e-711a7bccfda8",
        department: {
          departmentName: "Marketing",
        },
      },
    ],
  });
  const [modalData, setModalData] = useState<CoreParameterDataProps>(
    {} as CoreParameterDataProps,
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
    setModalData({ coreParameterId: "", coreParameterName: "" });
    setAddModal(false);
    setIsChildData("");
    setIsDeleteModalOpen(false);
  };

  const handleAdd = () => {
    setModalData({ coreParameterId: "", coreParameterName: "" });
    setAddModal(true);
    setIsChildData("");
  };

  const openModal = useCallback(
    (data = { coreParameterId: "", coreParameterName: "" }) => {
      setAddModal(true);
      setModalData(data);
      setIsChildData("");
    },
    [],
  );

  const onDelete = useCallback((data: CoreParameterDataProps) => {
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
