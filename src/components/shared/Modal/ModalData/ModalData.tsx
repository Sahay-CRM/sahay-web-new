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
          "bg-white p-0 rounded-2xl min-w-[30%] max-w-[70%] max-h-[80vh] min-h-[300px] overflow-hidden flex flex-col",
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

        <div className="px-6 py-4 flex-1 overflow-y-auto">{children}</div>

        {buttons && buttons.length > 0 && (
          <DialogFooter className="flex justify-end gap-2 border-t p-4">
            {" "}
            {buttons.map((button, index) => {
              // Check if buttonCss contains background color classes
              const hasCustomBg =
                button.buttonCss?.includes("bg-") ||
                button.buttonCss?.includes("!bg-");
              const defaultClasses = hasCustomBg
                ? "border border-gray-300 text-black font-semibold"
                : "border border-primary bg-primary text-white font-semibold hover:bg-primary/90";

              return (
                <Button
                  key={index}
                  onClick={button.btnClick}
                  className={twMerge(defaultClasses, button.buttonCss)}
                  disabled={button.isLoading}
                >
                  {button.isLoading ? "Loading..." : button.btnText}
                </Button>
              );
            })}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ModalData;
