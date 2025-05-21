import { useCallback, useState } from "react";

export default function useCountriesList() {
  // const userPermission = useSelector(getUserPermission);
  // const currentPagePermission = usePermissionFromLocation("marketing");

  // const [selectedItems, setSelectedItems] = useState<TeamData[]>([]);
  const [addCountryModal, setAddCountryModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [countryList, _setCountryList] = useState({
    success: true,
    status: 200,
    message: "Country List Fetched",
    currentPage: 1,
    totalCount: 6,
    hasMore: false,
    pageSize: 10,
    totalPage: 1,
    sortBy: "countryName",
    sortOrder: "asc",
    data: [
      {
        countryId: "1c7ea9a8-3ad3-4db0-862d-a3ace75c9ad0",
        countryName: "India",
      },
      {
        countryId: "433dac93-3317-4ee0-ac61-11937a26393c",
        countryName: "Europe",
      },
      {
        countryId: "46330f51-074d-4146-add0-aa3c843cb71b",
        countryName: "USA",
      },
      {
        countryId: "8b68c967-69a2-422e-9d05-f5f4660ec153",
        countryName: "Nepal",
      },
      {
        countryId: "5175f7a4-da98-4507-8ec3-2070722aa84c",
        countryName: "Japan",
      },
    ],
  });
  const [modalData, setModalData] = useState<CountryData>({} as CountryData);
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
    setModalData({ countryId: "", countryName: "" });
    setAddCountryModal(false);
    setIsChildData("");
    setIsDeleteModalOpen(false);
  };

  const handleAddCountry = () => {
    setModalData({ countryId: "", countryName: "" });
    setAddCountryModal(true);
    setIsChildData("");
  };

  const openModal = useCallback((data = { countryId: "", countryName: "" }) => {
    setAddCountryModal(true);
    setModalData(data);
    setIsChildData("");
  }, []);

  const onDelete = useCallback((data: CountryData) => {
    setIsDeleteModalOpen(true);
    setModalData(data);
    setIsChildData("");
  }, []);

  const confirmDelete = async () => {
    // deleteTeam(modalData.countryId, {
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
    //         Error: ${axiosError.response?.data?.message || "An error occurred"}
    //       );
    //     }
    //   },
    // });
  };

  return {
    countryList,
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
