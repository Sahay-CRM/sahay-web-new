import ModalData from "@/components/shared/Modal/ModalData";

interface MeetingModalProps {
  modalData: MeetingData;
  isModalOpen: boolean;
  modalClose: () => void;
  onSubmit: () => void;
}

const AddMeetingModal: React.FC<MeetingModalProps> = ({
  modalData,
  isModalOpen,
  modalClose,
  onSubmit,
}) => {
  const joiners = modalData?.employeeId
    ?.map((joiner) => joiner?.employeeName)
    .filter(Boolean)
    .join(", ");

  return (
    <ModalData
      isModalOpen={isModalOpen}
      modalTitle="Add Meeting"
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
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm text-gray-700">
        {modalData?.meetingName && (
          <div>
            <span className="font-medium text-primary">Meeting Name: </span>
            {modalData.meetingName}
          </div>
        )}
        {modalData?.meetingDescription && (
          <div>
            <span className="font-medium text-primary">
              Meeting Description:{" "}
            </span>
            {modalData.meetingDescription}
          </div>
        )}
        {modalData?.meetingDateTime && (
          <div>
            <span className="font-medium text-primary">
              Meeting Date & Time:{" "}
            </span>
            {modalData.meetingDateTime}
          </div>
        )}
        {modalData?.meetingStatusId?.meetingStatus && (
          <div>
            <span className="font-medium text-primary">Meeting Status: </span>
            {modalData.meetingStatusId.meetingStatus}
          </div>
        )}
        {modalData?.meetingTypeId?.meetingTypeName && (
          <div>
            <span className="font-medium text-primary">Meeting Type: </span>
            {modalData.meetingTypeId.meetingTypeName}
          </div>
        )}
        {joiners && (
          <div className="col-span-2">
            <span className="font-medium text-primary">Joiners: </span>
            {joiners}
          </div>
        )}
      </div>
    </ModalData>
  );
};

export default AddMeetingModal;
