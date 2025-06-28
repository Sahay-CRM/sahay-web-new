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
    if (modalData?.kpiId) {
      navigate(`/dashboard/kpi/edit/${modalData.kpiId}`);
    }
  };

  return (
    <ModalData
      isModalOpen={isModalOpen}
      modalTitle="KPI Details"
      modalClose={modalClose}
      buttons={[
        {
          btnText: "Close",
          buttonCss: "py-1.5 px-5 bg-gray-200 hover:bg-gray-300",
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
        {modalData?.dataPointLabel && (
          <div>
            <span className="font-medium text-primary">
              Data Point Label :{" "}
            </span>
            {modalData.dataPointLabel}
          </div>
        )}
        {modalData?.dataPointName && (
          <div>
            <span className="font-medium text-primary">Data Point Name : </span>
            {modalData.dataPointName}
          </div>
        )}
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
        {modalData?.tag && (
          <div>
            <span className="font-medium text-primary">Tag : </span>
            {modalData.tag}
          </div>
        )}
        {modalData?.validationType && (
          <div>
            <span className="font-medium text-primary">Validation Type : </span>
            {modalData.validationType}
          </div>
        )}
        {modalData?.frequencyType && (
          <div>
            <span className="font-medium text-primary">Frequency Type : </span>
            {modalData.frequencyType}
          </div>
        )}
        {modalData?.visualFrequencyTypes && (
          <div>
            <span className="font-medium text-primary">
              Visual Frequency Types :{" "}
            </span>
            {modalData.visualFrequencyTypes}
          </div>
        )}
        {modalData?.selectedType && (
          <div>
            <span className="font-medium text-primary">Selected Type : </span>
            {modalData.selectedType}
          </div>
        )}
        {modalData?.unit && (
          <div>
            <span className="font-medium text-primary">Unit Type : </span>
            {modalData.unit}
          </div>
        )}
        {modalData?.value1 && (
          <div>
            <span className="font-medium text-primary">Value 1 : </span>
            {modalData.value1}
          </div>
        )}
        {modalData?.value2 && (
          <div>
            <span className="font-medium text-primary">Value 2 : </span>
            {modalData.value2}
          </div>
        )}
        {modalData?.employeeName && (
          <div>
            <span className="font-medium text-primary">Employee Name : </span>
            {modalData.employeeName}
          </div>
        )}
      </div>
    </ModalData>
  );
};

export default ViewMeetingModal;
