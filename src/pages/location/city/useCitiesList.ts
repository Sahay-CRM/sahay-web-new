import { deleteCityMutation, useGetCityList } from "@/features/api/city";
import { getUserPermission } from "@/features/selectors/auth.selector";
import { useCallback, useState } from "react";
import { useSelector } from "react-redux";

export default function useCityList() {
  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 10,
    status: 1,
    search: "",
  });

  const [modalData, setModalData] = useState<CityData | undefined>();
  const [addCityModal, setAddCityModal] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isChildData, setIsChildData] = useState<string | undefined>();
const permission = useSelector(getUserPermission).CITY;     
  const { mutate: deleteCity } = deleteCityMutation();
  const { data: cityData } = useGetCityList({ filter: paginationFilter });

  const handleAdd = () => {
    setModalData({ cityId: "", cityName: "", stateId: "", countryId: "" });
    setAddCityModal(true);
    setIsChildData("");
  };

  const closeDeleteModal = () => {
    setModalData(undefined);
    setAddCityModal(false);
    setIsDeleteModalOpen(false);
    setIsChildData("");
  };

  const openModal = useCallback((data: CityData) => {
    setModalData(data);
    setAddCityModal(true);
    setIsChildData("");
  }, []);

  const onDelete = useCallback((data: CityData) => {
    setIsDeleteModalOpen(true);
    setModalData(data);
    setIsChildData("");
  }, []);

  const handleDeleteCity = async () => {
    if (modalData) {
      deleteCity(modalData, {
        onSuccess: () => {
          closeDeleteModal();
        },
      });
    }
  };

  return {
    cityData,
    setPaginationFilter,
    paginationFilter,
    handleAdd,
    modalData,
    addCityModal,
    closeDeleteModal,
    openModal,
    onDelete,
    isDeleteModalOpen,
    handleDeleteCity,
    isChildData,
    permission
  };
}
