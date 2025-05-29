import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import TableData from "@/components/shared/DataTable/DataTable";
import ConfirmationDeleteModal from "@/components/shared/Modal/ConfirmationDeleteModal/ConfirmationDeleteModal";
import { FormProvider, useForm } from "react-hook-form";
import CityFormModal from "./cityFormModal/CityFormModal";
import useCityList from "./useCitiesList";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";

export default function CitiesList() {
  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([
      { label: "Admin", href: "/" },
      {
        label: "City List",
        href: "",
      },
    ]);
  }, [setBreadcrumbs]);

  const {
    cityData,
    closeDeleteModal,
    setPaginationFilter,
    openModal,
    onDelete,
    modalData,
    isDeleteModalOpen,
    isChildData,
    addCityModal,
    handleAdd,
    permission,
    handleDeleteCity,
  } = useCityList();

  const methods = useForm();

  const [columnToggleOptions] = useState([
    { key: "srNo", label: "Sr No", visible: true },
    { key: "cityName", label: "City Name", visible: true },
    { key: "stateName", label: "State Name", visible: true },
    { key: "countryName", label: "Country Name", visible: true },
  ]);

  const visibleColumns = columnToggleOptions.reduce(
    (acc, col) => {
      if (col.visible) acc[col.key] = col.label;
      return acc;
    },
    {} as Record<string, string>
  );

  return (
    <FormProvider {...methods}>
      <div className="w-full px-2 overflow-x-auto sm:px-4 py-4">
        <div className="flex mb-5 justify-between items-center">
          <h1 className="font-semibold capitalize text-xl text-black">
            Cities
          </h1>
          {(permission.Add || permission.Edit) && (
          <div className="flex items-center space-x-5 tb:space-x-7">
            <Button className="py-2 w-fit" onClick={handleAdd}>
              Add City
            </Button>
          </div>)}
        </div>
        <div className="mt-3 bg-white py-2 tb:py-4 tb:mt-6">
          <TableData
            tableData={cityData?.data.map((item, index) => ({
              ...item,
              srNo: (cityData.currentPage - 1) * cityData.pageSize + index + 1,
            }))}
            columns={visibleColumns}
            primaryKey="cityId"
            onEdit={(row) => openModal(row as unknown as CityData)}
            onDelete={(row) => onDelete(row as unknown as CityData)}
            isActionButton
            paginationDetails={{
              currentPage: cityData?.currentPage,
              pageSize: cityData?.pageSize,
              totalCount: cityData?.totalCount,
              totalPage: cityData?.totalPage,
              hasMore: cityData?.hasMore,
              status: cityData?.status,
            }}
            setPaginationFilter={setPaginationFilter}
            localStorageId="cityList"
            moduleKey="CITY"
          />
        </div>

        {addCityModal && (
          <CityFormModal
            isModalOpen={addCityModal}
            modalClose={closeDeleteModal}
            modalData={modalData}
          />
        )}
        {isDeleteModalOpen && (
          <ConfirmationDeleteModal
            modalData={modalData?.cityName ?? ""}
            isModalOpen={isDeleteModalOpen}
            modalClose={closeDeleteModal}
            onSubmit={handleDeleteCity}
            isChildData={isChildData}
            title={"Delete City Name"}
            label={"City Name :"}
          />
        )}
      </div>
    </FormProvider>
  );
}
