import ModalData from "@/components/shared/Modal/ModalData";
import { convertToLocalDate } from "@/features/utils/app.utils";
import { useState } from "react";

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
  const MAX_DESC_LENGTH = 105;

  const [showFullDesc, setShowFullDesc] = useState(false);

  const isLongDesc =
    modalData?.projectDescription &&
    modalData.projectDescription.length > MAX_DESC_LENGTH;

  const displayedDesc =
    !isLongDesc || showFullDesc
      ? modalData?.projectDescription
      : modalData?.projectDescription?.substring(0, MAX_DESC_LENGTH) + "...";

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
      <div className="space-y-4 text-sm text-gray-700">
        {modalData?.projectName && (
          <div>
            <span className="font-medium text-primary">Project Name: </span>
            {modalData.projectName}
          </div>
        )}
        {/* Project Description */}
        {modalData?.projectDescription && (
          <div>
            <span className="font-medium text-primary">
              Project Description:{" "}
            </span>
            <span className="text-gray-700">
              {displayedDesc}{" "}
              {isLongDesc && (
                <button
                  onClick={() => setShowFullDesc(!showFullDesc)}
                  className="text-sm text-primary font-medium hover:underline ml-1"
                >
                  {showFullDesc ? "See Less" : "See More"}
                </button>
              )}
            </span>
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
