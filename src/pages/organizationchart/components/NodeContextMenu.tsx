import { useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  UserPlus,
  LayoutTemplate,
  Trash2,
  UserMinus,
  Split,
} from "lucide-react";

export function NodeContextMenu({
  x,
  y,
  onAddChild,
  onEdit,
  onDelete,
  onRemoveEmployee,
  onSeparatePosition,
  onClose,
}: CtxMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return createPortal(
    <div
      ref={ref}
      className="fixed z-[9999] bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] py-1.5 min-w-[200px] animate-in fade-in zoom-in-95 duration-150"
      style={{ left: x, top: y }}
    >
      <button
        className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
        onClick={() => {
          onAddChild();
          onClose();
        }}
      >
        <UserPlus className="w-4 h-4 text-primary" /> Add Subordinate
      </button>
      <button
        className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
        onClick={() => {
          onEdit();
          onClose();
        }}
      >
        <LayoutTemplate className="w-4 h-4 text-primary" /> Edit Seat
      </button>

      {onRemoveEmployee && (
        <button
          className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
          onClick={() => {
            onRemoveEmployee();
            onClose();
          }}
        >
          <UserMinus className="w-4 h-4 text-orange-500" /> Unassign Employee
        </button>
      )}

      <button
        className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
        onClick={() => {
          onSeparatePosition?.();
          onClose();
        }}
      >
        <Split className="w-4 h-4 text-indigo-500" /> Separate Position
      </button>

      <div className="my-1 border-t border-slate-100" />
      <button
        className="w-full text-left px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
        onClick={() => {
          onDelete();
          onClose();
        }}
      >
        <Trash2 className="w-4 h-4" /> Remove Position
      </button>
    </div>,
    document.body,
  );
}
