import ModalData from "@/components/shared/Modal/ModalData";
import { getUserPermission } from "@/features/selectors/auth.selector";
import { capitalizeFirstLetter } from "@/features/utils/app.utils";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

interface ViewMeetingModalProps {
  modalData: EmployeeData;
  isModalOpen: boolean;
  modalClose: () => void;
}

const ViewMeetingModal: React.FC<ViewMeetingModalProps> = ({
  modalData,
  isModalOpen,
  modalClose,
}) => {
  const navigate = useNavigate();
  const permission = useSelector(getUserPermission).EMPLOYEE;

  const handleEdit = () => {
    if (modalData?.employeeId) {
      navigate(`/dashboard/employees/edit/${modalData.employeeId}`);
    }
  };

  return (
    <ModalData
      isModalOpen={isModalOpen}
      modalTitle="Employee Details"
      modalClose={modalClose}
      buttons={[
        {
          btnText: "Close",
          buttonCss: "py-1.5 px-5",
          btnClick: modalClose,
        },
        ...(permission.Edit &&
        !!(
          modalData?.employeeType == "OWNER" ||
          modalData?.employeeType == "EMPLOYEE"
        )
          ? [
              {
                btnText: "Edit",
                buttonCss: "py-1.5 px-5",
                btnClick: handleEdit,
              },
            ]
          : []),
      ]}
    >
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm text-gray-700">
        {modalData?.employeeName && (
          <div>
            <span className="font-medium text-primary">Employee Name : </span>
            {modalData.employeeName}
          </div>
        )}
        {modalData?.departmentName && (
          <div>
            <span className="font-medium text-primary">Department Name : </span>
            {modalData.departmentName}
          </div>
        )}
        {modalData?.designationName && (
          <div>
            <span className="font-medium text-primary">
              Designation Name :{" "}
            </span>
            {modalData.designationName}
          </div>
        )}
        {modalData?.employeeEmail && (
          <div>
            <span className="font-medium text-primary">Employee Email: </span>
            {modalData.employeeEmail}
          </div>
        )}
        {modalData?.employeeMobile && (
          <div>
            <span className="font-medium text-primary">Employee Mobile : </span>
            {modalData.employeeMobile}
          </div>
        )}
        {modalData?.employeeType && (
          <div>
            <span className="font-medium text-primary">Employee Type : </span>
            {capitalizeFirstLetter(modalData.employeeType)}
          </div>
        )}
      </div>
    </ModalData>
  );
};

export default ViewMeetingModal;
