import ModalData from "@/components/shared/Modal/ModalData";
interface KPIFormDataProp {
  KPIName?: string;
  KPIMasterId?: {
    KPIName?: string;
  };
  KPIMaster?: {
    KPIName?: string;
    KPILabel?: string;
  };
  KPIMasterId?: string;
  dataPointName?: string;
  dataPointLabel?: string;
  frequencyId?: {
    frequencyName?: string;
  };
  validationTypeId?: {
    validationTypeId?: string;
    validationTypeName?: string;
  };
  employeeId?: {
    employeeId: string | number;
    employeeName: string;
  }[];
  // Dynamic keys for goal values
  [key: `goalValue1_${string}`]: string | number | undefined;
  [key: `goalValue2_${string}`]: string | number | undefined;
}

interface DatapointModalProps {
  modalData: KPIFormDataProp; // Use the correct type if available, e.g., CompanyMeetingDataProps
  isModalOpen: boolean;
  modalClose: () => void;
  onSubmit: () => void;
}
const AddDatapointModal: React.FC<DatapointModalProps> = ({
  modalData,
  isModalOpen,
  modalClose,
  onSubmit,
}) => {
  console.log(modalData);

  // Helper to check if validation type is YES_NO
  const isYesNo =
    modalData?.validationTypeId?.validationTypeName === "YES_NO" ||
    modalData?.validationTypeId?.validationTypeId === "7";

  return (
    <div>
      <ModalData
        isModalOpen={isModalOpen}
        modalTitle={modalData?.KPIName ? "Update Datapoint" : "Add Datapoint"}
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
          <div>
            <span className="font-medium text-primary">KPI Name: </span>
            {modalData?.KPIMasterId?.KPIName || modalData?.KPIName || "-"}
          </div>

          <div>
            <span className="font-medium text-primary"></span>
            Frequency: {modalData?.frequencyId?.frequencyName || "-"}
          </div>
          <div>
            <span className="font-medium text-primary">Validation Type: </span>
            {modalData?.validationTypeId?.validationTypeName || "-"}
          </div>
          <div>
            <span className="font-medium text-primary">
              Assigned Users : <br />
            </span>
            {Array.isArray(modalData.employeeId)
              ? modalData.employeeId
                  .map((user) => user?.employeeName)
                  .filter(Boolean)
                  .join(", ")
              : "-"}
          </div>
          <div>
            <span className="font-medium text-primary">Goal Values:</span>
            <div className="mt-2 space-y-2">
              {Array.isArray(modalData.employeeId) &&
                modalData.employeeId.map((employee) => {
                  const empId = employee.employeeId;
                  const goal1 = modalData[`goalValue1_${empId}`] || "-";
                  const goal2 = modalData[`goalValue2_${empId}`] || "-";
                  // For YES_NO, show Yes/No instead of 1/0
                  const yesNoValue =
                    isYesNo && (goal1 === "1" || goal1 === 1)
                      ? "Yes"
                      : isYesNo && (goal1 === "0" || goal1 === 0)
                        ? "No"
                        : goal1;

                  return (
                    <div key={empId} className="pl-2 border-l border-gray-300">
                      <div>
                        <strong>{employee.employeeName}</strong>
                      </div>
                      <div className="font-medium text-primary">
                        Goal Value 1: {isYesNo ? yesNoValue : goal1}
                      </div>
                      {!isYesNo && (
                        <div className="font-medium text-primary">
                          Goal Value 2: {goal2}{" "}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </ModalData>
    </div>
  );
};

export default AddDatapointModal;
