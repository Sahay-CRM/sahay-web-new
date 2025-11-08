import ModalData from "@/components/shared/Modal/ModalData";

export interface MeetingType {
  meetingTypeId: string;
  meetingTypeName: string;
}

export interface MeetingData {
  meetingName?: string;
  meetingDescription?: string;
  meetingTypeId?: MeetingType;
  repeatType?: string;
  repeatTime?: string;
  employeeId?: Employee[];
  repetitiveMeetingId?: string;
}

interface MeetingModalProps {
  modalData: MeetingData;
  isModalOpen: boolean;
  modalClose: () => void;
  onSubmit: () => void;
  isLoading?: boolean;
  isChildData?: string | undefined;
  onKeepAll?: () => void;
  onDeleteAll?: () => void;
}

const AddRepeatMeetingModal: React.FC<MeetingModalProps> = ({
  modalData,
  isModalOpen,
  modalClose,
  onSubmit,
  isLoading,
  isChildData,
  onKeepAll,
  onDeleteAll,
}) => {
  return (
    <ModalData
      isModalOpen={isModalOpen}
      modalTitle={
        modalData.repetitiveMeetingId
          ? "Update Repetitive Meeting"
          : "Add Repeat Meeting"
      }
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
                btnClick: onKeepAll ?? (() => {}),
              },
              {
                btnText: "Delete All",
                buttonCss: "py-1.5 px-5",
                btnClick: onDeleteAll ?? (() => {}),
              },
            ]
          : [
              {
                btnText: "Submit",
                buttonCss: "py-1.5 px-5",
                btnClick: onSubmit,
                isLoading: isLoading,
              },
            ]),
      ]}
    >
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm text-gray-700">
        {/* Meeting Name */}
        {modalData?.meetingName && (
          <div>
            <span className="font-medium text-primary">Meeting Name: </span>
            {modalData.meetingName}
          </div>
        )}

        {/* Description */}
        {modalData?.meetingDescription && (
          <div>
            <span className="font-medium text-primary">Description: </span>
            {modalData.meetingDescription}
          </div>
        )}

        {/* Meeting Type */}
        {modalData?.meetingTypeId && (
          <div>
            <span className="font-medium text-primary">Meeting Type: </span>
            {modalData.meetingTypeId.meetingTypeName}
          </div>
        )}

        {/* Repeat Type */}
        {modalData?.repeatType && (
          <div>
            <span className="font-medium text-primary">Repeat Type: </span>
            {modalData.repeatType}
          </div>
        )}

        {/* Repeat Time */}
        {modalData?.repeatTime && (
          <div>
            <span className="font-medium text-primary">Repeat Time: </span>
            {modalData.repeatTime}
          </div>
        )}

        {/* Employee List */}
        {Array.isArray(modalData?.employeeId) &&
          modalData.employeeId.length > 0 && (
            <div className="col-span-2 space-y-2">
              {(() => {
                const teamLeaders = modalData.employeeId.filter(
                  (emp) => emp.isTeamLeader,
                );
                const otherJoiners = modalData.employeeId.filter(
                  (emp) => !emp.isTeamLeader,
                );

                return (
                  <>
                    {/* Team Leaders */}
                    {teamLeaders.length > 0 && (
                      <div>
                        <span className="font-medium text-primary">
                          Team Leader{teamLeaders.length > 1 ? "s" : " "}:{" "}
                        </span>
                        <span className=" font-medium">
                          {teamLeaders
                            .map((emp) => emp.employeeName)
                            .join(", ")}
                        </span>
                      </div>
                    )}

                    {/* Joiners */}
                    {otherJoiners.length > 0 && (
                      <div>
                        <span className="font-medium text-primary">
                          Joiner{otherJoiners.length > 1 ? "s" : ""}:{" "}
                        </span>
                        <span>
                          {otherJoiners
                            .map((emp) => emp.employeeName)
                            .join(", ")}
                        </span>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
      </div>

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
