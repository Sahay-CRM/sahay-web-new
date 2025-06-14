import ModalData from "@/components/shared/Modal/ModalData";

interface TaskModalProps {
  modalData: EmployeeData;
  isModalOpen: boolean;
  modalClose: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const AddEmployeeModal: React.FC<TaskModalProps> = ({
  modalData,
  isModalOpen,
  modalClose,
  onSubmit,
  isLoading,
}) => {
  const department =
    modalData?.departmentName ||
    (typeof modalData?.departmentId === "object" &&
      modalData?.departmentId?.departmentName);

  const designation =
    modalData?.designationName ||
    (typeof modalData?.designationId === "object" &&
      modalData?.designationId?.designationName);

  return (
    <ModalData
      isModalOpen={isModalOpen}
      modalTitle={modalData.employeeId ? "Update Employee" : "Add Employee"}
      modalClose={modalClose}
      buttons={[
        {
          btnText: "Cancel",
          buttonCss: "py-1.5 px-5",
          btnClick: modalClose,
        },
        {
          btnText: "Submit",
          buttonCss: "py-1.5 px-5",
          btnClick: onSubmit,
          isLoading: isLoading,
        },
      ]}
    >
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm text-gray-700">
        {modalData?.employeeName && (
          <div>
            <span className="font-medium text-primary">Employee Name: </span>
            {modalData.employeeName}
          </div>
        )}
        {modalData?.employeeEmail && (
          <div>
            <span className="font-medium text-primary">Email: </span>
            {modalData.employeeEmail}
          </div>
        )}
        {modalData?.employeeMobile && (
          <div>
            <span className="font-medium text-primary">Mobile: </span>
            {modalData.employeeMobile}
          </div>
        )}
        {modalData?.employeeType && (
          <div>
            <span className="font-medium text-primary">Employee Type: </span>
            {modalData.employeeType}
          </div>
        )}
        {department && (
          <div>
            <span className="font-medium text-primary">Department: </span>
            {department}
          </div>
        )}
        {designation && (
          <div>
            <span className="font-medium text-primary">Designation: </span>
            {designation}
          </div>
        )}
        {modalData?.employee && (
          <div className="col-span-2">
            <span className="font-medium text-primary">
              Reporting Manager:{" "}
            </span>
            {modalData.employee?.employeeName}
          </div>
        )}
      </div>
    </ModalData>
  );
};

export default AddEmployeeModal;
