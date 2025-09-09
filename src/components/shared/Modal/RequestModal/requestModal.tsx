import { useState } from "react";
import ModalData from "@/components/shared/Modal/ModalData";

interface RequestModalProps {
  type: string;
  isModalOpen: boolean;
  modalClose: () => void;
  modalTitle: string;
}

export default function RequestModal({
  type,
  isModalOpen,
  modalClose,
  modalTitle,
}: RequestModalProps) {
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    console.log("Type:", type);
    console.log("Notes:", notes);
  };

  return (
    <div>
      <ModalData
        isModalOpen={isModalOpen}
        modalTitle={modalTitle}
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
            btnClick: handleSubmit,
          },
        ]}
      >
        <div className="space-y-4">
          <div>
            <span className="font-semibold">Type: </span>
            <span>{type}</span>
          </div>

          <div>
            <label className="block mb-1 font-medium">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter your notes..."
              className="w-full border rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-300"
              rows={4}
            />
          </div>
        </div>
      </ModalData>
    </div>
  );
}
