import ModalData from "@/components/shared/Modal/ModalData";

interface DeleteModalProps {
  modalData: TaskGetPaging | null;
  title: string;
  isModalOpen: boolean;
  modalClose: () => void;
  onSubmit: (additionalKey?: string) => void;
  isChildData?: string;
  onForceSubmit?: () => void;
  showDeleteOptions?: boolean;
  isForceDelete?: boolean;
}

const ConfirmationDeleteModal: React.FC<DeleteModalProps> = ({
  title,
  modalData,
  isModalOpen,
  modalClose,
  onSubmit,
  isChildData,
}) => {
  return (
    <div>
      <ModalData
        isModalOpen={isModalOpen}
        modalTitle={title}
        modalClose={modalClose}
        buttons={[
          {
            btnText: "Cancel",
            buttonCss: "py-1.5 px-5",
            btnClick: modalClose,
          },

          ...(isChildData
            ? [
                {
                  btnText: "Update All",
                  buttonCss: "py-1.5 px-5",
                  btnClick: () => onSubmit("KEEP_ALL"),
                },
                {
                  btnText: "Delete All",
                  buttonCss: "py-1.5 px-5",
                  btnClick: () => onSubmit("DELETE_ALL"),
                },
              ]
            : [
                {
                  btnText: "Submit",
                  buttonCss: "py-1.5 px-5",
                  btnClick: () => onSubmit(),
                },
              ]),
        ]}
      >
        <div className="space-y-4 text-sm">
          {/* Main KPI details */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm text-gray-700">
            {modalData?.taskName && (
              <div>
                <span className="font-medium text-primary">
                  Repetitive Task Name :{" "}
                </span>
                {modalData.taskName}
              </div>
            )}

            {modalData?.taskDescription && (
              <div>
                <span className="font-medium text-primary">Description : </span>
                {modalData.taskDescription}
              </div>
            )}

            {modalData?.taskTypeName && (
              <div>
                <span className="font-medium text-primary">Task Type : </span>
                {modalData.taskTypeName}
              </div>
            )}

            {modalData?.nextDate && (
              <div>
                <span className="font-medium text-primary">Next Date : </span>
                {modalData.nextDate}
              </div>
            )}

            {modalData?.employeeName && (
              <div>
                <span className="font-medium text-primary">Assignee : </span>
                {modalData.employeeName}
              </div>
            )}

            {modalData?.isActive !== undefined && (
              <div>
                <span className="font-medium text-primary">Active : </span>
                {modalData.isActive ? "Yes" : "No"}
              </div>
            )}
          </div>

          {/* Child Data Section */}
          {isChildData && (
            <div className="border-t pt-2">
              <span className="font-bold text-black">{isChildData}</span>
            </div>
          )}
        </div>
      </ModalData>
    </div>
  );
};

export default ConfirmationDeleteModal;
