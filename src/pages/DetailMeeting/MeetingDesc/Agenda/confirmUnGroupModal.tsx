import ModalData from "@/components/shared/Modal/ModalData";

interface ConfirmModalProps {
  isOpen: boolean;
  modalClose: () => void;
  title?: string;
  message?: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmUnGroupModal({
  isOpen,
  modalClose,
  title = "Confirm",
  message = "Are you sure?",
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
}: ConfirmModalProps) {
  return (
    <ModalData
      isModalOpen={isOpen}
      modalClose={modalClose}
      modalTitle={title}
      containerClass="max-w-sm min-w-[10%]"
      buttons={[
        {
          btnText: cancelText,

          buttonCss: "py-1.5 px-5",
          btnClick: modalClose,
        },
        {
          btnText: confirmText,

          buttonCss: "py-1.5 text-white hover:bg-red-700 bg-red-700 px-5",
          btnClick: onConfirm,
        },
      ]}
    >
      <p className="text-sm text-gray-600">{message}</p>
    </ModalData>
  );
}
