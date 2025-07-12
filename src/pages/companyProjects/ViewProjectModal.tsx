import ModalData from "@/components/shared/Modal/ModalData";
import { getUserPermission } from "@/features/selectors/auth.selector";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

interface ViewMeetingModalProps {
  modalData: IProjectFormData;
  isModalOpen: boolean;
  modalClose: () => void;
}
const ViewMeetingModal: React.FC<ViewMeetingModalProps> = ({
  modalData,
  isModalOpen,
  modalClose,
}) => {
  const navigate = useNavigate();
  const permission = useSelector(getUserPermission).MEETING_LIST;

  // Edit handler
  const handleEdit = () => {
    if (modalData?.projectId) {
      navigate(`/dashboard/projects/edit/${modalData.projectId}`);
    }
  };

  const handleView = () => {
    if (modalData?.projectId) {
      navigate(`/dashboard/projects/view/${modalData.projectId}`);
    }
  };

  return (
    <ModalData
      isModalOpen={isModalOpen}
      modalTitle="Project Details"
      modalClose={modalClose}
      buttons={[
        {
          btnText: "Close",
          buttonCss: "py-1.5 px-5",
          btnClick: modalClose,
        },
        ...(permission.Edit
          ? [
              {
                btnText: "Edit",
                buttonCss: "py-1.5 px-5",
                btnClick: handleEdit,
              },
            ]
          : []),

        {
          btnText: "View",
          buttonCss: "py-1.5 px-5",
          btnClick: handleView,
        },
      ]}
    >
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm text-gray-700">
        {modalData?.projectName && (
          <div>
            <span className="font-medium text-primary">Project Name: </span>
            {modalData.projectName}
          </div>
        )}
        {modalData?.projectDescription && (
          <div>
            <span className="font-medium text-primary">
              Project Description:{" "}
            </span>
            {modalData.projectDescription}
          </div>
        )}
        {modalData?.projectDeadline && (
          <div>
            <span className="font-medium text-primary">Project Deadline: </span>
            {modalData.projectDeadline}
          </div>
        )}
        {modalData?.projectStatus?.projectStatus && (
          <div>
            <span className="font-medium text-primary">Project Status: </span>
            {modalData.projectStatus.projectStatus}
          </div>
        )}

        {(modalData?.ProjectEmployees?.length ?? 0) > 0 && (
          <div className="col-span-2">
            <span className="font-medium text-primary">
              Project Employees:{" "}
            </span>
            <ul className="list-disc list-inside text-gray-700">
              {modalData.ProjectEmployees?.map((emp) => (
                <li key={emp.employeeId}>{emp.employeeName}</li>
              ))}
            </ul>
          </div>
        )}

        {(modalData?.ProjectSubParameterJunction?.length ?? 0) > 0 && (
          <div className="col-span-2">
            <span className="font-medium text-primary">
              Project Parameters:{" "}
            </span>
            <ul className="list-disc list-inside text-gray-700">
              {modalData.ProjectSubParameterJunction?.map((item) => (
                <li key={item.projectSubParameterId}>
                  <span className="font-medium">Business Function:</span>{" "}
                  {item.subPara?.coreParameter?.coreParameterName} |{" "}
                  <span className="font-medium">Key Result Area:</span>{" "}
                  {item.subPara?.subParameterName}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </ModalData>
  );
};

export default ViewMeetingModal;
