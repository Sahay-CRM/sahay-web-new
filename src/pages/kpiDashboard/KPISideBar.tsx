import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableItem from "./sortableItem";
import { useState } from "react";
import { X } from "lucide-react";
import { updateKPISequenceMutation } from "@/features/api/KpiList";

// Types
interface KPI {
  kpiId: string;
  kpiName: string;
  sequence?: number | null;
}

interface CoreParameterGroup {
  coreParameterId: string;
  coreParameterName: string;
  kpis: KPI[];
}

interface DraggableKPISidebarProps {
  open: boolean;
  onClose: () => void;
  data: CoreParameterGroup[];
  selectedType: string;
}

function sortKpis(kpis: KPI[]) {
  const hasSequence = kpis.some(
    (k) => k.sequence !== null && k.sequence !== undefined,
  );

  if (hasSequence) {
    return [...kpis].sort((a, b) => {
      const seqA = a.sequence ?? Infinity;
      const seqB = b.sequence ?? Infinity;
      return seqA - seqB;
    });
  }

  return [...kpis].sort((a, b) => a.kpiName.localeCompare(b.kpiName));
}

export default function DraggableKPISidebar({
  open,
  onClose,
  data,
  selectedType,
}: DraggableKPISidebarProps) {
  const { mutate: updateSequence } = updateKPISequenceMutation();

  const [groups, setGroups] = useState(
    data.map((g) => ({
      ...g,
      kpis: sortKpis(g.kpis),
    })),
  );

  const [activeItem, setActiveItem] = useState<{
    type: "group" | "kpi";
    id: string;
    groupId?: string;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    setActiveItem(null);
    const { active, over } = event;
    if (!over) return;

    // ✅ Group reorder
    if (
      active.data.current?.type === "group" &&
      over.data.current?.type === "group"
    ) {
      if (active.id !== over.id) {
        const oldIndex = groups.findIndex(
          (g) => g.coreParameterId === active.id,
        );
        const newIndex = groups.findIndex((g) => g.coreParameterId === over.id);
        setGroups((items) => arrayMove(items, oldIndex, newIndex));
      }
    }

    // ✅ KPI reorder within group
    if (
      active.data.current?.type === "kpi" &&
      over.data.current?.type === "kpi"
    ) {
      const groupId = active.data.current?.groupId as string;
      if (groupId === over.data.current?.groupId) {
        setGroups((prev) =>
          prev.map((g) => {
            if (g.coreParameterId !== groupId) return g;
            const oldIndex = g.kpis.findIndex((k) => k.kpiId === active.id);
            const newIndex = g.kpis.findIndex((k) => k.kpiId === over.id);
            return { ...g, kpis: arrayMove(g.kpis, oldIndex, newIndex) };
          }),
        );
      }
    }
  }

  const renderGroupOverlay = (groupId: string) => {
    const group = groups.find((g) => g.coreParameterId === groupId);
    if (!group) return null;

    return (
      <div className="border rounded-md bg-white shadow-2xl transform rotate-2 scale-105">
        <div className="bg-blue-50 px-3 py-2 font-semibold flex items-center gap-2 rounded-t-md">
          <span>⋮⋮</span>
          {group.coreParameterName}
        </div>
        {group.kpis.map((kpi, index) => (
          <div
            key={kpi.kpiId}
            className={`flex items-center gap-2 px-3 py-2 ${
              index < group.kpis.length - 1
                ? "border-t"
                : "border-t rounded-b-md"
            }`}
          >
            <span>⋮⋮</span>
            {kpi.kpiName}
          </div>
        ))}
      </div>
    );
  };

  const handleUpdateKpi = (data: string[]) => {
    updateSequence(
      {
        frequencyType: selectedType,
        kpiSequenceArray: data,
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 transition-opacity h-full"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-[100vh] w-[450px] bg-white shadow-lg z-50 transform transition-transform duration-300
          ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Rearrange KPIs</h2>
          <button onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto h-[calc(100%-130px)] overflow-scroll pb-0">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={(event) => {
              setActiveItem({
                type: event.active.data.current?.type,
                id: String(event.active.id),
                groupId: event.active.data.current?.groupId,
              });
            }}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={groups.map((g) => g.coreParameterId)}
              strategy={verticalListSortingStrategy}
            >
              {groups.map((group, groupIndex) => {
                const isDragging =
                  activeItem?.type === "group" &&
                  activeItem.id === group.coreParameterId;

                const sequenceOffset = groups
                  .slice(0, groupIndex)
                  .reduce((acc, g) => acc + g.kpis.length, 0);

                return (
                  <div
                    key={group.coreParameterId}
                    className={`border rounded-md mb-4 transition-all duration-200 ${
                      isDragging
                        ? "opacity-30 scale-95 rotate-1"
                        : "opacity-100 scale-100 rotate-0"
                    }`}
                  >
                    <SortableItem id={group.coreParameterId} type="group">
                      <div className="cursor-grab active:cursor-grabbing">
                        <div className="bg-blue-50 px-3 py-2 font-semibold flex items-center gap-2 rounded-t-md">
                          <span className="text-gray-400">⋮⋮</span>
                          {group.coreParameterName}
                        </div>

                        <div
                          className={`${isDragging ? "pointer-events-none" : ""}`}
                        >
                          <SortableContext
                            items={group.kpis.map((k) => k.kpiId)}
                            strategy={verticalListSortingStrategy}
                          >
                            {group.kpis.map((kpi, index) => {
                              const sequenceNumber = sequenceOffset + index + 1;
                              const isDraggingKpi =
                                activeItem?.type === "kpi" &&
                                activeItem.id === kpi.kpiId;

                              return (
                                <SortableItem
                                  key={kpi.kpiId}
                                  id={kpi.kpiId}
                                  type="kpi"
                                  groupId={group.coreParameterId}
                                >
                                  <div
                                    className={`flex items-center gap-2 py-2 pl-8 border-t ${
                                      isDraggingKpi ? "opacity-40" : ""
                                    } ${
                                      index === group.kpis.length - 1
                                        ? "rounded-b-md"
                                        : ""
                                    } ${
                                      !isDragging
                                        ? "cursor-grab active:cursor-grabbing"
                                        : "cursor-default"
                                    }`}
                                  >
                                    <span className="text-gray-400">⋮⋮</span>
                                    <div className="flex justify-between w-full pr-4">
                                      <span>{kpi.kpiName}</span>
                                      <div>{sequenceNumber}</div>
                                    </div>
                                  </div>
                                </SortableItem>
                              );
                            })}
                          </SortableContext>
                        </div>
                      </div>
                    </SortableItem>
                  </div>
                );
              })}
            </SortableContext>

            <DragOverlay
              dropAnimation={null}
              style={{ transformOrigin: "top left" }}
            >
              {activeItem ? (
                activeItem.type === "group" ? (
                  renderGroupOverlay(activeItem.id)
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 border shadow-2xl rounded-md bg-white transform rotate-1 scale-105 w-fit max-w-[400px]">
                    <span className="text-gray-400 flex-shrink-0">⋮⋮</span>
                    <span className="truncate">
                      {groups
                        .flatMap((g) => g.kpis)
                        .find((k) => k.kpiId === activeItem.id)?.kpiName ||
                        "KPI"}
                    </span>
                  </div>
                )
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>

        <div className="flex items-center justify-between p-4 border-b">
          <button
            onClick={() => {
              const kpiIds = groups.flatMap((g) => g.kpis.map((k) => k.kpiId));
              handleUpdateKpi(kpiIds);
            }}
            className="bg-blue-600 text-white px-4 py-2 mr-3 rounded-md hover:bg-blue-700"
          >
            Submit
          </button>
        </div>
      </div>
    </>
  );
}
