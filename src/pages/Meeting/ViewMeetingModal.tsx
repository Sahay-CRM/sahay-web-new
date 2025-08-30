import ModalData from "@/components/shared/Modal/ModalData";
import { getUserPermission } from "@/features/selectors/auth.selector";
import { ImageBaseURL } from "@/features/utils/urls.utils";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

interface ViewMeetingModalProps {
  modalData: CompanyMeetingDataProps;
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
      ? (modalData.joiners as Joiners[]).map((j) => j.employeeName).join(", ")
      : "";

  const files = modalData?.files ?? [];

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
      <div>
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
          {modalData?.meetingType?.meetingTypeName && (
            <div>
              <span className="font-medium text-primary">Meeting Type: </span>
              {modalData?.meetingType?.meetingTypeName}
            </div>
          )}
          {joiners && (
            <div className="col-span-2">
              <span className="font-medium text-primary">Joiners: </span>
              {joiners}
            </div>
          )}
        </div>
        {files.length > 0 && (
          <div className="mt-3 w-full flex gap-2">
            {files.map((file, idx) => (
              <div key={idx}>
                <a
                  href={`${ImageBaseURL}/share/mDocs/${file.fileName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-sm cursor-pointer"
                >
                  {file.fileName}
                </a>
                {idx < files.length - 1 && ","}
              </div>
            ))}
          </div>
        )}
      </div>
    </ModalData>
  );
};

export default ViewMeetingModal;
