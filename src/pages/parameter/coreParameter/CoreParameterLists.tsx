import { useState } from "react";
import { Button } from "@/components/ui/button";
import TableData from "@/components/shared/DataTable/DataTable";
import ConfirmationDeleteModal from "@/components/shared/Modal/ConfirmationDeleteModal/ConfirmationDeleteModal";
import { FormProvider, useForm } from "react-hook-form";
import useCoreParameterLists from "./useCoreParameterLists";
import { CoreParameterModal } from "./CoreParameterModal/CoreParameterModal";

export default function CoreParameterLists() {
  const {
    dataList,
    closeDeleteModal,
    setPaginationFilter,
    openModal,
    onDelete,
    addModal,
    handleAdd,
    modalData,
    isDeleteModalOpen,
    confirmDelete,
    isChildData,
  } = useCoreParameterLists();
  const methods = useForm();
  // const { setBreadcrumbs } = useBreadcrumbs();

  // useEffect(() => {
  //   setBreadcrumbs([{ label: "Marketing", href: "" }]);
  // }, [setBreadcrumbs]);

  // Column visibility state
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [columnToggleOptions, _setColumnToggleOptions] = useState([
    { key: "srNo", label: "Sr No", visible: true },
    { key: "coreParameterName", label: "Core Parameter Name", visible: true },
    { key: "departmentName", label: "Department Name", visible: true },
  ]);

  // Filter visible columns
  const visibleColumns = columnToggleOptions.reduce(
    (acc, col) => {
      if (col.visible) acc[col.key] = col.label;
      return acc;
    },
    {} as Record<string, string>,
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
            Core Parameter Lists
          </h1>
          <div className="flex items-center space-x-5 tb:space-x-7">
            <Button className="py-2 w-fit" onClick={handleAdd}>
              Add Core Parameter
            </Button>
          </div>
        </div>
        <div className="mt-3 bg-white py-2 tb:py-4 tb:mt-6">
          {/* ✅ Custom TableData Component */}
          <TableData
            tableData={dataList?.data.map((item, index) => ({
              ...item,
              srNo: index + 1,
              departmentName: item.department?.departmentName,
            }))}
            columns={visibleColumns}
            primaryKey="coreParameterId"
            onEdit={(row) => openModal(row)}
            onDelete={(row) => onDelete(row)}
            paginationDetails={dataList}
            setPaginationFilter={setPaginationFilter}
          />
        </div>

        {addModal && (
          <CoreParameterModal
            isModalOpen={addModal}
            modalClose={closeDeleteModal}
            modalData={modalData}
          />
        )}
        {isDeleteModalOpen && (
          <ConfirmationDeleteModal
            title={"Delete Core Parameter"}
            label={"Core Parameter Name :"}
            modalData={modalData?.coreParameterName}
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
