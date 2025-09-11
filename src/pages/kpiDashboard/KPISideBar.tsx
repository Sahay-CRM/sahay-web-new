import { useState } from "react";
import { X, ChevronUp, ChevronDown } from "lucide-react";
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

  const moveGroupUp = (groupIndex: number) => {
    if (groupIndex > 0) {
      setGroups((prev) => {
        const newGroups = [...prev];
        [newGroups[groupIndex - 1], newGroups[groupIndex]] = [
          newGroups[groupIndex],
          newGroups[groupIndex - 1],
        ];
        return newGroups;
      });
    }
  };

  const moveGroupDown = (groupIndex: number) => {
    if (groupIndex < groups.length - 1) {
      setGroups((prev) => {
        const newGroups = [...prev];
        [newGroups[groupIndex], newGroups[groupIndex + 1]] = [
          newGroups[groupIndex + 1],
          newGroups[groupIndex],
        ];
        return newGroups;
      });
    }
  };

  const moveKpiUp = (groupIndex: number, kpiIndex: number) => {
    if (kpiIndex > 0) {
      setGroups((prev) => {
        const newGroups = [...prev];
        const newKpis = [...newGroups[groupIndex].kpis];
        [newKpis[kpiIndex - 1], newKpis[kpiIndex]] = [
          newKpis[kpiIndex],
          newKpis[kpiIndex - 1],
        ];
        newGroups[groupIndex] = { ...newGroups[groupIndex], kpis: newKpis };
        return newGroups;
      });
    }
  };

  const moveKpiDown = (groupIndex: number, kpiIndex: number) => {
    const group = groups[groupIndex];
    if (kpiIndex < group.kpis.length - 1) {
      setGroups((prev) => {
        const newGroups = [...prev];
        const newKpis = [...newGroups[groupIndex].kpis];
        [newKpis[kpiIndex], newKpis[kpiIndex + 1]] = [
          newKpis[kpiIndex + 1],
          newKpis[kpiIndex],
        ];
        newGroups[groupIndex] = { ...newGroups[groupIndex], kpis: newKpis };
        return newGroups;
      });
    }
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
          {groups.map((group, groupIndex) => {
            const sequenceOffset = groups
              .slice(0, groupIndex)
              .reduce((acc, g) => acc + g.kpis.length, 0);

            return (
              <div
                key={group.coreParameterId}
                className="border rounded-md mb-4 transition-all duration-200"
              >
                <div className="bg-blue-50 px-3 py-0.5 font-semibold flex items-center gap-2 rounded-t-md justify-between">
                  <div className="flex items-center gap-2">
                    {group.coreParameterName}
                  </div>
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => moveGroupUp(groupIndex)}
                      disabled={groupIndex === 0}
                      className={`p-0 rounded ${
                        groupIndex === 0
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-gray-600 hover:text-blue-600 hover:bg-blue-100"
                      }`}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => moveGroupDown(groupIndex)}
                      disabled={groupIndex === groups.length - 1}
                      className={`p-0 rounded ${
                        groupIndex === groups.length - 1
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-gray-600 hover:text-blue-600 hover:bg-blue-100"
                      }`}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div>
                  {group.kpis.map((kpi, kpiIndex) => {
                    const sequenceNumber = sequenceOffset + kpiIndex + 1;

                    return (
                      <div
                        key={kpi.kpiId}
                        className={`flex items-center pl-3 pr-2 border-t ${
                          kpiIndex === group.kpis.length - 1
                            ? "rounded-b-md"
                            : ""
                        }`}
                      >
                        <div className="flex justify-between w-full items-center ml-4">
                          <div>
                            {sequenceNumber}
                            <span className="ml-2">{kpi.kpiName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex flex-col items-center">
                              <button
                                onClick={() => moveKpiUp(groupIndex, kpiIndex)}
                                disabled={kpiIndex === 0}
                                className={`p-1 rounded ${
                                  kpiIndex === 0
                                    ? "text-gray-300 cursor-not-allowed"
                                    : "text-gray-600 hover:text-blue-600 hover:bg-blue-100"
                                }`}
                              >
                                <ChevronUp className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() =>
                                  moveKpiDown(groupIndex, kpiIndex)
                                }
                                disabled={kpiIndex === group.kpis.length - 1}
                                className={`p-1 rounded ${
                                  kpiIndex === group.kpis.length - 1
                                    ? "text-gray-300 cursor-not-allowed"
                                    : "text-gray-600 hover:text-blue-600 hover:bg-blue-100"
                                }`}
                              >
                                <ChevronDown className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
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
