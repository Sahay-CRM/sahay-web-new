import { FormProvider, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import ConformationDeleteModal from "./conformationDeleteModal";
import PageNotAccess from "../PageNoAccess";
import TableData from "@/components/shared/DataTable/DataTable";
import BrandFormModal from "./BrandFormModal";
import SearchInput from "@/components/shared/SearchInput";
import { mapPaginationDetails } from "@/lib/mapPaginationDetails";

import useBrand from "./useBrand";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { useEffect } from "react";

export default function Brand() {
  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([{ label: "Brand", href: "" }]);
  }, [setBreadcrumbs]);

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

  const methods = useForm();

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
            {permission.Add && (
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
        </div>

        <div className="mt-3 bg-white py-2 tb:py-4 tb:mt-6">
          <TableData
            tableData={brand?.data.map((item, index) => ({
              ...item,
              srNo: (brand.currentPage - 1) * brand.pageSize + index + 1,
            }))}
            columns={{
              srNo: "Sr No",
              brandName: "Brand Name",
            }}
            primaryKey="brandId"
            onEdit={openModal}
            onDelete={onDelete}
            paginationDetails={mapPaginationDetails(brand)}
            setPaginationFilter={setPaginationFilter}
            isLoading={isLoading}
            moduleKey="BRAND"
            showIndexColumn={false}
            isActionButton={() => true}
            permissionKey="users"
            sortableColumns={["brandName"]}
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
