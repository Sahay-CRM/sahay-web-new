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
  const permission = useSelector(getUserPermission).PROJECT_LIST;

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

  // Prepare comma-separated project parameters
  const projectParameters = modalData?.ProjectSubParameterJunction?.map(
    (item) =>
      `${item.subPara?.coreParameter?.coreParameterName} | ${item.subPara?.subParameterName}`,
  ).join(", ");

  // Prepare comma-separated employees
  const projectEmployees = modalData?.ProjectEmployees
    ? modalData.ProjectEmployees.map((emp) => emp.employeeName).join(", ")
    : modalData?.employeeIds?.join(", ");

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
        {/* Project Name */}
        {modalData?.projectName && (
          <div>
            <span className="font-medium text-primary">Project Name: </span>
            {modalData.projectName}
          </div>
        )}

        {/* Project Description */}
        {modalData?.projectDescription && (
          <div>
            <span className="font-medium text-primary">
              Project Description:{" "}
            </span>
            {modalData.projectDescription}
          </div>
        )}

        {/* Project Deadline */}
        {modalData?.projectDeadline && (
          <div>
            <span className="font-medium text-primary">Project Deadline: </span>
            {modalData.projectDeadline}
          </div>
        )}

        {/* Project Status */}
        {modalData?.projectStatusId && (
          <div>
            <span className="font-medium text-primary">Project Status: </span>
            {typeof modalData.projectStatus === "object"
              ? modalData.projectStatus?.projectStatus
              : modalData.projectStatusId}
          </div>
        )}

        {/* Project Employees */}
        {projectEmployees && (
          <div className="col-span-2">
            <span className="font-medium text-primary">
              Project Employees:{" "}
            </span>
            <span className="text-gray-700">{projectEmployees}</span>
          </div>
        )}

        {/* Project Parameters */}
        {projectParameters && (
          <div className="col-span-2">
            <span className="font-medium text-primary">
              Project Parameters:{" "}
            </span>
            <span className="text-gray-700">{projectParameters}</span>
          </div>
        )}
      </div>
    </ModalData>
  );
};

export default ViewMeetingModal;
