import ModalData from "@/components/shared/Modal/ModalData";
import { useNavigate } from "react-router-dom";

interface CompanyMeetingModalProps {
  modalData: MeetingData;
  isModalOpen: boolean;
  modalClose: () => void;
}

export default function ConfirmationMeetingModal({
  modalData,
  isModalOpen,
  modalClose,
}: CompanyMeetingModalProps) {
  const navigate = useNavigate();

  return (
    <div>
      <ModalData
        isModalOpen={isModalOpen}
        modalTitle="Meeting Details"
        modalClose={modalClose}
        buttons={[
          {
            btnText: "Cancel",
            buttonCss: "py-1.5 px-5",
            btnClick: modalClose,
          },
          {
            btnText: "Edit",
            buttonCss: "py-1.5 px-5",
            btnClick: () =>
              navigate(`/dashboard/meeting/edit/${modalData.meetingId}`),
          },
        ]}
      >
        <div>
          {Object.entries(modalData)
            .filter(
              ([key]) =>
                ![
                  "srNo",
                  "meetingId",
                  "companyId",
                  "createdBy",
                  "meetingTypeId",
                  "meetingStatusId",
                  "color",
                ].includes(key),
            )
            .map(([key, value]) => (
              <div key={key} className="mb-2">
                <span className="font-semibold">{key}:</span>{" "}
                <span>
                  {key === "joiners" && Array.isArray(value)
                    ? (
                        value as unknown as {
                          employeeId: string;
                          employeeName: string;
                        }[]
                      )
                        .map((j) => j.employeeName)
                        .join(", ")
                    : key === "meetingDateTime" && typeof value === "string"
                      ? new Date(value).toLocaleString()
                      : typeof value === "object" && value !== null
                        ? JSON.stringify(value)
                        : String(value)}
                </span>
              </div>
            ))}
        </div>
      </ModalData>
    </div>
  );
}
