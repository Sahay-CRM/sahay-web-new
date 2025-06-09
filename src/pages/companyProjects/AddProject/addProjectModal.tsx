import ModalData from "@/components/shared/Modal/ModalData";

interface MeetingModalProps {
  modalData: CompanyProjectDataProps;
  isModalOpen: boolean;
  modalClose: () => void;
  onSubmit: () => void;
}

const AddProjectModal: React.FC<MeetingModalProps> = ({
  modalData,
  isModalOpen,
  modalClose,
  onSubmit,
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
      modalTitle="Add Meeting"
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
            {modalData.projectDeadline}
          </div>
        )}
        {/* {modalData?.projectStatusId?.projectName && (
          <div>
            <span className="font-medium text-primary">Project Status: </span>
            {modalData.projectStatusId.projectName}
          </div>
        )}
        {modalData?.coreParameterId?.coreParameterName && (
          <div>
            <span className="font-medium text-primary">Core Parameter: </span>
            {modalData.coreParameterId.coreParameterName}
          </div>
        )} */}
        {subParameters && (
          <div>
            <span className="font-medium text-primary">Sub Parameter: </span>
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
