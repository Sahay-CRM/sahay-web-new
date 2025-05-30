import ModalData from "@/components/shared/Modal/ModalData";

interface TaskModalProps {
  modalData: EmployeeData;
  isModalOpen: boolean;
  modalClose: () => void;
  onSubmit: () => void;
}
const AddEmployeeModal: React.FC<TaskModalProps> = ({
  modalData,
  isModalOpen,
  modalClose,
  onSubmit,
}) => {
  return (
    <div>
      <ModalData
        isModalOpen={isModalOpen}
        modalTitle="Add Employee"
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
          },
        ]}
      >
        <div>
          <div>
            <span>Employee Name: {modalData?.employeeName}</span>
          </div>
          <div>
            <span>Email: {modalData?.employeeEmail}</span>
          </div>
          <div>
            <span>Mobile: {modalData?.employeeMobile}</span>
          </div>
          <div>
            <span>Department: {modalData?.departmentId}</span>
          </div>
          <div>
            <span>Designation: {modalData?.designationId}</span>
          </div>
          <div>
            <span>Employee Type: {modalData?.employeeType}</span>
          </div>
          <div>
            <span>Reporting Manager: {modalData?.reportingManagerId}</span>
          </div>
        </div>
      </ModalData>
    </div>
  );
};

export default AddEmployeeModal;
