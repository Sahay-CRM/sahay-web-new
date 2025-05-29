import { useCallback, useState } from "react";

export default function useCitiesList() {
  // const userPermission = useSelector(getUserPermission);
  // const currentPagePermission = usePermissionFromLocation("marketing");

  // const [selectedItems, setSelectedItems] = useState<TeamData[]>([]);
  const [addCountryModal, setAddCountryModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [cityList, setCityList] = useState({
    success: true,
    status: 200,
    message: "City List Fetched",
    currentPage: 1,
    totalCount: 6,
    hasMore: false,
    pageSize: 10,
    totalPage: 1,
    sortBy: "cityName",
    sortOrder: "asc",
    data: [
      {
        cityId: "1c7ea9a8-3ad3-4db0-862d-a3ace75c9ad0",
        cityName: "India",
      },
      {
        cityId: "433dac93-3317-4ee0-ac61-11937a26393c",
        cityName: "Europe",
      },
      {
        cityId: "46330f51-074d-4146-add0-aa3c843cb71b",
        cityName: "USA",
      },
      {
        cityId: "8b68c967-69a2-422e-9d05-f5f4660ec153",
        cityName: "Nepal",
      },
      {
        cityId: "5175f7a4-da98-4507-8ec3-2070722aa84c",
        cityName: "Japan",
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
    setAddCountryModal(false);
    setIsChildData("");
    setIsDeleteModalOpen(false);
  };

  const handleAddCountry = () => {
    setModalData({ teamId: "", teamName: "" });
    setAddCountryModal(true);
    setIsChildData("");
  };

  const openModal = useCallback((data = { teamId: "", teamName: "" }) => {
    setAddCountryModal(true);
    setModalData(data);
    setIsChildData("");
  }, []);

  const onDelete = useCallback((data: TeamData) => {
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
    cityList,
    // isLoading,
    closeDeleteModal,
    setPaginationFilter,
    // userPermission,
    // handleCheckboxChange,
    openModal,
    onDelete,
    // selectedItems,
    addCountryModal,
    handleAddCountry,
    modalData,
    // isAuthorized: currentPagePermission.view,
    // currentPagePermission,
    isDeleteModalOpen,
    confirmDelete,
    isChildData,
  };
}
