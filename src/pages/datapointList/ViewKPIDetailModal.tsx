import ModalData from "@/components/shared/Modal/ModalData";
import { getUserPermission } from "@/features/selectors/auth.selector";
import { useSelector } from "react-redux";

interface ViewMeetingModalProps {
  modalData: KPIFormData;
  isModalOpen: boolean;
  modalClose: () => void;
  onEdit?: (kpiId: string) => void;
}

export default function ViewKpiDetailModal({
  modalData,
  isModalOpen,
  modalClose,
  onEdit,
}: ViewMeetingModalProps) {
  const permission = useSelector(getUserPermission).DATAPOINT_LIST;

  const handleEdit = () => {
    if (modalData?.kpiId && onEdit) {
      onEdit(modalData.kpiId);
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
        {modalData?.KPIName && (

          <div className="break-words whitespace-normal">

            <span className="font-medium text-primary">KPI Name : </span>
            {modalData.KPIName}
          </div>
        )}
        {modalData?.KPILabel && (
          <div className="break-words whitespace-normal">

            <span className="font-medium text-primary">
              KPI Description (Tooltip) :{" "}
            </span>
            {modalData.KPILabel}
          </div>
        )}
        {modalData?.tag && (
          <div className="break-words whitespace-normal">
            <span className="font-medium text-primary">Tag : </span>
            {modalData.tag}
          </div>
        )}
        {modalData?.validationType && (
          <div className="break-words whitespace-normal">
            <span className="font-medium text-primary">Validation Type : </span>
            {modalData.validationType}
          </div>
        )}
        {modalData?.frequencyType && (
          <div className="break-words whitespace-normal">
            <span className="font-medium text-primary">Frequency Type : </span>
            {modalData.frequencyType}
          </div>
        )}
        {modalData?.visualFrequencyTypes && (
          <div className="break-words whitespace-normal">
            <span className="font-medium text-primary">
              Visual Frequency Types :{" "}
            </span>
            {modalData.visualFrequencyTypes}
          </div>
        )}
        {modalData?.selectedType && (
          <div className="break-words whitespace-normal">
            <span className="font-medium text-primary">Selected Type : </span>
            {modalData.selectedType}
          </div>
        )}
        {modalData?.unit && (
          <div className="break-words whitespace-normal">
            <span className="font-medium text-primary">Unit Type : </span>
            {modalData.unit}
          </div>
        )}
        {modalData?.value1 && (
          <div className="break-words whitespace-normal">
            <span className="font-medium text-primary">Value 1 : </span>
            {modalData.value1}
          </div>
        )}
        {modalData?.value2 && (
          <div className="break-words whitespace-normal">
            <span className="font-medium text-primary">Value 2 : </span>
            {modalData.value2}
          </div>
        )}
        {modalData?.employeeName && (
          <div className="break-words whitespace-normal">
            <span className="font-medium text-primary">Employee Name : </span>
            {modalData.employeeName}
          </div>
        )}
      </div>
    </ModalData>
  );
}
