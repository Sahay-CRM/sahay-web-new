import ModalData from "@/components/shared/Modal/ModalData";
import { getUserPermission } from "@/features/selectors/auth.selector";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

interface ViewMeetingModalProps {
  modalData: MeetingData;
  isModalOpen: boolean;
  modalClose: () => void;
}
const ViewMeetingModal: React.FC<ViewMeetingModalProps> = ({
  modalData,
  isModalOpen,
  modalClose,
}) => {
  const joiners =
    Array.isArray(modalData?.joiners) && modalData.joiners.length > 0
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        modalData.joiners.map((j: any) => j.employeeName).join(", ")
      : modalData?.joinerNames || "";
  const navigate = useNavigate();
  const permission = useSelector(getUserPermission).MEETING_LIST;

  // Edit handler
  const handleEdit = () => {
    if (modalData?.meetingId) {
      navigate(`/dashboard/meeting/edit/${modalData.meetingId}`);
    }
  };

  return (
    <ModalData
      isModalOpen={isModalOpen}
      modalTitle="Meeting Details"
      modalClose={modalClose}
      buttons={[
        {
          btnText: "Close",
          buttonCss: "py-1.5 px-5",
          btnClick: modalClose,
        },
        ...(permission.Edit
          ? [
              {
                btnText: "Edit",
                buttonCss: "py-1.5 px-5",
                btnClick: handleEdit,
              },
            ]
          : []),
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
        {modalData?.meetingStatus && (
          <div>
            <span className="font-medium text-primary">Meeting Status: </span>
            {typeof modalData.meetingStatus === "string"
              ? modalData.meetingStatus
              : String(modalData.meetingStatus)}
          </div>
        )}
        {modalData?.meetingTypeName && (
          <div>
            <span className="font-medium text-primary">Meeting Type: </span>
            {modalData.meetingTypeName}
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

export default ViewMeetingModal;
