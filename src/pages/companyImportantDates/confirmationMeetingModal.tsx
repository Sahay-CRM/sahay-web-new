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

  const labelMapping: Record<string, string> = {
    meetingName: "Meeting Name",
    meetingDescription: "Description",
    meetingDateTime: "Date & Time",
    endDate: "End Date",
    meetingStatus: "Status",
    joiners: "Participants",
    updatedBy: "Last Updated By",
    createdDatetime: "Created At",
    meetingDuration: "Duration",
    files: "Attachments",
    deadlineRequest: "Deadline Request",
  };

  const renderValue = (key: string, value: unknown) => {
    if (key === "joiners" && Array.isArray(value)) {
      return (value as { employeeName: string }[])
        .map((j) => j.employeeName)
        .join(", ");
    }
    if (
      key === "meetingDateTime" ||
      key === "endDate" ||
      key === "createdDatetime"
    ) {
      return value ? new Date(value as string).toLocaleString() : null;
    }
    if (key === "updatedBy") {
      if (typeof value === "string") {
        try {
          const parsed = JSON.parse(value);
          return parsed.employeeName || null;
        } catch {
          return value;
        }
      } else if (typeof value === "object" && value !== null) {
        return (value as { employeeName?: string })?.employeeName || null;
      }
    }
    if (key === "files" && Array.isArray(value)) {
      return value.length > 0 ? `${value.length} files` : null;
    }
    if (key === "meetingDuration") {
      if (typeof value === "string" && value.includes("days")) return value;
      return value !== undefined && value !== null ? `${value} days` : null;
    }
    if (typeof value === "object" && value !== null) {
      return JSON.stringify(value);
    }
    return value ? String(value) : null;
  };

  const displayKeys = Object.keys(labelMapping).filter((key) => {
    const value = modalData[key as keyof MeetingData];
    const rendered = renderValue(key, value);
    return (
      rendered !== null &&
      rendered !== undefined &&
      rendered !== "" &&
      rendered !== "-"
    );
  });

  return (
    <ModalData
      isModalOpen={isModalOpen}
      modalTitle="Meeting Details"
      modalClose={modalClose}
      buttons={[
        {
          btnText: "Cancel",
          buttonCss: "py-1.5 px-5 bg-gray-100 text-gray-700 hover:bg-gray-200",
          btnClick: modalClose,
        },
        {
          btnText: "Edit",
          buttonCss: "py-1.5 px-5 bg-[#2f328e] text-white hover:bg-[#1e205e]",
          btnClick: () =>
            navigate(`/dashboard/meeting/edit/${modalData.meetingId}`),
        },
      ]}
    >
      <div className="space-y-4 py-2">
        {displayKeys.map((key) => {
          const value = modalData[key as keyof MeetingData];
          return (
            <div
              key={key}
              className="flex flex-col border-b border-gray-50 pb-3 last:border-0"
            >
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                {labelMapping[key]}
              </span>
              <span className="text-sm font-medium text-slate-700">
                {renderValue(key, value)}
              </span>
            </div>
          );
        })}
      </div>
    </ModalData>
  );
}
