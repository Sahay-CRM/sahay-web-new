import { useSelector } from "react-redux";
import ModalData from "../ModalData";
import { getUserDetail } from "@/features/selectors/auth.selector";

interface DeleteModalProps {
  modalData: string;
  label: string;
  title: string;
  isModalOpen: boolean;
  modalClose: () => void;
  onSubmit: () => void;
  isChildData?: string | undefined;
  onForceSubmit?: () => void; // added
}

const ConfirmationDeleteModal: React.FC<DeleteModalProps> = ({
  title,
  label,
  modalData,
  isModalOpen,
  modalClose,
  onSubmit,
  isChildData,
  onForceSubmit, // added
}) => {
  const userData = useSelector(getUserDetail);
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
            btnClick: onSubmit,
          },
          // Add Force delete button if isChildData exists
          ...(isChildData && userData.isSuperAdmin
            ? [
                {
                  btnText: "Force delete",
                  buttonCss:
                    "py-1.5 px-5 bg-red-600 text-white hover:bg-red-400",
                  btnClick: onForceSubmit ? onForceSubmit : onSubmit, // use onForceSubmit if provided
                },
              ]
            : []),
        ]}
      >
        <div>
          <div>
            <div>
              <span className="font-semibold">{label}</span>{" "}
              <span>{modalData}</span>
            </div>
          </div>
          {isChildData && (
            <div className="border-t mt-2 pt-2">
              <span className="font-bold text-black">{isChildData}</span>
            </div>
          )}
        </div>
      </ModalData>
    </div>
  );
};

export default ConfirmationDeleteModal;
