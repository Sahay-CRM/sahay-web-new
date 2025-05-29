import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import TableData from "@/components/shared/DataTable/DataTable";
import ConfirmationDeleteModal from "@/components/shared/Modal/ConfirmationDeleteModal/ConfirmationDeleteModal";
import { FormProvider, useForm } from "react-hook-form";
import useStateList from "./useStateList";
import StateFormModal from "./stateFormModal/StateFormModal";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";

export default function StatesList() {
  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([
      { label: "Admin", href: "/" },
      {
        label: "State List",
        href: "",
      },
    ]);
  }, [setBreadcrumbs]);

  const {
    stateData,
    closeDeleteModal,
    setPaginationFilter,
    openModal,
    onDelete,
    modalData,
    isDeleteModalOpen,
    isChildData,
    addStateModal,
    handleAdd,
    handleDeleteState,
    permission,
  } = useStateList();
  const methods = useForm();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [columnToggleOptions, _setColumnToggleOptions] = useState([
    { key: "srNo", label: "Sr No", visible: true },
    { key: "stateName", label: "State Name", visible: true },
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
            States
          </h1>
          {(permission.Add || permission.Edit) && (
          <div className="flex items-center space-x-5 tb:space-x-7">
            <Button className="py-2 w-fit" onClick={handleAdd}>
              Add State
            </Button>
          </div>
          )}
        </div>
        <div className="mt-3 bg-white py-2 tb:py-4 tb:mt-6">
          {/* ✅ Custom TableData Component */}
          <TableData
            tableData={stateData?.data?.map((state, index) => ({
              ...state,
              srNo:
                (stateData.currentPage - 1) * stateData.pageSize + index + 1,
            }))}
            isActionButton
            columns={visibleColumns}
            primaryKey="stateId"
            onEdit={(row) => openModal(row)}
            onDelete={(row) => onDelete(row)}
            paginationDetails={stateData}
            setPaginationFilter={setPaginationFilter}
            localStorageId="stateList"
            moduleKey="STATE"
          />
        </div>

        {addStateModal && (
          <StateFormModal
            isModalOpen={addStateModal}
            modalClose={closeDeleteModal}
            modalData={modalData}
          />
        )}
        {isDeleteModalOpen && (
          <ConfirmationDeleteModal
            modalData={modalData?.stateName ?? ""}
            isModalOpen={isDeleteModalOpen}
            modalClose={closeDeleteModal}
            onSubmit={handleDeleteState}
            isChildData={isChildData}
            title={"Delete State Name"}
            label={"State Name :"}
          />
        )}
      </div>
    </FormProvider>
  );
}
