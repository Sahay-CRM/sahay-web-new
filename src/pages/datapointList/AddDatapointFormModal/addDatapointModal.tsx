import ModalData from "@/components/shared/Modal/ModalData";

interface DatapointModalProps {
  modalData: KPIFormDataProp;
  isModalOpen: boolean;
  modalClose: () => void;
  onSubmit: () => void;
  isLoading?: boolean;
}
interface DatapointListData {
  KPIMasterId: string;
  KPIName: string;
  KPILabel: string;
}

interface KPIFormDataProp {
  KPIName?: string;
  KPIMasterId?: DatapointListData;
  frequencyId?: string;
  validationType?: string;
  visualFrequencyTypes?: string[];
  unit?: string;
  coreParameterId?: string;
  productId?: ProductData | ProductData[];
  employeeId?: string | EmployeeData | EmployeeData[];
  value1?: string | number | null;
  value2?: string | number | null;
  tag?: string;
  [key: `goalValue1_${string}`]: string | number | undefined;
  [key: `goalValue2_${string}`]: string | number | undefined;
}

interface ProductData {
  productId: string;
  productName: string;
}

interface EmployeeData {
  employeeId: string;
  employeeName: string;
}
const AddDatapointModal: React.FC<DatapointModalProps> = ({
  modalData,
  isModalOpen,
  modalClose,
  onSubmit,
  isLoading,
}) => {
  const isYesNo =
    typeof modalData?.validationType === "object" &&
    (modalData?.validationType === "YES_NO" ||
      modalData?.validationType === "7");

  return (
    <div>
      <ModalData
        isModalOpen={isModalOpen}
        modalTitle={modalData?.KPIName ? "Update KPI" : "Add KPI"}
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
                : modalData?.frequencyId || "-"}
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
              {typeof modalData?.validationType === "string"
                ? modalData.validationType
                : modalData?.validationType || "-"}
            </span>
          </div>

          {/* {Array.isArray(modalData.productId) &&
            modalData.productId.length > 0 && (
              <div className="col-span-2">
                <span className="font-medium text-gray-700">Products : </span>
                <span className="text-black font-bold">
                  {modalData.productId.map((p) => p.productName).join(", ")}
                </span>
              </div>
            )} */}

          {/* <div className="col-span-2">
            <span className="font-medium text-gray-700">Assigned Users : </span>
            <span className="text-black font-bold">
              {Array.isArray(modalData.employeeId)
                ? modalData.employeeId
                    .map((user) => user?.employeeName)
                    .filter(Boolean)
                    .join(", ")
                : "-"}
            </span>
          </div> */}

          <div className="col-span-2">
            <span className="font-medium text-gray-700">Goal Values :</span>
            {isYesNo ? (
              modalData.value1 === 1 ? (
                "Yes"
              ) : modalData.value1 === 0 ? (
                "No"
              ) : (
                "-"
              )
            ) : (
              <>
                {modalData.value1}
                {modalData.value2 ? `- ${modalData.value2}` : ""}
              </>
            )}
          </div>
        </div>
      </ModalData>
    </div>
  );
};

export default AddDatapointModal;
