import { useEffect, useState, useMemo } from "react";
import { FormProvider, useForm, Controller } from "react-hook-form";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { Button } from "@/components/ui/button";
import {
  useGetDetailMeetingAll,
  useGetDetailMeetingAgenda,
  useCloneMeetingAgenda,
} from "@/features/api/detailMeeting";
import { useSelector } from "react-redux";
import { getUserPermission } from "@/features/selectors/auth.selector";
import PageNotAccess from "@/pages/PageNoAccess";
import { toast } from "sonner";
import SearchDropdown from "@/components/shared/Form/SearchDropdown";
import FormCheckbox from "@/components/shared/Form/FormCheckbox/FormCheckbox";

export default function CloneAgenda() {
  const { setBreadcrumbs } = useBreadcrumbs();
  const permission = useSelector(getUserPermission).MEETING_LIST;

  useEffect(() => {
    setBreadcrumbs([{ label: "Clone Agenda", href: "" }]);
  }, [setBreadcrumbs]);

  const methods = useForm({
    defaultValues: {
      sourceMeetingId: "",
      targetMeetingId: "",
    },
  });

  const {
    watch,
    setValue,
    control,
    formState: { errors },
  } = methods;

  const sourceMeetingId = watch("sourceMeetingId");
  const targetMeetingId = watch("targetMeetingId");

  const [selectedAgendaIds, setSelectedAgendaIds] = useState<string[]>([]);

  // Fetch all meetings for source dropdown
  const { data: sourceMeetingsRes, isLoading: isSourceMeetingsLoading } = useGetDetailMeetingAll({
    filter: {},
  });

  // Fetch only NOT STARTED meetings for target dropdown
  const { data: targetMeetingsRes, isLoading: isTargetMeetingsLoading } = useGetDetailMeetingAll({
    filter: {
      detailMeetingStatus: "NOT_STARTED",
    },
  });

  // Source Meeting Dropdown Options
  const sourceMeetingOptions = useMemo(() => {
    return (
      sourceMeetingsRes?.data?.map((m) => ({
        value: m.meetingId || "",
        label: m.meetingName || "Unnamed Meeting",
      })) || []
    );
  }, [sourceMeetingsRes]);

  // Target Meeting Dropdown Options (exclude the selected source meeting)
  const targetMeetingOptions = useMemo(() => {
    return (
      targetMeetingsRes?.data
        ?.filter((m) => !sourceMeetingId || m.meetingId !== sourceMeetingId)
        .map((m) => ({
          value: m.meetingId || "",
          label: m.meetingName || "Unnamed Meeting",
        })) || []
    );
  }, [targetMeetingsRes, sourceMeetingId]);

  // Fetch Agenda (Issues & Objectives) based on Source Meeting
  const { data: agendaItems = [], isLoading: isAgendaLoading } = useGetDetailMeetingAgenda({
    filter: { meetingId: sourceMeetingId },
    enable: !!sourceMeetingId,
  });

  const issues = useMemo(() => {
    return agendaItems.filter((item) => item.ioType === "ISSUE");
  }, [agendaItems]);

  const objectives = useMemo(() => {
    return agendaItems.filter((item) => item.ioType === "OBJECTIVE");
  }, [agendaItems]);

  // Reset selected agendas when source meeting changes
  useEffect(() => {
    setSelectedAgendaIds([]);
  }, [sourceMeetingId]);

  // Reset target meeting if it becomes invalid (e.g. same as source meeting)
  useEffect(() => {
    if (targetMeetingId && targetMeetingId === sourceMeetingId) {
      setValue("targetMeetingId", "");
    }
  }, [sourceMeetingId, targetMeetingId, setValue]);

  const { mutate: cloneAgenda, isPending: isCloning } = useCloneMeetingAgenda();

  const isExecuting = isSourceMeetingsLoading || isTargetMeetingsLoading || isCloning;

  const isAllSelected =
    agendaItems.length > 0 && selectedAgendaIds.length === agendaItems.length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAgendaIds(agendaItems.map((item) => item.issueObjectiveId));
    } else {
      setSelectedAgendaIds([]);
    }
  };

  const handleToggleAgenda = (id: string, checked: boolean) => {
    setSelectedAgendaIds((prev) =>
      checked ? [...prev, id] : prev.filter((item) => item !== id)
    );
  };

  const handleExecuteClone = () => {
    if (!sourceMeetingId || !targetMeetingId) {
      toast.error("Please select both source and target meetings");
      return;
    }
    if (selectedAgendaIds.length === 0) {
      toast.error("Please select at least one agenda item to clone");
      return;
    }

    const issueIds: string[] = [];
    const objectiveIds: string[] = [];

    selectedAgendaIds.forEach((id) => {
      const item = agendaItems.find((a) => a.issueObjectiveId === id);
      if (item) {
        if (item.ioType === "ISSUE") {
          const issueId = item.issueId || item.issueObjectiveId;
          if (issueId) issueIds.push(issueId);
        } else if (item.ioType === "OBJECTIVE") {
          const objectiveId = item.objectiveId || item.issueObjectiveId;
          if (objectiveId) objectiveIds.push(objectiveId);
        }
      }
    });

    cloneAgenda(
      {
        targetMeetingId,
        payload: {
          sourceMeetingId,
          issueIds,
          objectiveIds,
        },
      },
      {
        onSuccess: () => {
          // Reset selection and target meeting dropdown
          setValue("targetMeetingId", "");
          setSelectedAgendaIds([]);
        },
      }
    );
  };

  const handleReset = () => {
    methods.reset();
    setSelectedAgendaIds([]);
  };

  if (!permission || permission.View === false) {
    return <PageNotAccess />;
  }

  return (
    <FormProvider {...methods}>
      <div className="w-full px-4 py-8 max-w-5xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Clone Agenda</h1>
              <p className="text-sm text-gray-500 mt-1">
                Clone agenda items (Issues & Objectives) from a source meeting to a target meeting.
              </p>
            </div>
          </div>

          <div className="p-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Source Meeting Selection */}
              <div className="space-y-3">
                <div className="flex justify-between items-end h-7 mb-3">
                  <label className="text-sm font-semibold text-gray-700">
                    Source Meeting
                  </label>
                </div>
                <Controller
                  control={control}
                  name="sourceMeetingId"
                  rules={{ required: "Please select source meeting" }}
                  render={({ field }) => (
                    <SearchDropdown
                      options={sourceMeetingOptions}
                      selectedValues={field.value ? [field.value] : []}
                      onSelect={(value) => {
                        field.onChange(value.value);
                        setValue("sourceMeetingId", value.value);
                      }}
                      placeholder="Select source meeting"
                      error={errors.sourceMeetingId}
                      className="w-full"
                      onSearchChange={() => {}}
                    />
                  )}
                />
                <p className="text-xs text-gray-400">
                  The meeting from which agendas will be cloned.
                </p>
              </div>

              {/* Target Meeting Selection */}
              <div className="space-y-3">
                <div className="flex justify-between items-end h-7 mb-3">
                  <label className="text-sm font-semibold text-gray-700">
                    Target Meeting
                  </label>
                </div>
                <Controller
                  control={control}
                  name="targetMeetingId"
                  rules={{ required: "Please select target meeting" }}
                  render={({ field }) => (
                    <SearchDropdown
                      options={targetMeetingOptions}
                      selectedValues={field.value ? [field.value] : []}
                      onSelect={(value) => {
                        field.onChange(value.value);
                        setValue("targetMeetingId", value.value);
                      }}
                      placeholder="Select target meeting"
                      error={errors.targetMeetingId}
                      disabled={!sourceMeetingId}
                      className="w-full"
                      onSearchChange={() => {}}
                    />
                  )}
                />
                <p className="text-xs text-gray-400">
                  The meeting to which cloned agendas will be added.
                </p>
              </div>
            </div>

            {/* Agenda List Section */}
            {sourceMeetingId && (
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-gray-700">
                    Agenda Items ({agendaItems.length})
                  </label>
                  {agendaItems.length > 0 && (
                    <div className="flex items-center gap-2">
                      <FormCheckbox
                        id="select-all-agendas"
                        checked={isAllSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        containerClass="mt-0 mr-1"
                      />
                      <span className="text-sm font-medium text-gray-600">
                        Select All / Share All
                      </span>
                    </div>
                  )}
                </div>

                {isAgendaLoading ? (
                  <div className="text-center py-6 text-sm text-gray-500">
                    Loading agenda items...
                  </div>
                ) : agendaItems.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 border border-gray-100 rounded-lg text-gray-400 text-sm">
                    No agenda items found for the selected Source Meeting.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: Issues */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-gray-800 border-b pb-2">
                        Issues ({issues.length})
                      </h3>
                      {issues.length === 0 ? (
                        <div className="text-xs text-gray-400 py-4 text-center bg-gray-50/50 border border-dashed rounded-lg">
                          No issues
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                          {issues.map((item) => (
                            <div
                              key={item.issueObjectiveId}
                              className="flex items-center p-3 rounded-lg bg-gray-50 border border-gray-100 hover:bg-gray-100/50 transition-colors"
                            >
                              <FormCheckbox
                                id={`agenda-${item.issueObjectiveId}`}
                                checked={selectedAgendaIds.includes(item.issueObjectiveId)}
                                onChange={(e) =>
                                  handleToggleAgenda(item.issueObjectiveId, e.target.checked)
                                }
                                containerClass="mt-0 mr-3 shrink-0"
                              />
                              <span className="text-sm font-medium text-gray-700 truncate" title={item.name}>
                                {item.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right Column: Objectives */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-gray-800 border-b pb-2">
                        Objectives ({objectives.length})
                      </h3>
                      {objectives.length === 0 ? (
                        <div className="text-xs text-gray-400 py-4 text-center bg-gray-50/50 border border-dashed rounded-lg">
                          No objectives
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                          {objectives.map((item) => (
                            <div
                              key={item.issueObjectiveId}
                              className="flex items-center p-3 rounded-lg bg-gray-50 border border-gray-100 hover:bg-gray-100/50 transition-colors"
                            >
                              <FormCheckbox
                                id={`agenda-${item.issueObjectiveId}`}
                                checked={selectedAgendaIds.includes(item.issueObjectiveId)}
                                onChange={(e) =>
                                  handleToggleAgenda(item.issueObjectiveId, e.target.checked)
                                }
                                containerClass="mt-0 mr-3 shrink-0"
                              />
                              <span className="text-sm font-medium text-gray-700 truncate" title={item.name}>
                                {item.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Warning Section */}
            {sourceMeetingId && targetMeetingId && selectedAgendaIds.length > 0 && (
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex gap-3">
                <div className="text-amber-500 text-xl">⚠️</div>
                <div className="text-sm text-amber-800">
                  <p className="font-bold mb-1">Important Note:</p>
                  This action will copy the selected agenda items from the source meeting and add them to the target meeting.
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={isExecuting}
              >
                Reset
              </Button>
              <Button
                onClick={handleExecuteClone}
                disabled={
                  !sourceMeetingId ||
                  !targetMeetingId ||
                  isExecuting ||
                  selectedAgendaIds.length === 0
                }
                isLoading={isExecuting}
                className="px-8"
              >
                Clone Agenda
              </Button>
            </div>
          </div>
        </div>
      </div>
    </FormProvider>
  );
}
