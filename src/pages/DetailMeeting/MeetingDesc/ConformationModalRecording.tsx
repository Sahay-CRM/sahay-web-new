import ModalData from "@/components/shared/Modal/ModalData";

interface ConformationModalRecordingProps {
  isModalOpen: boolean;
  modalClose: () => void;
  onSelectType: (type: string) => void;
}
export default function ConformationModalRecording({
  isModalOpen,
  modalClose,
  onSelectType,
}: ConformationModalRecordingProps) {
  const handleAction = (type: string) => {
    onSelectType(type); // send selected button
    modalClose(); // close modal
  };

  return (
    <ModalData
      isModalOpen={isModalOpen}
      modalTitle="Task Details"
      modalClose={modalClose}
      buttons={[
        {
          btnText: "Cancel",
          btnClick: modalClose,
          buttonCss: "bg-gray-100 text-black hover:bg-gray-200",
        },
        {
          btnText: "Delete",
          btnClick: () => handleAction("DELETE"),
          buttonCss: "bg-red-500 text-white hover:bg-red-600",
        },
        {
          btnText: "Create New",
          btnClick: () => handleAction("CREATE_NEW"),
          buttonCss: "bg-blue-500 text-white hover:bg-blue-600",
        },
      ]}
    >
      <div className="text-sm text-gray-700">
        Are you sure you want to delete the old recording?
      </div>
    </ModalData>
  );
}
