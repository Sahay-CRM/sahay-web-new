import ModalData from "@/components/shared/Modal/ModalData";
import { getUserPermission } from "@/features/selectors/auth.selector";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

interface ViewMeetingModalProps {
  modalData: TaskGetPaging;
  isModalOpen: boolean;
  modalClose: () => void;
}
const ViewMeetingModal: React.FC<ViewMeetingModalProps> = ({
  modalData,
  isModalOpen,
  modalClose,
}) => {
  const navigate = useNavigate();
  const permission = useSelector(getUserPermission).TASK;

  // Edit handler
  const handleEdit = () => {
    if (modalData?.taskId) {
      navigate(`/dashboard/tasks/edit/${modalData.taskId}`);
    }
  };
  const handleView = () => {
    if (modalData?.taskId) {
      navigate(`/dashboard/tasks/view/${modalData.taskId}`);
    }
  };

  return (
    <ModalData
      isModalOpen={isModalOpen}
      modalTitle="Task Details"
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
        {modalData?.taskName && (
          <div>
            <span className="font-medium text-primary">Task Name: </span>
            {modalData.taskName}
          </div>
        )}
        {modalData?.taskDescription && (
          <div>
            <span className="font-medium text-primary">Task Description: </span>
            {modalData.taskDescription}
          </div>
        )}
        {modalData?.taskStartDate && (
          <div>
            <span className="font-medium text-primary">Task Start Date: </span>
            {modalData.taskStartDate}
          </div>
        )}
        {modalData?.taskDeadline && (
          <div>
            <span className="font-medium text-primary">Task Deadline: </span>
            {modalData.taskDeadline}
          </div>
        )}

        {modalData?.taskStatus && (
          <div>
            <span className="font-medium text-primary">Task Status: </span>
            {modalData.taskStatus}
          </div>
        )}
        {modalData?.taskTypeName && (
          <div>
            <span className="font-medium text-primary">TaskType Name: </span>
            {modalData.taskTypeName}
          </div>
        )}
        {modalData?.assigneeNames && (
          <div>
            <span className="font-medium text-primary">Assignees: </span>
            {modalData.assigneeNames}
          </div>
        )}
      </div>
    </ModalData>
  );
};

export default ViewMeetingModal;
