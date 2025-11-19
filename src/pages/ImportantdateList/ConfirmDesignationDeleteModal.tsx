import { useState } from "react";
import { useSelector } from "react-redux";
import { getUserDetail } from "@/features/selectors/auth.selector";
import ModalData from "@/components/shared/Modal/ModalData";

interface DeleteModalProps {
  modalData: ImportantDatesDataProps | null;
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
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 text-sm text-gray-700">
            {modalData?.importantDateName && (
              <div>
                <span className="font-medium text-primary">
                  Important Date Name:{" "}
                </span>
                {modalData.importantDateName}
              </div>
            )}

            {modalData?.importantDate && (
              <div>
                <span className="font-medium text-primary">Date: </span>
                {new Date(modalData.importantDate).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            )}

            {modalData?.importantDateRemarks && (
              <div>
                <span className="font-medium text-primary">Remarks: </span>
                {modalData.importantDateRemarks}
              </div>
            )}

            {modalData?.color && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-primary">Color: </span>
                <div
                  className="w-5 h-5 rounded border"
                  style={{ backgroundColor: modalData.color }}
                />
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
