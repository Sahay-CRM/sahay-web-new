import { useCallback, useState } from "react";
import { AxiosError } from "axios";
import { useSelector } from "react-redux";

import { toast } from "sonner";

import { getUserPermission } from "@/features/selectors/auth.selector";
import { deleteBrandMutation, useGetBrand } from "@/features/api/Brand";

export default function useBrand() {
  const [addBrandModal, setAddBrandModal] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const permission = useSelector(getUserPermission).BRAND;

  const [modalData, setModalData] = useState<BrandData>({} as BrandData);

  const [isChildData, setIsChildData] = useState<string | undefined>();

  // Pagination Details and Filter
  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 25,
    search: "",
    sortBy: "brandName",
    sortOrder: "asc",
  });

  const { data: brand, isLoading } = useGetBrand({
    filter: paginationFilter,
  });

  const { mutate: deleteBrand } = deleteBrandMutation();

  // Otherwise open modal for edit
  const openModal = useCallback((data: BrandData) => {
    setModalData(data);
    setAddBrandModal(true);
    setIsChildData("");
  }, []);

  const handleAdd = () => {
    setAddBrandModal(true);
    setIsChildData("");
  };

  const closeDeleteModal = (): void => {
    setModalData({
      brandId: "",
      brandName: "",
    });
    // Clear modal data
    setAddBrandModal(false);
    setIsDeleteModalOpen(false);
    setIsChildData("");
  };

  const onDelete = useCallback((data: BrandData) => {
    setIsDeleteModalOpen(true);
    setModalData(data);
    setIsChildData("");
  }, []);

  const conformDelete = async () => {
    if (modalData.brandId) {
      deleteBrand(modalData.brandId, {
        onSuccess: () => {
          closeDeleteModal();
          setIsChildData("");
        },
        onError: (error: Error) => {
          const axiosError = error as AxiosError<{
            message?: string;
            status: number;
          }>;

          if (axiosError.response?.data?.status === 417) {
            setIsChildData(axiosError.response?.data?.message);
          } else if (axiosError.response?.data.status !== 417) {
            toast.error(
              `Error: ${axiosError.response?.data?.message || "An error occurred"}`,
            );
          }
        },
      });
    }
  };

  return {
    isLoading,
    brand,
    closeDeleteModal,
    setPaginationFilter,
    openModal,
    onDelete,
    modalData,
    isDeleteModalOpen,
    addBrandModal,
    handleAdd,
    conformDelete,
    permission,
    isChildData,
    paginationFilter,
  };
}
