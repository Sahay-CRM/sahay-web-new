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
            <span className="font-medium text-gray-700">KPI Name : </span>
            <span className="text-black font-bold">
              {modalData?.KPIMasterId?.KPIName || modalData?.KPIName || "-"}
            </span>
          </div>

          <div>
            <span className="font-medium text-gray-700">Frequency : </span>
            <span className="text-black font-bold">
              {typeof modalData?.frequencyId === "string"
                ? modalData.frequencyId
                : modalData?.frequencyId?.frequencyName || "-"}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Unit Type : </span>
            <span className="text-black font-bold">
              {typeof modalData?.unit === "string"
                ? modalData.unit
                : modalData?.unit || "-"}
            </span>
          </div>

          <div>
            <span className="font-medium text-gray-700">
              Validation Type :{" "}
            </span>
            <span className="text-black font-bold">
              {typeof modalData?.validationTypeId === "string"
                ? modalData.validationTypeId
                : modalData?.validationTypeId?.validationTypeName || "-"}
            </span>
          </div>

          {modalData.coreParameterId?.coreParameterName && (
            <div>
              <span className="font-medium text-gray-700">
                Core Parameter :{" "}
              </span>
              <span className="text-black font-bold">
                {modalData.coreParameterId.coreParameterName}
              </span>
            </div>
          )}

          {Array.isArray(modalData.productId) &&
            modalData.productId.length > 0 && (
              <div className="col-span-2">
                <span className="font-medium text-gray-700">Products : </span>
                <span className="text-black font-bold">
                  {modalData.productId.map((p) => p.productName).join(", ")}
                </span>
              </div>
            )}

          <div className="col-span-2">
            <span className="font-medium text-gray-700">Assigned Users : </span>
            <span className="text-black font-bold">
              {Array.isArray(modalData.employeeId)
                ? modalData.employeeId
                    .map((user) => user?.employeeName)
                    .filter(Boolean)
                    .join(", ")
                : "-"}
            </span>
          </div>

          <div className="col-span-2">
            <span className="font-medium text-gray-700">Goal Values :</span>
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
                        <strong className="text-black font-bold">
                          {employee.employeeName}
                        </strong>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Goal Value 1:{" "}
                        </span>
                        <span className="text-black font-bold">
                          {isYesNo ? yesNoValue : goal1}
                        </span>
                      </div>
                      {!isYesNo && (
                        <div>
                          <span className="font-medium text-gray-700">
                            Goal Value 2:{" "}
                          </span>
                          <span className="text-black font-bold">{goal2}</span>
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
