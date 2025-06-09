import { useState } from "react";
import useProduct from "./useProduct";
import { Button } from "@/components/ui/button";
import ConformationDeleteModal from "./conformationDeleteModal";
import PageNotAccess from "../PageNoAccess";
import TableData from "@/components/shared/DataTable/DataTable";
import ProductFormModal from "./ProductFormModal";
import DropdownSearchMenu from "@/components/shared/DropdownSearchMenu/DropdownSearchMenu";
import { FormProvider, useForm } from "react-hook-form";
import SearchInput from "@/components/shared/SearchInput";
import { RefreshCw } from "lucide-react";
import { mapPaginationDetails } from "@/lib/mapPaginationDetails";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Product() {
  const {
    product,
    isLoading,
    closeDeleteModal,
    setPaginationFilter,
    openModal,
    onDelete,
    addProductModal,
    handleAdd,
    modalData,
    isDeleteModalOpen,
    conformDelete,
    permission,
    isChildData,
    paginationFilter,
  } = useProduct();

  // Column visibility state
  const [columnToggleOptions, setColumnToggleOptions] = useState([
    { key: "srNo", label: "Sr No", visible: true },
    { key: "productName", label: "Product Name", visible: true },
    { key: "brandName", label: "Brand Name", visible: true },
  ]);
  const [tableRenderKey, setTableRenderKey] = useState(0);
  // Filter visible columns
  const visibleColumns = columnToggleOptions.reduce(
    (acc, col) => {
      if (col.visible) acc[col.key] = col.label;
      return acc;
    },
    {} as Record<string, string>,
  );

  // Toggle column visibility
  const onToggleColumn = (key: string) => {
    setColumnToggleOptions((prev) =>
      prev.map((col) =>
        col.key === key ? { ...col, visible: !col.visible } : col,
      ),
    );
  };

  const resetColumnWidths = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("tableWidths_productTableDataWidth");
    }
    setTableRenderKey((k) => k + 1);
  };
  // Check if the number of columns is more than 3
  const canToggleColumns = columnToggleOptions.length > 3;

  const methods = useForm();

  if (permission && permission.View === false) {
    return <PageNotAccess />;
  }

  return (
    <FormProvider {...methods}>
      <div className="w-full px-2 overflow-x-auto sm:px-4 py-4">
        <div className="flex mb-5 justify-between items-center">
          <h1 className="font-semibold capitalize text-xl text-black">
            Product List
          </h1>
          <div className="flex items-center space-x-5 tb:space-x-7">
            {(permission.Add || permission.Edit) && (
              <Button className="py-2 w-fit" onClick={handleAdd}>
                Add Product
              </Button>
            )}
          </div>
        </div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <SearchInput
              placeholder="Search..."
              searchValue={paginationFilter?.search || ""}
              setPaginationFilter={setPaginationFilter}
              className="w-80"
            />
          </div>{" "}
          <div className="flex items-center gap-2">
            {canToggleColumns && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <DropdownSearchMenu
                        columns={columnToggleOptions}
                        onToggleColumn={onToggleColumn}
                        columnIcon={true}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs text-white">Toggle Visible Columns</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={resetColumnWidths}
              className="flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>

        <div className="mt-3 bg-white py-2 tb:py-4 tb:mt-6">
          <TableData
            key={tableRenderKey}
            tableData={product?.data.map((item, index) => ({
              ...item,
              srNo: (product.currentPage - 1) * product.pageSize + index + 1,
            }))}
            columns={visibleColumns}
            primaryKey="productId"
            onEdit={openModal}
            onDelete={onDelete}
            paginationDetails={mapPaginationDetails(product)}
            setPaginationFilter={setPaginationFilter}
            isLoading={isLoading}
            moduleKey="PRODUCT"
            showIndexColumn={false}
            isActionButton={() => true}
            permissionKey="users"
            sortableColumns={["productName", "brandName"]}
          />
        </div>

        {/* Selected Customer Modal Data Preview */}
        {addProductModal && (
          <div>
            <ProductFormModal
              isModalOpen={addProductModal}
              modalClose={closeDeleteModal}
              modalData={modalData}
            />
          </div>
        )}

        {isDeleteModalOpen && (
          <ConformationDeleteModal
            modalData={modalData}
            isModalOpen={isDeleteModalOpen}
            modalClose={closeDeleteModal}
            onSubmit={conformDelete}
            isChildData={isChildData}
          />
        )}
      </div>
    </FormProvider>
  );
}
