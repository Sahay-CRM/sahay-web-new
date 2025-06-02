import ModalData from "@/components/shared/Modal/ModalData";

interface DatapointModalProps {
  modalData: KPIFormData; // Use the correct type if available, e.g., CompanyMeetingDataProps
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
  return (
    <div>
      <ModalData
        isModalOpen={isModalOpen}
        modalTitle="Add Datapoint"
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
        <div>
          <div>
            <span>Kpi Name : {modalData?.KPIMasterId?.KPIName || "-"}</span>
          </div>
          <div>
            <span>
              Frequency : {modalData?.frequencyId?.frequencyName || "-"}
            </span>
          </div>
          <div>
            <span>
              Validation Type :{" "}
              {modalData?.validationTypeId?.validationTypeName || "-"}
            </span>
          </div>
          <div>
            <span>
              Assign User :
              {Array.isArray(modalData.employeeId)
                ? modalData.employeeId
                    .map((joiner) => joiner?.employeeName)
                    .filter(Boolean)
                    .join(", ")
                : "-"}
            </span>
          </div>
          <div>
            <span>
              Goal Value : <br></br>
            </span>
            <span>
              Goal Value 1 :{modalData?.goalValue1 || "-"} <br></br>
            </span>
            <span>Goal Value 2 :{modalData?.goalValue2 || "-"}</span>
          </div>
        </div>
      </ModalData>
    </div>
  );
};

export default AddDatapointModal;
