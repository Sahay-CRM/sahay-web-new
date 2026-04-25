import ModalData from "@/components/shared/Modal/ModalData";
import { useNavigate } from "react-router-dom";

interface CompanyTaskModalProps {
  modalData: TaskGetPaging;
  isModalOpen: boolean;
  modalClose: () => void;
}

export default function ConfirmationTaskModal({
  modalData,
  isModalOpen,
  modalClose,
}: CompanyTaskModalProps) {
  const navigate = useNavigate();

  const renderRow = (label: string, value: React.ReactNode) => {
    if (!value) return null;
    return (
      <div className="flex flex-col border-b border-gray-50 pb-3 last:border-0">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
          {label}
        </span>
        <span className="text-sm font-medium text-slate-700">{value}</span>
      </div>
    );
  };

  return (
    <ModalData
      isModalOpen={isModalOpen}
      modalTitle="Task Details"
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
          btnClick: () => navigate(`/dashboard/tasks/edit/${modalData.taskId}`),
        },
      ]}
    >
      <div className="space-y-4 py-2">
        {renderRow("Task Name", modalData.taskName)}
        {renderRow("Status", modalData.taskStatus)}
        {renderRow("Description", modalData.taskDescription)}
        {renderRow(
          "Deadline",
          modalData.taskDeadline
            ? new Date(modalData.taskDeadline).toLocaleString()
            : null,
        )}
        {renderRow("Assigned Employee", modalData.employees?.employeeName)}
        {renderRow("Employee Email", modalData.employees?.employeeEmail)}
        {renderRow(
          "Project Name",
          modalData.projectDetails?.CompanyProjectMaster?.projectName,
        )}

        {/* Task Employees */}
        {modalData.TaskEmployeeJunction &&
          modalData.TaskEmployeeJunction.length > 0 &&
          renderRow(
            "Task Employees",
            <ul className="list-disc list-inside space-y-0.5">
              {modalData.TaskEmployeeJunction.map((emp, idx) => (
                <li key={idx} className="text-sm">
                  {emp.Employee?.employeeName || emp.employeeId}
                </li>
              ))}
            </ul>,
          )}

        {/* Task Meetings */}
        {modalData.TaskMeetingJunction &&
          modalData.TaskMeetingJunction.length > 0 &&
          renderRow(
            "Meetings",
            <ul className="list-disc list-inside space-y-1">
              {modalData.TaskMeetingJunction.map((meet, idx) => (
                <li key={idx} className="text-sm">
                  {meet.meetings?.meetingName && (
                    <span>
                      {meet.meetings.meetingName}
                      {meet.meetings.meetingDateTime && (
                        <span className="ml-2 text-xs text-gray-500 font-normal">
                          (
                          {new Date(
                            meet.meetings.meetingDateTime,
                          ).toLocaleString()}
                          )
                        </span>
                      )}
                    </span>
                  )}
                </li>
              ))}
            </ul>,
          )}
      </div>
    </ModalData>
  );
}
