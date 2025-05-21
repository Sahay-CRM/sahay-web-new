import { useCallback, useState } from "react";

export default function useCompaniesLists() {
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
    sortBy: "industryName",
    sortOrder: "asc",
    data: [
      {
        industryName: "Renewable Energy",
        industryId: "da9bf810-c1ab-4634-a234-29741517f34d",
      },
      {
        industryName: "Architectural Services",
        industryId: "742bb4e1-115c-4deb-bd88-2c9df389cdf6",
      },
      {
        industryName: "Pharmaceutical",
        industryId: "33ec6219-b475-4645-8b96-17a31cf5c32b",
      },
      {
        industryName: "Surgicals",
        industryId: "f5bd88d4-1f60-4280-bbf1-74be141973c7",
      },
      {
        industryName: "Windows",
        industryId: "3ebfeaa7-dd7d-440f-8114-36eef16faf03",
      },
      {
        industryName: "Civil Contractor",
        industryId: "0c5cdb34-ca20-4be5-81f4-8a89f373d544",
      },
      {
        industryName: "Ready Mix Concrete",
        industryId: "a666de11-d9a0-46ae-aa39-c9a37238e7fa",
      },
      {
        industryName: "Lighting",
        industryId: "2f3959e4-ed61-48fa-8137-fb7ec9a88e18",
      },
      {
        industryName: "IT",
        industryId: "b97eb787-d47d-48fa-8db0-7bce16dc259b",
      },
      {
        industryName: "HVAC",
        industryId: "b5f47a36-d075-42b9-96ca-a02bc81d4177",
      },
      {
        industryName: "Hosiery",
        industryId: "6f5f6e0e-2fa0-4e17-8577-099074026dbc",
      },
      {
        industryName: "Consulting",
        industryId: "398e15e2-14e6-4bde-8085-d21317420e13",
      },
    ],
  });
  const [modalData, setModalData] = useState<IndustryTypeDataProps>(
    {} as IndustryTypeDataProps,
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
    setModalData({ industryId: "", industryName: "" });
    setAddModal(false);
    setIsChildData("");
    setIsDeleteModalOpen(false);
  };

  const handleAdd = () => {
    setModalData({ industryId: "", industryName: "" });
    setAddModal(true);
    setIsChildData("");
  };

  const openModal = useCallback(
    (data = { industryId: "", industryName: "" }) => {
      setAddModal(true);
      setModalData(data);
      setIsChildData("");
    },
    [],
  );

  const onDelete = useCallback((data: IndustryTypeDataProps) => {
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
