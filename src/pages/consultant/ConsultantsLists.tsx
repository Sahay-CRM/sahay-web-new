import { useState } from "react";
import { Button } from "@/components/ui/button";
import TableData from "@/components/shared/DataTable/DataTable";
import ConfirmationDeleteModal from "@/components/shared/Modal/ConfirmationDeleteModal/ConfirmationDeleteModal";
import { FormProvider, useForm } from "react-hook-form";
import useConsultantsLists from "./useConsultantsLists";
import ConsultantFormModal from "./consultantFormModal/ConsultantFormModal";
import { Link } from "react-router-dom";
import SearchInput from "@/components/shared/SearchInput";
import DropdownSearchMenu from "@/components/shared/DropdownSearchMenu/DropdownSearchMenu";

export default function ConsultantsLists() {
  const {
    dataList,
    closeDeleteModal,
    setPaginationFilter,
    paginationFilter,
    openModal,
    onDelete,
    addModal,
    modalData,
    isDeleteModalOpen,
    confirmDelete,
    isChildData,
  } = useConsultantsLists();
  const methods = useForm();
  // const { setBreadcrumbs } = useBreadcrumbs();

  // useEffect(() => {
  //   setBreadcrumbs([{ label: "Marketing", href: "" }]);
  // }, [setBreadcrumbs]);

  // Column visibility state
  const [columnToggleOptions, setColumnToggleOptions] = useState([
    { key: "srNo", label: "Sr No", visible: true },
    { key: "consultantName", label: "Consultant Name", visible: true },
  ]);

  // Filter visible columns
  const visibleColumns = columnToggleOptions.reduce(
    (acc, col) => {
      if (col.visible) acc[col.key] = col.label;
      return acc;
    },
    {} as Record<string, string>,
  );

  const onToggleColumn = (key: string) => {
    setColumnToggleOptions((prev) =>
      prev.map((col) =>
        col.key === key ? { ...col, visible: !col.visible } : col,
      ),
    );
  };
  // Check if the number of columns is more than 3
  const canToggleColumns = columnToggleOptions.length > 3;

  // if (!isAuthorized) return <PageNotAccess />;

  return (
    <FormProvider {...methods}>
      <div className="w-full px-2 overflow-x-auto sm:px-4 py-4">
        <div className="flex mb-5 justify-between items-center">
          <h1 className="font-semibold capitalize text-xl text-black">
            Consultants
          </h1>
          <div className="flex items-center space-x-5 tb:space-x-7">
            <SearchInput
              placeholder="Search..."
              searchValue={paginationFilter?.search || ""}
              setPaginationFilter={setPaginationFilter}
              className="w-96"
            />
            <Link to="/administrator-panel/add-consultants">
              <Button className="py-2 w-fit">Add Consultant</Button>
            </Link>
            {canToggleColumns && (
              <DropdownSearchMenu
                columns={columnToggleOptions}
                onToggleColumn={onToggleColumn}
              />
            )}
          </div>
        </div>
        <div className="mt-3 bg-white py-2 tb:py-4 tb:mt-6">
          {/* ✅ Custom TableData Component */}
          <TableData
            tableData={dataList?.data.map((item, index) => ({
              ...item,
              srNo: index + 1,
            }))}
            columns={visibleColumns}
            primaryKey="consultantId"
            onEdit={(row) => openModal(row)}
            onDelete={(row) => onDelete(row)}
            paginationDetails={dataList}
            setPaginationFilter={setPaginationFilter}
          />
        </div>

        {addModal && (
          <ConsultantFormModal
            isModalOpen={addModal}
            modalClose={closeDeleteModal}
            modalData={modalData}
          />
        )}
        {isDeleteModalOpen && (
          <ConfirmationDeleteModal
            title={"Delete Consultant"}
            label={"Consultant Name :"}
            modalData={modalData?.consultantName}
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
