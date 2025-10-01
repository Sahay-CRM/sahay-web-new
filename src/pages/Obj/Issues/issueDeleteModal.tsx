import ModalData from "@/components/shared/Modal/ModalData";

interface IssueDeleteModalProps {
  isModalOpen: boolean;
  modalClose: () => void;
  onSubmit: (isSoft?: boolean) => void;
  onForceSubmit: () => void;
  modalData: IssuesProps;
  isChildData?: string;
}
export default function IssueDeleteModal({
  isModalOpen,
  modalClose,
  onSubmit,
  modalData,
  onForceSubmit,
  isChildData,
}: IssueDeleteModalProps) {
  return (
    <ModalData
      isModalOpen={isModalOpen}
      modalTitle="Delete Issue"
      modalClose={modalClose}
      buttons={[
        {
          btnText: "Cancel",
          buttonCss: "py-1.5 px-5",
          btnClick: modalClose,
        },
        {
          btnText: "Soft Delete",
          buttonCss: "py-1.5 px-5",
          btnClick: () => {
            onSubmit(true);
          },
        },
        {
          btnText: "Force Delete",
          buttonCss: "py-1.5 px-5",
          btnClick: onForceSubmit,
        },
      ]}
    >
      <div>
        <div className="flex gap-1">
          Issue Name: <h2>{modalData.issueName}</h2>
        </div>
        <p>{modalData.isResolved}</p>
        {modalData.departmentName && (
          <p>Department Name: {modalData.departmentName}</p>
        )}

        {isChildData && (
          <div className="border-t pt-2">
            <span className="font-bold text-black">{isChildData}</span>
          </div>
        )}
      </div>
    </ModalData>
  );
}
