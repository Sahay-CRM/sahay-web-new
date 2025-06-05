import ModalData from "@/components/shared/Modal/ModalData";
import { getUserPermission } from "@/features/selectors/auth.selector";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

interface ViewMeetingModalProps {
  modalData: KPIFormData;
  isModalOpen: boolean;
  modalClose: () => void;
}

const ViewMeetingModal: React.FC<ViewMeetingModalProps> = ({
  modalData,
  isModalOpen,
  modalClose,
}) => {
  const navigate = useNavigate();
  const permission = useSelector(getUserPermission).DATAPOINT_LIST;

  const handleEdit = () => {
    if (modalData?.dataPointId) {
      navigate(`/dashboard/kpi/edit/${modalData.dataPointId}`);
    }
  };

  return (
    <ModalData
      isModalOpen={isModalOpen}
      modalTitle="Kpi Details"
      modalClose={modalClose}
      buttons={[
        {
          btnText: "Close",
          buttonCss: "py-1.5 px-5",
          btnClick: modalClose,
        },
        ...(permission.Edit
          ? [
              {
                btnText: "Edit",
                buttonCss: "py-1.5 px-5",
                btnClick: handleEdit,
              },
            ]
          : []),
      ]}
    >
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm text-gray-700 mb-6">
        {modalData?.KPILabel && (
          <div>
            <span className="font-medium text-primary">KPI Label : </span>
            {modalData.KPILabel}
          </div>
        )}
        {modalData?.KPIName && (
          <div>
            <span className="font-medium text-primary">KPI Name : </span>
            {modalData.KPIName}
          </div>
        )}
        {modalData?.frequencyType && (
          <div>
            <span className="font-medium text-primary">Frequency Type : </span>
            {modalData.frequencyType}
          </div>
        )}
        {modalData?.selectedType && (
          <div>
            <span className="font-medium text-primary">Selected Type : </span>
            {modalData.selectedType}
          </div>
        )}
        {modalData?.validationType && (
          <div>
            <span className="font-medium text-primary">Validation Type : </span>
            {modalData.validationType}
          </div>
        )}
        {modalData?.unit && (
          <div>
            <span className="font-medium text-primary">Unit Type : </span>
            {modalData.unit}
          </div>
        )}
      </div>

      {/* Employee Junction Data */}
      {modalData?.dataPointEmployeeJunction?.length > 0 && (
        <div className="text-sm text-gray-700">
          <div className="font-semibold text-primary mb-2">
            Employee KPI Values:
          </div>
          <div className="border rounded-md divide-y">
            {modalData.dataPointEmployeeJunction.map((emp) => (
              <div
                key={emp.dataPointEmpId}
                className={`p-2 grid gap-4 items-center ${
                  emp.value2 !== "0" ? "grid-cols-3" : "grid-cols-2"
                }`}
              >
                <div>
                  <span className="font-medium">Name: </span>
                  {emp.employeeName}
                </div>
                <div>
                  <span className="font-medium">Value 1: </span>
                  {modalData.validationType === "YES_NO"
                    ? emp.value1 === "1"
                      ? "Yes"
                      : "No"
                    : emp.value1}
                </div>
                {emp.value2 !== "0" && (
                  <div>
                    <span className="font-medium">Value 2: </span>
                    {emp.value2}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </ModalData>
  );
};

export default ViewMeetingModal;
