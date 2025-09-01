
import { useState } from "react";
import { useSelector } from "react-redux";
import ModalData from "../ModalData";
import { getUserDetail } from "@/features/selectors/auth.selector";

interface DeleteModalProps {
  modalData: string;
  label: string;
  title: string;
  isModalOpen: boolean;
  modalClose: () => void;
  onSubmit: (isGroupDelete?: boolean) => void;
  isChildData?: string;
  onForceSubmit?: () => void;
  showDeleteOptions?: boolean; // ✅ New prop
}

const ConfirmationDeleteModal: React.FC<DeleteModalProps> = ({
  title,
  label,
  modalData,
  isModalOpen,
  modalClose,
  onSubmit,
  isChildData,
  onForceSubmit,
  showDeleteOptions = false, // ✅ Default to false
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

          ...(isChildData && userData.isSuperAdmin
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
        <div className="space-y-3">
          <div>
            <span className="font-semibold">{label}</span>{" "}
            <span>{modalData}</span>
          </div>

          {isChildData && (
            <div className="border-t pt-2">
              <span className="font-bold text-black">{isChildData}</span>
            </div>
          )}

          {/* ✅ Conditionally render Delete Options */}
          {showDeleteOptions && (
            <div className="mt-4 space-y-2">
              <label className="font-medium">Delete Options</label>
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
