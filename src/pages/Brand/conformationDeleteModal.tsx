import ModalData from "@/components/shared/Modal/ModalData";

interface BrandModalProps {
  modalData: BrandData;
  isModalOpen: boolean;
  modalClose: () => void;
  onSubmit: () => void;
  isChildData?: string | undefined;
}

const ConformationDeleteModal: React.FC<BrandModalProps> = ({
  modalData,
  isModalOpen,
  modalClose,
  onSubmit,
  isChildData,
}) => {
  return (
    <div>
      <ModalData
        isModalOpen={isModalOpen}
        modalTitle="Brand Delete"
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
        ]}
      >
        <div>
          <div>
            <div>
              <span className="font-semibold">Brand Name:</span>{" "}
              <span>{modalData.brandName}</span>
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

export default ConformationDeleteModal;
