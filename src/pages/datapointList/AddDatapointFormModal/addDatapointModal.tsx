import ModalData from "@/components/shared/Modal/ModalData";

interface KPIFormDataProp {
  KPIName?: string;
  KPIMasterId?: DatapointListData;
  frequencyId?: string | { frequencyName: string };
  validationTypeId?:
    | string
    | { validationTypeId: string; validationTypeName: string };
  unit?: string;
  coreParameterId?: CoreParameter;
  productId?: ProductData;
  employeeId?: EmployeeData;
  [key: `goalValue1_${string}`]: string | number | undefined;
  [key: `goalValue2_${string}`]: string | number | undefined;
}

interface DatapointModalProps {
  modalData: KPIFormDataProp;
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
  const isYesNo =
    typeof modalData?.validationTypeId === "object" &&
    (modalData?.validationTypeId?.validationTypeName === "YES_NO" ||
      modalData?.validationTypeId?.validationTypeId === "7");

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
            <span className="font-medium text-primary">KPI Name : </span>
            {modalData?.KPIMasterId?.KPIName || modalData?.KPIName || "-"}
          </div>

          <div>
            <span className="font-medium text-primary">Frequency : </span>
            {typeof modalData?.frequencyId === "string"
              ? modalData.frequencyId
              : modalData?.frequencyId?.frequencyName || "-"}
          </div>
          <div>
            <span className="font-medium text-primary">Unit Type : </span>
            {typeof modalData?.unit === "string"
              ? modalData.unit
              : modalData?.unit || "-"}
          </div>

          <div>
            <span className="font-medium text-primary">Validation Type : </span>
            {typeof modalData?.validationTypeId === "string"
              ? modalData.validationTypeId
              : modalData?.validationTypeId?.validationTypeName || "-"}
          </div>

          {modalData.coreParameterId?.coreParameterName && (
            <div>
              <span className="font-medium text-primary">
                Core Parameter :{" "}
              </span>
              {modalData.coreParameterId.coreParameterName}
            </div>
          )}

          {Array.isArray(modalData.productId) &&
            modalData.productId.length > 0 && (
              <div className="col-span-2">
                <span className="font-medium text-primary">Products : </span>
                {modalData.productId.map((p) => p.productName).join(", ")}
              </div>
            )}

          <div className="col-span-2">
            <span className="font-medium text-primary">Assigned Users : </span>
            {Array.isArray(modalData.employeeId)
              ? modalData.employeeId
                  .map((user) => user?.employeeName)
                  .filter(Boolean)
                  .join(", ")
              : "-"}
          </div>

          <div className="col-span-2">
            <span className="font-medium text-primary">Goal Values :</span>
            <div className="mt-2 space-y-2">
              {Array.isArray(modalData.employeeId) &&
                modalData.employeeId.map((employee) => {
                  const empId = employee.employeeId;
                  const goal1 = modalData[`goalValue1_${empId}`] ?? "-";
                  const goal2 = modalData[`goalValue2_${empId}`] ?? "-";

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
                      <div>
                        <span className="font-medium text-primary">
                          Goal Value 1:{" "}
                        </span>
                        {isYesNo ? yesNoValue : goal1}
                      </div>
                      {!isYesNo && (
                        <div>
                          <span className="font-medium text-primary">
                            Goal Value 2:{" "}
                          </span>
                          {goal2}
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
