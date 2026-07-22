import ModalData from "@/components/shared/Modal/ModalData";

interface ConfirmDeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export default function ConfirmDeleteModal({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: ConfirmDeleteModalProps) {
  return (
    <ModalData
      isModalOpen={open}
      modalTitle="Confirm Delete"
      modalClose={() => onOpenChange(false)}
      buttons={[
        {
          btnText: "Cancel",
          buttonCss: "py-1.5 px-5 bg-transparent text-slate-700 border hover:bg-slate-50",
          btnClick: () => onOpenChange(false),
        },
        {
          btnText: "Delete",
          buttonCss: "py-1.5 px-5 bg-red-600 text-white hover:bg-red-700",
          btnClick: onConfirm,
          isLoading: isLoading,
        },
      ]}
    >
      <div className="py-2 text-sm text-slate-700 font-medium">
        Are you sure you want to delete this planning item?
      </div>
    </ModalData>
  );
}
