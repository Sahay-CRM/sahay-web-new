import ModalData from "@/components/shared/Modal/ModalData";

interface ProjectModalProps {
  modalData: IProjectFormData;
  isModalOpen: boolean;
  modalClose: () => void;
  onSubmit: () => void;
  isChildData?: string | undefined;
}

const ConformationDeleteModal: React.FC<ProjectModalProps> = ({
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
        modalTitle="Delete Project"
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
          <div className="grid grid-cols-2">
            <div>
              <span className="font-semibold">Project Name:</span>{" "}
              <span>{modalData.projectName}</span>
            </div>
            <div>
              <span className="font-semibold">Project Description:</span>{" "}
              <span>{modalData.projectDescription}</span>
            </div>
            <div>
              <span className="font-semibold">Project Deadline:</span>{" "}
              <span>{modalData.projectDeadline}</span>
            </div>
          </div>
          {isChildData && (
            <div className="border-t mt-2 pt-2">
              <span className="font-bold text-black">{isChildData}</span>
            </div>
          )}
        </div>
      </ModalData>
    </div>
  );
};

export default ConformationDeleteModal;
