import ModalData from "@/components/shared/Modal/ModalData";
import { convertToLocalDate } from "@/features/utils/app.utils";

interface MeetingModalProps {
  modalData: CompanyProjectDataProps;
  isModalOpen: boolean;
  modalClose: () => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

const AddProjectModal: React.FC<MeetingModalProps> = ({
  modalData,
  isModalOpen,
  modalClose,
  onSubmit,
  isLoading,
}) => {
  const employees =
    modalData?.ProjectEmployees?.map((emp) => emp?.employeeName)
      .filter(Boolean)
      .join(", ") || "";

  const subParameters =
    modalData?.ProjectParameters?.subParameters
      ?.map((sub) => sub?.subParameterName)
      .filter(Boolean)
      .join(", ") || "";

  return (
    <ModalData
      isModalOpen={isModalOpen}
      modalTitle={modalData.projectId ? "Update Project" : "Add Project"}
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
        {modalData?.projectName && (
          <div>
            <span className="font-medium text-primary">Project Name: </span>
            {modalData.projectName}
          </div>
        )}
        {modalData?.projectDescription && (
          <div>
            <span className="font-medium text-primary">
              Project Description:{" "}
            </span>
            {modalData.projectDescription}
          </div>
        )}
        {modalData?.projectDeadline && (
          <div>
            <span className="font-medium text-primary">Project Deadline: </span>
            {convertToLocalDate(modalData.projectDeadline)}
          </div>
        )}

        {subParameters && (
          <div>
            <span className="font-medium text-primary">Key Result Area: </span>
            {subParameters}
          </div>
        )}
        {employees && (
          <div className="col-span-2">
            <span className="font-medium text-primary">Employees: </span>
            {employees}
          </div>
        )}
      </div>
    </ModalData>
  );
};

export default AddProjectModal;
