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

  return (
    <div>
      <ModalData
        isModalOpen={isModalOpen}
        modalTitle="Task Details"
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
              navigate(`/dashboard/tasks/edit/${modalData.taskId}`),
          },
        ]}
      >
        <div>
          {/* Task Name */}
          {modalData.taskName && (
            <div>
              <span className="font-semibold">Task Name:</span>{" "}
              <span>{modalData.taskName}</span>
            </div>
          )}

          {/* Task Status */}
          {modalData.taskStatus && (
            <div>
              <span className="font-semibold">Task Status:</span>{" "}
              <span>{modalData.taskStatus}</span>
            </div>
          )}

          {/* Task Description */}
          {modalData.taskDescription && (
            <div>
              <span className="font-semibold">Task Description:</span>{" "}
              <span>{modalData.taskDescription}</span>
            </div>
          )}

          {/* Task Deadline */}
          {modalData.taskDeadline && (
            <div>
              <span className="font-semibold">Task Deadline:</span>{" "}
              <span>{new Date(modalData.taskDeadline).toLocaleString()}</span>
            </div>
          )}

          {/* Employee Name */}
          {modalData.employees && (
            <div>
              <span className="font-semibold">Employee Name:</span>{" "}
              <span>{modalData.employees?.employeeName}</span>
            </div>
          )}

          {/* Employee Email */}
          {modalData.employees?.employeeEmail && (
            <div>
              <span className="font-semibold">Employee Email:</span>{" "}
              <span>{modalData.employees?.employeeEmail}</span>
            </div>
          )}

          {/* Project Name */}
          {modalData.projectDetails && (
            <div>
              <span className="font-semibold">Project Name:</span>{" "}
              <span>
                {modalData.projectDetails?.CompanyProjectMaster?.projectName}
              </span>
            </div>
          )}

          {/* Task Employees */}
          {modalData.TaskEmployeeJunction &&
            modalData.TaskEmployeeJunction.length > 0 && (
              <div>
                <span className="font-semibold">Task Employees:</span>
                <ul className="ml-4 list-disc">
                  {modalData.TaskEmployeeJunction.map((emp, idx) => (
                    <li key={idx}>
                      {emp.Employee?.employeeName || emp.employeeId}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {/* Task Meetings */}
          {modalData.TaskMeetingJunction &&
            modalData.TaskMeetingJunction.length > 0 && (
              <div>
                <span className="font-semibold">Meetings:</span>
                <ul className="ml-4 list-disc">
                  {modalData.TaskMeetingJunction.map((meet, idx) => (
                    <li key={idx}>
                      {meet.meetings?.meetingName && (
                        <span>
                          {meet.meetings.meetingName}
                          {meet.meetings.meetingDateTime && (
                            <span className="ml-2 text-xs text-gray-500">
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
                </ul>
              </div>
            )}
        </div>
      </ModalData>
    </div>
  );
}
