import ModalData from "@/components/shared/Modal/ModalData";

interface MeetingModalProps {
  isModalOpen: boolean;
  modalClose: () => void;
  isLoading?: boolean;
  isChildData?: string | undefined;
  onKeepAll?: () => void;
  onDeleteAll?: () => void;
}

const AddRepeatMeetingModal: React.FC<MeetingModalProps> = ({
  isModalOpen,
  modalClose,
  isChildData,
  onKeepAll,
  onDeleteAll,
}) => {
  return (
    <ModalData
      isModalOpen={isModalOpen}
      modalTitle={"Stop Repeat Meeting"}
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
                btnText: "Keep All",
                buttonCss: "py-1.5 px-5",
                btnClick: onKeepAll ?? (() => {}),
              },
              {
                btnText: "Delete All",
                buttonCss: "py-1.5 px-5",
                btnClick: onDeleteAll ?? (() => {}),
              },
            ]
          : []),
      ]}
    >
      <div>
        {isChildData && (
          <div className="border-t mt-2 pt-2">
            <span className="font-bold text-black">{isChildData}</span>
          </div>
        )}
      </div>
    </ModalData>
  );
};

export default AddRepeatMeetingModal;
