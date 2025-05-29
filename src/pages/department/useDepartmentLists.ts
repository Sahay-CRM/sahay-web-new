import { useCallback, useState } from "react";

export default function useDepartmentLists() {
  // const userPermission = useSelector(getUserPermission);
  // const currentPagePermission = usePermissionFromLocation("marketing");

  // const [selectedItems, setSelectedItems] = useState<TeamData[]>([]);
  const [addDepartmentModal, setAddDepartmentModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [departmentList, _setDepartmentList] = useState({
    success: true,
    status: 200,
    message: "Department List Fetched",
    currentPage: 1,
    totalCount: 12,
    hasMore: false,
    pageSize: 10,
    totalPage: 2,
    sortBy: "departmentName",
    sortOrder: "asc",
    data: [
      {
        departmentId: "85afb5dd-6d19-4d96-990e-711a7bccfda8",
        departmentName: "Marketing",
        createdDatetime: "2025-02-01T12:07:32.045Z",
        updatedDatetime: "2025-02-01T12:07:32.045Z",
      },
      {
        departmentId: "d8236e26-7685-4b2c-b3a3-d8e39e3dbabd",
        departmentName: "Human Resource",
        createdDatetime: "2025-02-01T12:07:47.206Z",
        updatedDatetime: "2025-02-01T12:07:47.206Z",
      },
      {
        departmentId: "4f90a02c-e13b-40c2-b107-eae066042f96",
        departmentName: "Finance",
        createdDatetime: "2025-02-01T12:07:56.289Z",
        updatedDatetime: "2025-02-01T12:07:56.289Z",
      },
      {
        departmentId: "5c822d88-73ac-445c-8de9-f84a29e715d5",
        departmentName: "Sales",
        createdDatetime: "2025-02-17T07:49:33.318Z",
        updatedDatetime: "2025-02-17T07:49:33.318Z",
      },
      {
        departmentId: "98dbd98c-4948-46b4-86e5-8c90cd676bfb",
        departmentName: "Accounts",
        createdDatetime: "2025-02-17T07:49:38.208Z",
        updatedDatetime: "2025-02-17T07:49:38.208Z",
      },
      {
        departmentId: "6f08fd23-1307-4fc4-9032-284765457b7c",
        departmentName: "Business Development",
        createdDatetime: "2025-02-17T07:49:48.312Z",
        updatedDatetime: "2025-02-17T07:49:48.312Z",
      },
      {
        departmentId: "15870c8e-c42a-46ab-8d37-75a9c33130fb",
        departmentName: "Production",
        createdDatetime: "2025-02-17T07:49:54.914Z",
        updatedDatetime: "2025-02-17T07:49:54.914Z",
      },
      {
        departmentId: "2b94eceb-2ff0-4e36-9a29-cf224bdd45b3",
        departmentName: "Operations",
        createdDatetime: "2025-02-17T07:50:06.066Z",
        updatedDatetime: "2025-02-17T07:50:06.066Z",
      },
      {
        departmentId: "431f6977-508d-42e4-a891-1ad61f95f81a",
        departmentName: "Supply Chain",
        createdDatetime: "2025-02-17T07:50:26.010Z",
        updatedDatetime: "2025-02-17T07:50:26.010Z",
      },
      {
        departmentId: "11c37a34-86c1-4591-96ce-9ad2697d443c",
        departmentName: "Branding & Public Relations",
        createdDatetime: "2025-02-17T07:50:42.413Z",
        updatedDatetime: "2025-02-17T07:50:42.413Z",
      },
      {
        departmentId: "e77a36a6-274e-4b3c-882c-1eaa157a646c",
        departmentName: "Technology",
        createdDatetime: "2025-02-17T08:03:20.218Z",
        updatedDatetime: "2025-02-17T08:03:20.218Z",
      },
    ],
  });
  const [modalData, setModalData] = useState<DepartmentDataProps>(
    {} as DepartmentDataProps,
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
    setModalData({ departmentId: "", departmentName: "" });
    setAddDepartmentModal(false);
    setIsChildData("");
    setIsDeleteModalOpen(false);
  };

  const handleAddDepartment = () => {
    setModalData({ departmentId: "", departmentName: "" });
    setAddDepartmentModal(true);
    setIsChildData("");
  };

  const openModal = useCallback(
    (data = { departmentId: "", departmentName: "" }) => {
      setAddDepartmentModal(true);
      setModalData(data);
      setIsChildData("");
    },
    [],
  );

  const onDelete = useCallback((data: DepartmentDataProps) => {
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
    departmentList,
    // isLoading,
    closeDeleteModal,
    setPaginationFilter,
    // userPermission,
    // handleCheckboxChange,
    openModal,
    onDelete,
    // selectedItems,
    addDepartmentModal,
    handleAddDepartment,
    modalData,
    // isAuthorized: currentPagePermission.view,
    // currentPagePermission,
    isDeleteModalOpen,
    confirmDelete,
    isChildData,
  };
}
