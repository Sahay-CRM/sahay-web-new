import { useState } from "react";
import useBrand from "./useBrand";
import { Button } from "@/components/ui/button";
import ConformationDeleteModal from "./conformationDeleteModal";
import PageNotAccess from "../PageNoAccess";
import TableData from "@/components/shared/DataTable/DataTable";
import BrandFormModal from "./BrandFormModal";
import DropdownSearchMenu from "@/components/shared/DropdownSearchMenu/DropdownSearchMenu";
import { FormProvider, useForm } from "react-hook-form";
import SearchInput from "@/components/shared/SearchInput";
import { RefreshCw } from "lucide-react";

export default function Brand() {
  const {
    brand,
    isLoading,
    closeDeleteModal,
    setPaginationFilter,
    openModal,
    onDelete,
    addBrandModal,
    handleAdd,
    modalData,
    isDeleteModalOpen,
    conformDelete,
    permission,
    isChildData,
    paginationFilter,
  } = useBrand();

  // Column visibility state
  const [columnToggleOptions, setColumnToggleOptions] = useState([
    { key: "srNo", label: "Sr No", visible: true },
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
  // Check if the number of columns is more than 3
  const canToggleColumns = columnToggleOptions.length > 3;

  const methods = useForm();
  const resetColumnWidths = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("tableWidths_brandTableDataWidth");
    }
    setTableRenderKey((k) => k + 1);
  };

  if (permission && permission.View === false) {
    return <PageNotAccess />;
  }

  return (
    <FormProvider {...methods}>
      <div className="w-full px-2 overflow-x-auto sm:px-4 py-4">
        <div className="flex mb-5 justify-between items-center">
          <h1 className="font-semibold capitalize text-xl text-black">
            Brand List
          </h1>
          <div className="flex items-center space-x-5 tb:space-x-7">
            {(permission.Add || permission.Edit) && (
              <Button className="py-2 w-fit" onClick={handleAdd}>
                Add Brand
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
          </div>

          <div className="flex items-center gap-2">
            {canToggleColumns && (
              <DropdownSearchMenu
                columns={columnToggleOptions}
                onToggleColumn={onToggleColumn}
                columnIcon={true}
              />
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
            tableData={brand?.data.map((item, index) => ({
              ...item,
              srNo: (brand.currentPage - 1) * brand.pageSize + index + 1,
            }))}
            columns={visibleColumns}
            primaryKey="brandId"
            onEdit={openModal}
            onDelete={onDelete}
            paginationDetails={brand}
            setPaginationFilter={setPaginationFilter}
            isLoading={isLoading}
            moduleKey="BRAND"
            showIndexColumn={false}
            isActionButton={() => true}
            permissionKey="users"
            localStorageId="brandTableDataWidth"
          />
        </div>

        {/* Selected Customer Modal Data Preview */}
        {addBrandModal && (
          <div>
            <BrandFormModal
              isModalOpen={addBrandModal}
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
