import ModalData from "@/components/shared/Modal/ModalData";

interface MeetingModalProps {
  modalData: MeetingData; // Use the correct type if available, e.g., CompanyMeetingDataProps
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
  console.log(modalData, "<=====");

  return (
    <div>
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
        <div>
          <div>
            <span>Meeting Name: {modalData?.meetingName || "-"}</span>
          </div>
          <div>
            <span>
              Meeting Description: {modalData?.meetingDescription || "-"}
            </span>
          </div>
          <div>
            <span>
              Meeting Date & Time: {modalData?.meetingDateTime || "-"}
            </span>
          </div>
          <div>
            <span>
              Meeting Status: {modalData?.meetingStatusId?.meetingStatus || "-"}
            </span>
          </div>
          <div>
            <span>
              Meeting Type: {modalData?.meetingTypeId?.meetingTypeName || "-"}
            </span>
          </div>
          <div>
            <span>
              Joiners:
              {modalData.employeeId
                .map((joiner) => joiner?.employeeName)
                .filter(Boolean)
                .join(", ")}
            </span>
          </div>
        </div>
      </ModalData>
    </div>
  );
};

export default AddMeetingModal;
