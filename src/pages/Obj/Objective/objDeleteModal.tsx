import ModalData from "@/components/shared/Modal/ModalData";

interface ObjDeleteModalProps {
  isModalOpen: boolean;
  modalClose: () => void;
  onSubmit: (isSoft?: boolean) => void;
  onForceSubmit: () => void;
  modalData: ObjectiveProps;
  isChildData?: string;
}
export default function ObjDeleteModal({
  isModalOpen,
  modalClose,
  onSubmit,
  modalData,
  onForceSubmit,
  isChildData,
}: ObjDeleteModalProps) {
  return (
    <ModalData
      isModalOpen={isModalOpen}
      modalTitle="Delete Objective"
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
          buttonCss: "py-1.5 px-5 bg-red-600 text-white",
          btnClick: onForceSubmit,
        },
      ]}
    >
      <div className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm ">
        <div className="flex gap-1">
          <span className="font-medium text-primary"> Objective Name : </span>
          <h2>{modalData.objectiveName}</h2>
        </div>

        {modalData.departmentName && (
          <div>
            <span className="font-medium text-primary">Department Name : </span>
            {modalData.departmentName}
          </div>
        )}
        {modalData?.type && (
          <div>
            <span className="font-medium text-primary">Type : </span>
            {modalData.type}
          </div>
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
