import ModalData from "@/components/shared/Modal/ModalData";

interface CreateTaskPayload {
  taskId?: string;
  project?: string;
  meeting?: string;
  taskName?: string;
  taskDescription?: string;
  taskStartDate: Date | null; // using Date object for date picker

  taskDeadline?: string | null;
  repeatType?: string;
  taskStatusId?: string;
  taskTypeId?: string;
  assignUser: string[];
  comment?: string;
}

interface DatapointModalProps {
  modalData: CreateTaskPayload;
  isModalOpen: boolean;
  modalClose: () => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

const AddDatapointModal: React.FC<DatapointModalProps> = ({
  modalData,
  isModalOpen,
  modalClose,
  onSubmit,
  isLoading,
}) => {
  return (
    <ModalData
      isModalOpen={isModalOpen}
      modalTitle={modalData?.taskId ? "Update Task" : "Add Task"}
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
        <div>
          <span className="font-medium text-gray-700">Task Name:</span>{" "}
          <span className="text-black font-bold">
            {modalData.taskName || "-"}
          </span>
        </div>

        <div>
          <span className="font-medium text-gray-700">Description:</span>{" "}
          <span className="text-black font-bold">
            {modalData.taskDescription || "-"}
          </span>
        </div>

        <div>
          <span className="font-medium text-gray-700">Meeting ID:</span>{" "}
          <span className="text-black font-bold">
            {modalData.meeting || "-"}
          </span>
        </div>

        <div>
          <span className="font-medium text-gray-700">Project ID:</span>{" "}
          <span className="text-black font-bold">
            {modalData.project || "-"}
          </span>
        </div>

        <div>
          <span className="font-medium text-gray-700">Start Date:</span>{" "}
          <span className="text-black font-bold">
            {modalData.taskStartDate
              ? new Date(modalData.taskStartDate).toLocaleString()
              : "-"}
          </span>
        </div>

        <div>
          <span className="font-medium text-gray-700">Deadline:</span>{" "}
          <span className="text-black font-bold">
            {modalData.taskDeadline
              ? new Date(modalData.taskDeadline).toLocaleString()
              : "-"}
          </span>
        </div>

        <div>
          <span className="font-medium text-gray-700">Repeat Type:</span>{" "}
          <span className="text-black font-bold">
            {modalData.repeatType || "-"}
          </span>
        </div>

        <div>
          <span className="font-medium text-gray-700">Task Status ID:</span>{" "}
          <span className="text-black font-bold">
            {modalData.taskStatusId || "-"}
          </span>
        </div>

        <div>
          <span className="font-medium text-gray-700">Task Type ID:</span>{" "}
          <span className="text-black font-bold">
            {modalData.taskTypeId || "-"}
          </span>
        </div>

        <div className="col-span-2">
          <span className="font-medium text-gray-700">Assigned Users:</span>{" "}
          <span className="text-black font-bold">
            {modalData.assignUser?.length > 0
              ? modalData.assignUser.join(", ")
              : "-"}
          </span>
        </div>

        {modalData.comment !== undefined && (
          <div className="col-span-2">
            <span className="font-medium text-gray-700">Comment:</span>{" "}
            <span className="text-black font-bold">
              {modalData.comment || "-"}
            </span>
          </div>
        )}
      </div>
    </ModalData>
  );
};

export default AddDatapointModal;
