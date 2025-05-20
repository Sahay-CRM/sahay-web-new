interface ModalButton {
  btnText: string;
  btnClick: () => void;
  isLoading?: boolean;
  buttonCss?: string;
}
interface ModalProps {
  children: ReactNode;
  isModalOpen: boolean;
  buttons?: ModalButton[];
  modalClose: (open: boolean) => void;
  containerClass?: string;
  modalTitle?: string;
}
