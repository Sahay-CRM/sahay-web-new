import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { twMerge } from "tailwind-merge";
// import { CloseIcon } from "../Icons";

const ModalData: React.FC<ModalProps> = ({
  children,
  isModalOpen,
  buttons,
  modalClose,
  // isCloseButton = true,
  containerClass,
  modalTitle,
}) => {
  return (
    <Dialog open={isModalOpen} onOpenChange={modalClose}>
      <DialogContent
        aria-describedby={undefined}
        className={twMerge(
          "bg-white p-0 rounded-2xl min-w-[30%] max-w-[70%] overflow-hidden",
          containerClass,
        )}
      >
        <DialogHeader className="flex flex-row justify-between items-center border-b p-4">
          <DialogTitle className="text-xl font-semibold">
            {modalTitle}
          </DialogTitle>
          {/* {isCloseButton && (
            <button onClick={modalClose} className="text-gray-500 hover:text-gray-700">
              <CloseIcon />
            </button>
          )} */}
        </DialogHeader>

        <div className="px-6 py-4">{children}</div>

        {buttons && buttons.length > 0 && (
          <DialogFooter className="flex justify-end gap-2 border-t p-4">
            {buttons.map((button, index) => (
              <Button
                key={index}
                onClick={button.btnClick}
                // className={twMerge(
                //   "border border-gray-300 bg-transparent text-black font-semibold",
                //   button.buttonCss
                // )}
                disabled={button.isLoading}
              >
                {button.isLoading ? "Loading..." : button.btnText}
              </Button>
            ))}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ModalData;
