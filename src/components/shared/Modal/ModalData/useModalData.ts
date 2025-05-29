import { useEffect, useRef, KeyboardEvent } from "react";

/**
 * useModalWrapper is a talon for ModalWrapper
 * mainly it is handling the tab key while modal is open.
 *
 * Parent
 *    ModalWrapper
 */
export default function useModalData(
  isModalOpen: boolean,
  escapeElementId: string = "",
) {
  const modalRef = useRef<HTMLDivElement | null>(null); // Specify the type of the modalRef
  const previouslyFocusedElement = useRef<Element | null>(null);

  useEffect(() => {
    if (isModalOpen) {
      // When the modal opens, focus on the modal
      previouslyFocusedElement.current = document.activeElement;
      modalRef.current?.focus();
    } else if (previouslyFocusedElement.current instanceof HTMLElement) {
      // When the modal closes, return focus to the previously focused element
      previouslyFocusedElement.current.focus();
    }
  }, [isModalOpen]);

  const handleTabKey = (e: KeyboardEvent<HTMLDivElement>): void => {
    // Tab key has been pressed
    if (e.key === "Tab") {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ) as NodeListOf<HTMLElement> | null;

      if (focusableElements && focusableElements.length > 0) {
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (
          !escapeElementId ||
          (e.target as HTMLElement).id !== escapeElementId
        ) {
          if (!e.shiftKey && document.activeElement === lastElement) {
            // Tabbing forward from the last focusable element in modal - move focus to the first element
            e.preventDefault();
            firstElement.focus();
          } else if (e.shiftKey && document.activeElement === firstElement) {
            // Tabbing backward from the first focusable element in modal - move focus to the last element
            e.preventDefault();
            lastElement.focus();
          }
        }
      }
    }
  };

  return { modalRef, handleTabKey };
}
