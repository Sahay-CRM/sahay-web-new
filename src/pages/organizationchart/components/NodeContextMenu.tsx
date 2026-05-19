import { useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { UserPlus, LayoutTemplate, Trash2 } from "lucide-react";

export function NodeContextMenu({
  x,
  y,
  onAddChild,
  onEdit,
  onDelete,
  onClose,
}: CtxMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler, { capture: true });
    document.addEventListener("touchstart", handler, { capture: true });
    return () => {
      document.removeEventListener("mousedown", handler, { capture: true });
      document.removeEventListener("touchstart", handler, { capture: true });
    };
  }, [onClose]);

  return createPortal(
    <div
      ref={ref}
      className="fixed z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[180px] animate-in fade-in zoom-in-95 duration-150"
      style={{ left: x, top: y }}
    >
      <button
        className="w-full text-left px-3.5 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
        onClick={() => {
          onAddChild();
          onClose();
        }}
      >
        <UserPlus className="w-3.5 h-3.5 text-primary" /> Add Subordinate
      </button>
      <button
        className="w-full text-left px-3.5 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
        onClick={() => {
          onEdit();
          onClose();
        }}
      >
        <LayoutTemplate className="w-3.5 h-3.5 text-primary" /> Edit Seat
      </button>

      <div className="my-1 border-t border-gray-100" />
      <button
        className="w-full text-left px-3.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
        onClick={() => {
          onDelete();
          onClose();
        }}
      >
        <Trash2 className="w-3.5 h-3.5" /> Remove Position
      </button>
    </div>,
    document.body,
  );
}
