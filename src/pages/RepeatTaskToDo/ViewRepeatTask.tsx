import ModalData from "@/components/shared/Modal/ModalData";
import { convertToLocalTime } from "@/features/utils/app.utils";

interface ViewRepeatTaskProps {
  modalData: RepeatTaskAllRes | null;
  isModalOpen: boolean;
  modalClose: () => void;
}
export default function ViewRepeatTask({
  modalData,
  isModalOpen,
  modalClose,
}: ViewRepeatTaskProps) {
  return (
    <ModalData
      isModalOpen={isModalOpen}
      modalTitle="Task Details"
      modalClose={modalClose}
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

        {modalData?.taskDeadline && (
          <div>
            <span className="font-medium text-primary">Task Deadline: </span>
            {convertToLocalTime(modalData.taskDeadline)}
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
        {modalData?.TaskEmployeeJunction && (
          <div>
            <span className="font-medium text-primary">Assignees: </span>
            {modalData.TaskEmployeeJunction.map((item) => item.employeeName)}
          </div>
        )}
      </div>
    </ModalData>
  );
}
