import ModalData from "../ModalData";

interface TeamModalProps {
  modalData: TeamData;
  isModalOpen: boolean;
  modalClose: () => void;
  onSubmit: () => void;
  isChildData?: string | undefined;
}

const ConfirmationDeleteModal: React.FC<TeamModalProps> = ({
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
        modalTitle="Team Delete"
        modalClose={modalClose}
        isCloseButton={true}
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
            <div>
              <span className="font-semibold">Team Name:</span>{" "}
              <span>{modalData.teamName}</span>
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

export default ConfirmationDeleteModal;
