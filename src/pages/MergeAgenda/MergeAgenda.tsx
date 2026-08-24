import { useEffect, useState, useMemo } from "react";
import { FormProvider, useForm, Controller } from "react-hook-form";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { Button } from "@/components/ui/button";
import {
  useGetallIssues,
  useGetallObjectives,
  useExecuteAgendaMerge,
  useGetAgendaLinkedData,
  type AgendaLinkedData,
} from "@/features/api/detailMeeting";
import { useSelector } from "react-redux";
import { getUserPermission } from "@/features/selectors/auth.selector";
import PageNotAccess from "@/pages/PageNoAccess";
import { toast } from "sonner";
import SearchDropdown from "@/components/shared/Form/SearchDropdown";
import ModalData from "@/components/shared/Modal/ModalData";
import { GitMerge, Layers, FolderDot, BarChart3, Calendar, AlertTriangle } from "lucide-react";

export interface AgendaMergeItem {
  issueObjectiveId: string;
  ioType: "ISSUE" | "OBJECTIVE";
  name: string;
}

const TYPE_OPTIONS = [
  { value: "ISSUE", label: "Issue" },
  { value: "OBJECTIVE", label: "Objective" },
];

export default function MergeAgenda() {
  const { setBreadcrumbs } = useBreadcrumbs();
  
  // Use AGENDA_MURGE permission with a fallback for dev/testing ease
  const permission = useSelector(getUserPermission)?.AGENDA_MURGE; 

  useEffect(() => {
    setBreadcrumbs([{ label: "Merge Agenda", href: "" }]);
  }, [setBreadcrumbs]);

  const methods = useForm({
    defaultValues: {
      sourceType: "" as "ISSUE" | "OBJECTIVE" | "",
      sourceAgendaId: "",
      targetType: "" as "ISSUE" | "OBJECTIVE" | "",
      targetAgendaId: "",
    },
  });

  const {
    watch,
    setValue,
    control,
    formState: { errors },
    reset,
  } = methods;

  const sourceType = watch("sourceType");
  const sourceAgendaId = watch("sourceAgendaId");
  const targetType = watch("targetType");
  const targetAgendaId = watch("targetAgendaId");

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Fetch source agendas dynamically by type
  const { data: sourceIssuesRes, isLoading: isLoadingSourceIssues } = useGetallIssues({
    enable: sourceType === "ISSUE",
  });
  const { data: sourceObjectivesRes, isLoading: isLoadingSourceObjectives } = useGetallObjectives({
    enable: sourceType === "OBJECTIVE",
  });

  const sourceAgendas = useMemo(() => {
    if (sourceType === "ISSUE") {
      return (sourceIssuesRes?.data || []).map((issue) => ({
        issueObjectiveId: issue.issueId || "",
        ioType: "ISSUE" as const,
        name: issue.issueName || "",
      }));
    }
    if (sourceType === "OBJECTIVE") {
      return (sourceObjectivesRes?.data || []).map((obj) => ({
        issueObjectiveId: obj.objectiveId || "",
        ioType: "OBJECTIVE" as const,
        name: obj.objectiveName || "",
      }));
    }
    return [];
  }, [sourceType, sourceIssuesRes, sourceObjectivesRes]);

  // Fetch target agendas dynamically by type
  const { data: targetIssuesRes, isLoading: isLoadingTargetIssues } = useGetallIssues({
    enable: targetType === "ISSUE",
  });
  const { data: targetObjectivesRes, isLoading: isLoadingTargetObjectives } = useGetallObjectives({
    enable: targetType === "OBJECTIVE",
  });

  const targetAgendas = useMemo(() => {
    if (targetType === "ISSUE") {
      return (targetIssuesRes?.data || []).map((issue) => ({
        issueObjectiveId: issue.issueId || "",
        ioType: "ISSUE" as const,
        name: issue.issueName || "",
      }));
    }
    if (targetType === "OBJECTIVE") {
      return (targetObjectivesRes?.data || []).map((obj) => ({
        issueObjectiveId: obj.objectiveId || "",
        ioType: "OBJECTIVE" as const,
        name: obj.objectiveName || "",
      }));
    }
    return [];
  }, [targetType, targetIssuesRes, targetObjectivesRes]);

  const isLoadingSourceAgendas = sourceType === "ISSUE" ? isLoadingSourceIssues : isLoadingSourceObjectives;
  const isLoadingTargetAgendas = targetType === "ISSUE" ? isLoadingTargetIssues : isLoadingTargetObjectives;

  // Reset selected agenda IDs when their parent type selections change
  useEffect(() => {
    setValue("sourceAgendaId", "");
  }, [sourceType, setValue]);

  useEffect(() => {
    setValue("targetAgendaId", "");
  }, [targetType, setValue]);

  // Source Agenda dropdown selection options
  const sourceAgendaOptions = useMemo(() => {
    return sourceAgendas.map((agenda) => ({
      value: agenda.issueObjectiveId,
      label: agenda.name,
    }));
  }, [sourceAgendas]);

  // Target Agenda dropdown selection options (excludes source if same type/ID to prevent self-merge)
  const targetAgendaOptions = useMemo(() => {
    return targetAgendas
      .filter((agenda) => {
        if (sourceType === targetType && agenda.issueObjectiveId === sourceAgendaId) {
          return false;
        }
        return true;
      })
      .map((agenda) => ({
        value: agenda.issueObjectiveId,
        label: agenda.name,
      }));
  }, [targetAgendas, sourceType, targetType, sourceAgendaId]);

  // Reset target agenda selection if it becomes identical to the source selection
  useEffect(() => {
    if (sourceType === targetType && targetAgendaId && targetAgendaId === sourceAgendaId) {
      setValue("targetAgendaId", "");
    }
  }, [sourceType, targetType, sourceAgendaId, targetAgendaId, setValue]);

  // Find details for selected source and target agendas
  const selectedSourceAgenda = useMemo(() => {
    return sourceAgendas.find((a) => a.issueObjectiveId === sourceAgendaId);
  }, [sourceAgendas, sourceAgendaId]);

  const selectedTargetAgenda = useMemo(() => {
    return targetAgendas.find((a) => a.issueObjectiveId === targetAgendaId);
  }, [targetAgendas, targetAgendaId]);

  // Fetch dynamic linked data/counts for source agenda from real backend
  const { data: sourceLinkedData, isLoading: isLoadingSourceData } = useGetAgendaLinkedData({
    agendaId: sourceAgendaId,
    ioType: selectedSourceAgenda?.ioType || "",
    enable: !!sourceAgendaId && !!selectedSourceAgenda,
  });

  // Fetch dynamic linked data/counts for target agenda from real backend
  const { data: targetLinkedData, isLoading: isLoadingTargetData } = useGetAgendaLinkedData({
    agendaId: targetAgendaId,
    ioType: selectedTargetAgenda?.ioType || "",
    enable: !!targetAgendaId && !!selectedTargetAgenda,
  });

  // Hook for executing the merge
  const { mutate: executeMerge, isPending: isMerging } = useExecuteAgendaMerge();

  const handleExecuteMerge = () => {
    if (!sourceAgendaId || !targetAgendaId) {
      toast.error("Please select both source and target agendas");
      return;
    }
    setIsConfirmModalOpen(true);
  };

  const handleConfirmMerge = () => {
    setIsConfirmModalOpen(false);
    executeMerge(
      {
        sourceAgendaId,
        targetAgendaId,
      },
      {
        onSuccess: () => {
          reset();
        },
      }
    );
  };

  const handleReset = () => {
    reset();
  };

  if (!permission || permission.View === false) {
    return <PageNotAccess />;
  }

  const isAnyLoading =
    isLoadingSourceAgendas ||
    isLoadingTargetAgendas ||
    isLoadingSourceData ||
    isLoadingTargetData;

  // Helper to render the linked lists of Meetings, Tasks, Projects, KPIs in a highly minimal, compact list format
  const renderLinkedLists = (data?: AgendaLinkedData) => {
    if (!data) return null;
    if (data.totalLinkedCount === 0) {
      return (
        <div className="text-xs text-gray-400 py-3 text-center bg-gray-50/40 border border-dashed border-gray-150 rounded-lg">
          No linked items found.
        </div>
      );
    }

    return (
      <div className="space-y-3.5">
        {/* Meetings List */}
        {data.meetings && data.meetings.count > 0 && (
          <div>
            <h5 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1 text-left">
              <Calendar className="h-3 w-3 text-indigo-500 shrink-0" />
              Meetings ({data.meetings.count})
            </h5>
            <div className="max-h-[160px] overflow-y-auto border border-gray-100 rounded-md bg-white divide-y divide-gray-50 scrollbar-none">
              {data.meetings.names.map((name, i) => (
                <div
                  key={i}
                  className="text-sm text-black px-2.5 py-1.5 hover:bg-gray-50/50 transition-colors text-left truncate"
                  title={name}
                >
                  {name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tasks List */}
        {data.tasks && data.tasks.count > 0 && (
          <div>
            <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1 text-left">
              <Layers className="h-3 w-3 text-emerald-500 shrink-0" />
              Tasks ({data.tasks.count})
            </h5>
            <div className="max-h-[160px] overflow-y-auto border border-gray-100 rounded-md bg-white divide-y divide-gray-50 scrollbar-none">
              {data.tasks.names.map((name, i) => (
                <div
                  key={i}
                  className="text-sm text-black px-2.5 py-1.5 hover:bg-gray-50/50 transition-colors text-left truncate"
                  title={name}
                >
                  {name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects List */}
        {data.projects && data.projects.count > 0 && (
          <div>
            <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1 text-left">
              <FolderDot className="h-3 w-3 text-sky-500 shrink-0" />
              Projects ({data.projects.count})
            </h5>
            <div className="max-h-[160px] overflow-y-auto border border-gray-100 rounded-md bg-white divide-y divide-gray-50 scrollbar-none">
              {data.projects.names.map((name, i) => (
                <div
                  key={i}
                  className="text-sm text-black px-2.5 py-1.5 hover:bg-gray-50/50 transition-colors text-left truncate"
                  title={name}
                >
                  {name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* KPIs List */}
        {data.kpis && data.kpis.count > 0 && (
          <div>
            <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1 text-left">
              <BarChart3 className="h-3 w-3 text-amber-500 shrink-0" />
              KPIs ({data.kpis.count})
            </h5>
            <div className="max-h-[160px] overflow-y-auto border border-gray-100 rounded-md bg-white divide-y divide-gray-50 scrollbar-none">
              {data.kpis.names.map((name, i) => (
                <div
                  key={i}
                  className="text-sm text-black px-2.5 py-1.5 hover:bg-gray-50/50 transition-colors text-left truncate"
                  title={name}
                >
                  {name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <FormProvider {...methods}>
      <div className="w-full px-4 py-8 max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gray-50/50 px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <GitMerge className="h-6 w-6 text-indigo-600" />
                <h1 className="text-xl font-bold text-gray-900">Agenda Merge</h1>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Merge tasks, projects, and KPIs from one agenda (Issue/Objective) into a target agenda.
              </p>
            </div>
          </div>

          <div className="p-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Source Selection Panel */}
              <div className="space-y-4 text-left">
                <div className="flex gap-4 items-end">
                  {/* Source Type Dropdown */}
                  <div className="w-[140px] shrink-0 space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Source Type
                    </label>
                    <Controller
                      control={control}
                      name="sourceType"
                      rules={{ required: "Please select source type" }}
                      render={({ field }) => (
                        <SearchDropdown
                          options={TYPE_OPTIONS}
                          selectedValues={field.value ? [field.value] : []}
                          onSelect={(value) => {
                            field.onChange(value.value);
                            setValue("sourceType", value.value as "OBJECTIVE" | "ISSUE");
                          }}
                          placeholder="Select Type"
                          error={errors.sourceType}
                          className="w-full"
                          onSearchChange={() => {}}
                          isSearchable={false}
                          isCrossShow={false}
                        />
                      )}
                    />
                  </div>

                  {/* Source Agenda Dropdown */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Source Agenda
                    </label>
                    <Controller
                      control={control}
                      name="sourceAgendaId"
                      rules={{ required: "Please select source agenda" }}
                      render={({ field }) => (
                        <SearchDropdown
                          options={sourceAgendaOptions}
                          selectedValues={field.value ? [field.value] : []}
                          onSelect={(value) => {
                            field.onChange(value.value);
                            setValue("sourceAgendaId", value.value);
                          }}
                          placeholder="Select agenda to merge"
                          error={errors.sourceAgendaId}
                          disabled={!sourceType}
                          className="w-full"
                          onSearchChange={() => {}}
                        />
                      )}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-400">
                  The agenda whose items will be transferred.
                </p>
              </div>

              {/* Target Selection Panel */}
              <div className="space-y-4 text-left">
                <div className="flex gap-4 items-end">
                  {/* Target Type Dropdown */}
                  <div className="w-[140px] shrink-0 space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Target Type
                    </label>
                    <Controller
                      control={control}
                      name="targetType"
                      rules={{ required: "Please select target type" }}
                      render={({ field }) => (
                        <SearchDropdown
                          options={TYPE_OPTIONS}
                          selectedValues={field.value ? [field.value] : []}
                          onSelect={(value) => {
                            field.onChange(value.value);
                            setValue("targetType", value.value as "OBJECTIVE" | "ISSUE");
                          }}
                          placeholder="Select type"
                          error={errors.targetType}
                          className="w-full"
                          onSearchChange={() => {}}
                          isSearchable={false}
                          isCrossShow={false}
                        />
                      )}
                    />
                  </div>

                  {/* Target Agenda Dropdown */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Target Agenda
                    </label>
                    <Controller
                      control={control}
                      name="targetAgendaId"
                      rules={{ required: "Please select target agenda" }}
                      render={({ field }) => (
                        <SearchDropdown
                          options={targetAgendaOptions}
                          selectedValues={field.value ? [field.value] : []}
                          onSelect={(value) => {
                            field.onChange(value.value);
                            setValue("targetAgendaId", value.value);
                          }}
                          placeholder="Select target agenda"
                          error={errors.targetAgendaId}
                          disabled={!targetType}
                          className="w-full"
                          onSearchChange={() => {}}
                        />
                      )}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-400">
                  The agenda that will absorb the merged items.
                </p>
              </div>
            </div>

            {/* Side-by-Side Details Panels (Minimal & Compact) */}
            {(selectedSourceAgenda || selectedTargetAgenda) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-100">
                {/* Source Agenda Panel */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5 text-left">
                    Source Details
                  </h3>
                  {selectedSourceAgenda ? (
                    <div className="bg-white rounded-lg p-4 border border-gray-200/80 relative overflow-hidden text-left shadow-sm transition-all duration-200">
                      <div className="mb-3.5 pb-2 border-b border-gray-100 flex justify-between items-center">
                        <h4 className="text-sm font-bold text-gray-900 truncate flex-1 pr-2">
                          {selectedSourceAgenda.name}
                        </h4>
                        <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide bg-gray-50 px-2 py-0.5 rounded border border-gray-100 shrink-0">
                          {selectedSourceAgenda.ioType}
                        </span>
                      </div>

                      {/* Linked Data Names List */}
                      {isLoadingSourceData ? (
                        <div className="text-xs text-gray-500 py-6 text-center">Loading linked items...</div>
                      ) : (
                        renderLinkedLists(sourceLinkedData)
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-40 bg-gray-50/30 border border-dashed border-gray-200 rounded-lg text-xs text-gray-400">
                      Select a source agenda to see details
                    </div>
                  )}
                </div>

                {/* Target Agenda Panel */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5 text-left">
                    Target Details
                  </h3>
                  {selectedTargetAgenda ? (
                    <div className="bg-white rounded-lg p-4 border border-gray-200/80 relative overflow-hidden text-left shadow-sm transition-all duration-200">
                      <div className="mb-3.5 pb-2 border-b border-gray-100 flex justify-between items-center">
                        <h4 className="text-sm font-bold text-gray-900 truncate flex-1 pr-2">
                          {selectedTargetAgenda.name}
                        </h4>
                        <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide bg-gray-50 px-2 py-0.5 rounded border border-gray-100 shrink-0">
                          {selectedTargetAgenda.ioType}
                        </span>
                      </div>

                      {/* Linked Data Names List */}
                      {isLoadingTargetData ? (
                        <div className="text-xs text-gray-500 py-6 text-center">Loading linked items...</div>
                      ) : (
                        renderLinkedLists(targetLinkedData)
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-40 bg-gray-50/30 border border-dashed border-gray-200 rounded-lg text-xs text-gray-400">
                      Select a target agenda to see details
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Warning Section */}
            {/* {sourceAgendaId && targetAgendaId && selectedSourceAgenda && selectedTargetAgenda && (
              <div className="bg-amber-50/60 border border-amber-100/70 rounded-xl p-4 flex gap-3 transition-all duration-300">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800 text-left">
                  <p className="font-bold mb-1">Important Action Confirmation:</p>
                  This action will reassign all meetings ({sourceLinkedData?.meetings?.count ?? 0}), tasks ({sourceLinkedData?.tasks?.count ?? 0}), projects ({sourceLinkedData?.projects?.count ?? 0}), and KPIs ({sourceLinkedData?.kpis?.count ?? 0}) currently associated with <b>{selectedSourceAgenda.name}</b> directly into <b>{selectedTargetAgenda.name}</b>.
                  <p className="mt-1.5 text-xs text-amber-700">
                    * The source agenda will be merged. This process cannot be automatically undone.
                  </p>
                </div>
              </div>
            )} */}

            {/* Form Actions */}
            <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isMerging || isAnyLoading}
              >
                Reset
              </Button>
              {permission.Add && (
                <Button
                  type="button"
                  onClick={handleExecuteMerge}
                  disabled={!sourceAgendaId || !targetAgendaId || isMerging || isAnyLoading}
                  isLoading={isMerging}
                  className="px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors"
                >
                  Merge Agenda
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        <ModalData
          isModalOpen={isConfirmModalOpen}
          modalClose={() => setIsConfirmModalOpen(false)}
          modalTitle="Confirm Merge"
          containerClass="min-w-[400px] max-w-[460px]"
          buttons={[
            {
              btnText: "Cancel",
              buttonCss: "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-205",
              btnClick: () => setIsConfirmModalOpen(false),
            },
            {
              btnText: "Merge Agenda",
              buttonCss: "bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-700",
              isLoading: isMerging,
              btnClick: handleConfirmMerge,
            },
          ]}
        >
          <div className="space-y-3.5 mt-2 text-left text-sm text-gray-600">
            <p>
              Are you sure you want to merge <b>{selectedSourceAgenda?.name}</b> into <b>{selectedTargetAgenda?.name}</b>?
            </p>
            <p className="text-xs text-red-500 bg-red-50/50 border border-red-100 rounded-lg p-2.5 flex gap-1.5 items-start">
              <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <span>
                This will reassign all associated items (meetings, tasks, projects, KPIs). This action cannot be undone.
              </span>
            </p>
          </div>
        </ModalData>
      </div>
    </FormProvider>
  );
}
