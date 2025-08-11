import ModalData from "@/components/shared/Modal/ModalData";

interface CreateTaskPayload {
  taskId?: string;
  repetitiveTaskId?: string;
  project?: {
    projectId: string;
    projectName: string;
    // other fields
  };
  taskName?: string;
  taskDescription?: string;
  repeatType?: string;

  meeting?: {
    meetingName?: string;
  } | null;
  assignUser?: Employee[];
  taskStatusId?: string;
  taskTypeId?: string;
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
      modalTitle={
        modalData?.repetitiveTaskId
          ? "Update Repetition Task"
          : "Add Repetition Task"
      }
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
          <span className="font-medium text-primary">Task Name:</span>{" "}
          {modalData.taskName || "-"}
        </div>

        <div>
          <span className="font-medium text-primary">Description:</span>{" "}
          {modalData.taskDescription || "-"}
        </div>

        <div>
          <span className="font-medium text-primary">Meeting Name:</span>{" "}
          {modalData.meeting?.meetingName || "-"}
        </div>

        <div>
          <span className="font-medium text-primary">Project Name:</span>{" "}
          {modalData.project?.projectName || "-"}
        </div>

        {/* <div>
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
        </div> */}

        <div>
          <span className="font-medium text-primary">Repeat Type:</span>{" "}
          {modalData.repeatType || "-"}
        </div>

        {/* <div>
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
        </div> */}

        <div className="col-span-2">
          <span className="font-medium text-primary">Assigned Users:</span>{" "}
          {modalData.assignUser && modalData.assignUser.length > 0
            ? modalData.assignUser
                .map((user: Employee) => user.employeeName)
                .join(", ")
            : "-"}
        </div>

        {modalData.comment ? (
          <div className="col-span-2">
            <span className="font-medium text-primary">Comment:</span>{" "}
            {modalData.comment}
          </div>
        ) : null}
      </div>
    </ModalData>
  );
};

export default AddDatapointModal;
