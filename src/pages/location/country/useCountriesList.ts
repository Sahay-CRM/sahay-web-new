import {
  deleteCountryMutation,
  useGetCountryList,
} from "@/features/api/country";
import { getUserPermission } from "@/features/selectors/auth.selector";
import { useCallback, useState } from "react";
import { useSelector } from "react-redux";

export default function useCountriesList() {
  // const userPermission = useSelector(getUserPermission);
  // const currentPagePermission = usePermissionFromLocation("marketing");

  // const [selectedItems, setSelectedItems] = useState<TeamData[]>([]);
  const [addCountryModal, setAddCountryModal] = useState(false);
  const permission = useSelector(getUserPermission).COUNTRY;                        /////////////////
  const [modalData, setModalData] = useState<CountryData>({} as CountryData);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // const { mutate: deleteTeam } = deleteTeamMutation();

  const [isChildData, setIsChildData] = useState<string | undefined>();
  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 10,
    search: "",
  });
  const { mutate: deleteCountry } = deleteCountryMutation();

  const { data: countryList } = useGetCountryList({
    filter: paginationFilter,
  });
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
    deleteCountry(modalData, {
      onSuccess: () => {
        closeDeleteModal();
      },
    });
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
    permission
  };
}
