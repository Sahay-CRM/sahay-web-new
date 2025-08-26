import ModalData from "@/components/shared/Modal/ModalData";
import { format } from "date-fns";

interface MeetingModalProps {
  modalData: MeetingData;
  isModalOpen: boolean;
  modalClose: () => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

const AddRepeatMeetingModal: React.FC<MeetingModalProps> = ({
  modalData,
  isModalOpen,
  modalClose,
  onSubmit,
  isLoading,
}) => {
  // const joinersArr = Array.isArray(modalData?.joiners)
  //   ? (modalData.joiners.flat?.() ?? modalData.joiners)
  //   : [];

  // const joiners = joinersArr
  //   ?.filter((joiner) => !Array.isArray(joiner))
  //   .map((joiner) => joiner?.employeeName);

  return (
    <ModalData
      isModalOpen={isModalOpen}
      modalTitle={modalData.meetingId ? "Update Meeting" : "Add Meeting"}
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
            {format(new Date(modalData.meetingDateTime), "dd/MM/yyyy h:mm aa")}
          </div>
        )}
        {modalData?.meetingStatus && (
          <div>
            <span className="font-medium text-primary">Meeting Status: </span>
            {typeof modalData.meetingStatus === "object"
              ? modalData.meetingStatus.meetingStatus
              : modalData.meetingStatus}
          </div>
        )}
        {modalData?.meetingTypeName && (
          <div>
            <span className="font-medium text-primary">Meeting Type: </span>
            {modalData.meetingTypeName}
          </div>
        )}
        {/* {modalData.joiners && (
          <div className="col-span-2">
            <span className="font-medium text-primary">Joiners: </span>
            {modalData.joiners.map((item) => item.employeeName)}
          </div>
        )} */}
      </div>
    </ModalData>
  );
};

export default AddRepeatMeetingModal;
