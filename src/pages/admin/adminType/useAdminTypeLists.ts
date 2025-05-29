import { useCallback, useState } from "react";

export default function useAdminTypeLists() {
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
    sortBy: "adminUserTypeName",
    sortOrder: "asc",
    data: [
      {
        adminUserTypeId: "dc91dfe2-4f42-4d35-8a26-860f76ead5bd",
        adminUserTypeName: "Administrator",
        createdBy: "3059599a-f634-4c3d-9873-faca7fe16e64",
        updatedBy: "3059599a-f634-4c3d-9873-faca7fe16e64",
        isDelete: false,
        createdDatetime: "2025-02-01T11:50:43.246Z",
        updatedDatetime: "2025-02-01T11:50:43.246Z",
      },
      {
        adminUserTypeId: "a5af618e-85ed-4cc6-af67-34cdf42a504d",
        adminUserTypeName: "superadmin",
        createdBy: "2",
        updatedBy: "01b22baa-52f1-466e-a3f5-316417b3e80e",
        isDelete: false,
        createdDatetime: "2025-02-01T09:40:46.425Z",
        updatedDatetime: "2025-02-17T16:15:55.524Z",
      },
      {
        adminUserTypeId: "3b8c0603-b9af-4438-87fb-02483a260257",
        adminUserTypeName: "Add Company KPI",
        createdBy: "01b22baa-52f1-466e-a3f5-316417b3e80e",
        updatedBy: "01b22baa-52f1-466e-a3f5-316417b3e80e",
        isDelete: false,
        createdDatetime: "2025-02-18T09:54:03.188Z",
        updatedDatetime: "2025-02-18T09:54:58.501Z",
      },
      {
        adminUserTypeId: "2a5e053f-d72b-4d1a-a018-8b163fe6c206",
        adminUserTypeName: "Analyst",
        createdBy: "3059599a-f634-4c3d-9873-faca7fe16e64",
        updatedBy: "3059599a-f634-4c3d-9873-faca7fe16e64",
        isDelete: false,
        createdDatetime: "2025-02-23T11:28:40.949Z",
        updatedDatetime: "2025-02-23T11:28:40.949Z",
      },
      {
        adminUserTypeId: "bb82f2f6-713a-45ed-8484-62413f150a92",
        adminUserTypeName: "Associate",
        createdBy: "3059599a-f634-4c3d-9873-faca7fe16e64",
        updatedBy: "3059599a-f634-4c3d-9873-faca7fe16e64",
        isDelete: false,
        createdDatetime: "2025-02-23T11:28:46.210Z",
        updatedDatetime: "2025-02-23T11:28:46.210Z",
      },
      {
        adminUserTypeId: "bb247ef6-244c-441f-9234-d40ce3b27e24",
        adminUserTypeName: "Senior Associate",
        createdBy: "3059599a-f634-4c3d-9873-faca7fe16e64",
        updatedBy: "3059599a-f634-4c3d-9873-faca7fe16e64",
        isDelete: false,
        createdDatetime: "2025-02-23T11:31:14.988Z",
        updatedDatetime: "2025-02-23T11:31:14.988Z",
      },
      {
        adminUserTypeId: "675c40d3-0b70-4100-b00f-bc584d533678",
        adminUserTypeName: "Senior Analyst",
        createdBy: "3059599a-f634-4c3d-9873-faca7fe16e64",
        updatedBy: "3059599a-f634-4c3d-9873-faca7fe16e64",
        isDelete: false,
        createdDatetime: "2025-02-23T11:32:47.388Z",
        updatedDatetime: "2025-02-23T11:32:47.388Z",
      },
      {
        adminUserTypeId: "38df3f82-2a2c-451d-9464-a20a3c551ac6",
        adminUserTypeName: "Intern",
        createdBy: "3059599a-f634-4c3d-9873-faca7fe16e64",
        updatedBy: "3059599a-f634-4c3d-9873-faca7fe16e64",
        isDelete: false,
        createdDatetime: "2025-02-23T12:52:42.129Z",
        updatedDatetime: "2025-02-23T12:52:42.129Z",
      },
    ],
  });
  const [modalData, setModalData] = useState<AdminUserTypeDataProps>(
    {} as AdminUserTypeDataProps,
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
    setModalData({ adminUserTypeId: "", adminUserTypeName: "" });
    setAddModal(false);
    setIsChildData("");
    setIsDeleteModalOpen(false);
  };

  const handleAdd = () => {
    setModalData({ adminUserTypeId: "", adminUserTypeName: "" });
    setAddModal(true);
    setIsChildData("");
  };

  const openModal = useCallback(
    (data = { adminUserTypeId: "", adminUserTypeName: "" }) => {
      setAddModal(true);
      setModalData(data);
      setIsChildData("");
    },
    [],
  );

  const onDelete = useCallback((data: AdminUserTypeDataProps) => {
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
