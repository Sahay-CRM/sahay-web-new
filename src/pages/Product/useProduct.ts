import { useCallback, useState } from "react";
import { AxiosError } from "axios";
import { useSelector } from "react-redux";

import { toast } from "sonner";
import { getUserPermission } from "@/features/selectors/auth.selector";
import { deleteProductMutation, useGetProduct } from "@/features/api/Product";

export default function useProduct() {
  const [addProductModal, setAddProductModal] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const permission = useSelector(getUserPermission).PRODUCT;

  const [modalData, setModalData] = useState<ProductData>({} as ProductData);

  const [isChildData, setIsChildData] = useState<string | undefined>();

  // Pagination Details and Filter
  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 10,
    search: "",
  });

  const { data: product, isLoading } = useGetProduct({
    filter: paginationFilter,
  });

  const { mutate: deleteProduct } = deleteProductMutation();

  // Otherwise open modal for edit
  const openModal = useCallback((data: ProductData) => {
    setModalData(data);
    setAddProductModal(true);
    setIsChildData("");
  }, []);

  const handleAdd = () => {
    setAddProductModal(true);
    setIsChildData("");
  };

  const closeDeleteModal = (): void => {
    setModalData({
      brandId: "",
      productName: "",
      productId: "",
    });
    // Clear modal data
    setAddProductModal(false);
    setIsDeleteModalOpen(false);
    setIsChildData("");
  };

  const onDelete = useCallback((data: ProductData) => {
    setIsDeleteModalOpen(true);
    setModalData(data);
    setIsChildData("");
  }, []);

  const conformDelete = async () => {
    if (modalData.productId) {
      deleteProduct(modalData.productId, {
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
    product,
    closeDeleteModal,
    setPaginationFilter,
    openModal,
    onDelete,
    modalData,
    isDeleteModalOpen,
    addProductModal,
    handleAdd,
    conformDelete,
    permission,
    isChildData,
  };
}
