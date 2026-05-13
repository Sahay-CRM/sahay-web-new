import { useEffect, useRef } from "react";
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
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="fixed z-[9999] bg-white border border-slate-200 rounded-lg shadow-xl py-1 min-w-[160px]"
      style={{ left: x, top: y }}
    >
      <button
        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
        onClick={() => {
          onAddChild();
          onClose();
        }}
      >
        <UserPlus className="w-4 h-4 text-primary" /> Add Subordinate
      </button>
      <button
        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
        onClick={() => {
          onEdit();
          onClose();
        }}
      >
        <LayoutTemplate className="w-4 h-4 text-primary" /> Edit Seat
      </button>
      <div className="my-1 border-t border-slate-100" />
      <button
        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
        onClick={() => {
          onDelete();
          onClose();
        }}
      >
        <Trash2 className="w-4 h-4" /> Remove Position
      </button>
    </div>
  );
}
