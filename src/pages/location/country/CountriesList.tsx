import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import TableData from "@/components/shared/DataTable/DataTable";
import useCountriesList from "./useCountriesList";
import CountryFormModal from "./countryFormModal/CountryFormModal";
import ConfirmationDeleteModal from "@/components/shared/Modal/ConfirmationDeleteModal/ConfirmationDeleteModal";
import { FormProvider, useForm } from "react-hook-form";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
// import CountryFormModal from "./countryFormModal/CountryFormModal";
// import ConfirmationDeleteModal from "@/components/shared/Modal/ConfirmationDeleteModal/ConfirmationDeleteModal";

export default function CountriesList() {
  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([
      { label: "Admin", href: "/" },
      {
        label: "Country List",
        href: "",
      },
    ]);
  }, [setBreadcrumbs]);

  const {
    countryList,
    closeDeleteModal,
    setPaginationFilter,
    openModal,
    onDelete,
    addCountryModal,
    handleAddCountry,
    modalData,
    isDeleteModalOpen,
    confirmDelete,
    isChildData,
    permission,
  } = useCountriesList();
  const methods = useForm();
  // const { setBreadcrumbs } = useBreadcrumbs();

  // useEffect(() => {
  //   setBreadcrumbs([{ label: "Marketing", href: "" }]);
  // }, [setBreadcrumbs]);

  // Column visibility state
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [columnToggleOptions, _setColumnToggleOptions] = useState([
    { key: "srNo", label: "Sr No", visible: true },
    { key: "countryName", label: "Country Name", visible: true },
  ]);

  // Filter visible columns
  const visibleColumns = columnToggleOptions.reduce(
    (acc, col) => {
      if (col.visible) acc[col.key] = col.label;
      return acc;
    },
    {} as Record<string, string>
  );

  // Toggle column visibility
  // const onToggleColumn = (key: string) => {
  //   setColumnToggleOptions((prev) =>
  //     prev.map((col) =>
  //       col.key === key ? { ...col, visible: !col.visible } : col
  //     )
  //   );
  // };
  // Check if the number of columns is more than 3
  // const canToggleColumns = columnToggleOptions.length > 3;

  // if (!isAuthorized) {
  //   return <PageNotAccess />;
  // }

  // if (!isAuthorized) return <PageNotAccess />;

  return (
    <FormProvider {...methods}>
      <div className="w-full px-2 overflow-x-auto sm:px-4 py-4">
        <div className="flex mb-5 justify-between items-center">
          <h1 className="font-semibold capitalize text-xl text-black">
            Countries
          </h1>
          {(permission.Add || permission.Edit) && (
            <div className="flex items-center space-x-5 tb:space-x-7">
              <Button className="py-2 w-fit" onClick={handleAddCountry}>
                Add Country
              </Button>
            </div>
          )}
        </div>
        <div className="mt-3 bg-white py-2 tb:py-4 tb:mt-6">
          <TableData
            tableData={countryList?.data.map((item, index) => ({
              ...item,
              srNo: index + 1,
            }))}
            isActionButton
            columns={visibleColumns}
            primaryKey="countryId"
            onEdit={(row) => openModal(row)}
            onDelete={(row) => onDelete(row)}
            paginationDetails={countryList}
            setPaginationFilter={setPaginationFilter}
            localStorageId="countryList"
            moduleKey="COUNTRY"
          />
        </div>

        {addCountryModal && (
          <CountryFormModal
            isModalOpen={addCountryModal}
            modalClose={closeDeleteModal}
            modalData={modalData}
          />
        )}
        {isDeleteModalOpen && (
          <ConfirmationDeleteModal
            title={"Delete Country Name"}
            label={"Country Name :"}
            modalData={modalData?.countryName}
            isModalOpen={isDeleteModalOpen}
            modalClose={closeDeleteModal}
            onSubmit={confirmDelete}
            isChildData={isChildData}
          />
        )}
      </div>
    </FormProvider>
  );
}
