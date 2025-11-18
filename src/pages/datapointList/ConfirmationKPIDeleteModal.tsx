import { useState } from "react";
import { useSelector } from "react-redux";
import { getUserDetail } from "@/features/selectors/auth.selector";
import ModalData from "@/components/shared/Modal/ModalData";

interface KPIDataType {
  KPIName?: string;
  KPILabel?: string;
  tag?: string;
  unit?: string;
  coreParameterName?: string;
  frequencyType?: string;
  validationType?: string;
  employeeFullName?: string;
  employeeName?: string;
  value1?: string | null;
  value2?: string | null;
  goal?: string;
}

interface DeleteModalProps {
  modalData: KPIDataType | null;
  title: string;
  isModalOpen: boolean;
  modalClose: () => void;
  onSubmit: (isGroupDelete?: boolean) => void;
  isChildData?: string;
  onForceSubmit?: () => void;
  showDeleteOptions?: boolean;
  isForceDelete?: boolean;
}

const ConfirmationDeleteModal: React.FC<DeleteModalProps> = ({
  title,
  modalData,
  isModalOpen,
  modalClose,
  onSubmit,
  isChildData,
  onForceSubmit,
  showDeleteOptions = false,
  isForceDelete = false,
}) => {
  const userData = useSelector(getUserDetail);
  const [deleteOption, setDeleteOption] = useState<"single" | "group">(
    "single",
  );

  return (
    <div>
      <ModalData
        isModalOpen={isModalOpen}
        modalTitle={title}
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
            btnClick: () => onSubmit(deleteOption === "group"),
          },

          ...(isChildData && !isForceDelete && userData.isSuperAdmin
            ? [
                {
                  btnText: "Force delete",
                  buttonCss:
                    "py-1.5 px-5 bg-red-600 text-white hover:bg-red-400",
                  btnClick: onForceSubmit
                    ? onForceSubmit
                    : () => onSubmit(deleteOption === "group"),
                },
              ]
            : []),
        ]}
      >
        <div className="space-y-4 text-sm">
          {/* Main KPI details */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm text-gray-700">
            {modalData?.KPIName && (
              <div>
                <span className="font-medium text-primary">KPI Name : </span>
                {modalData.KPIName}
              </div>
            )}

            {modalData?.KPILabel && (
              <div>
                <span className="font-medium text-primary">
                  KPI Description :{" "}
                </span>
                {modalData.KPILabel}
              </div>
            )}

            {modalData?.tag && (
              <div>
                <span className="font-medium text-primary">Tag : </span>
                {modalData.tag}
              </div>
            )}
            {modalData?.unit && (
              <div>
                <span className="font-medium text-primary">Unit Type : </span>
                {modalData.unit}
              </div>
            )}

            {modalData?.coreParameterName && (
              <div>
                <span className="font-medium text-primary">
                  Business Function Name :{" "}
                </span>
                {modalData.coreParameterName}
              </div>
            )}

            {modalData?.frequencyType && (
              <div>
                <span className="font-medium text-primary">
                  Frequency Type :{" "}
                </span>
                {modalData.frequencyType}
              </div>
            )}

            {modalData?.validationType && (
              <div>
                <span className="font-medium text-primary">
                  Validation Type :{" "}
                </span>
                {modalData.validationType}
              </div>
            )}

            {(modalData?.employeeFullName || modalData?.employeeName) && (
              <div>
                <span className="font-medium text-primary">Assign User : </span>
                {modalData.employeeFullName || modalData.employeeName}
              </div>
            )}
            {modalData?.goal != null && (
              <div>
                <span className="font-medium text-primary">Goal : </span>
                {modalData.goal}
              </div>
            )}
            {modalData?.value1 != null && (
              <div>
                <span className="font-medium text-primary">Value 1 : </span>
                {modalData.value1}
              </div>
            )}

            {modalData?.value2 != null && (
              <div>
                <span className="font-medium text-primary">Value 2 : </span>
                {modalData.value2}
              </div>
            )}
          </div>

          {/* Child Data Section */}
          {isChildData && (
            <div className="border-t pt-2">
              <span className="font-bold text-black">{isChildData}</span>
            </div>
          )}

          {/* Delete Options */}
          {showDeleteOptions && (
            <div className="mt-4 space-y-2">
              <label className="font-medium text-primary">Delete Options</label>

              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="deleteOption"
                    value="single"
                    checked={deleteOption === "single"}
                    onChange={() => setDeleteOption("single")}
                  />
                  <span>Delete only this task</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="deleteOption"
                    value="group"
                    checked={deleteOption === "group"}
                    onChange={() => setDeleteOption("group")}
                  />
                  <span>Delete the whole group</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </ModalData>
    </div>
  );
};

export default ConfirmationDeleteModal;
