import { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { FormProvider, useForm, Controller } from "react-hook-form";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { Button } from "@/components/ui/button";
import useGetEmployeeDd from "@/features/api/companyEmployee/useGetEmployeeDd";
import useAddOrUpdateEmployee from "@/features/api/companyEmployee/useAddEmployee";
import {
  useExecuteHandover,
  useExecutePartialHandover,
  useGetHandoverStats,
} from "@/features/api/HandOver";
import { useSelector } from "react-redux";
import { getUserPermission } from "@/features/selectors/auth.selector";
import PageNotAccess from "../PageNoAccess";
import { toast } from "sonner";
import { formatEmployeeType } from "@/features/utils/app.utils";
import SearchDropdown from "@/components/shared/Form/SearchDropdown";
import FormCheckbox from "@/components/shared/Form/FormCheckbox/FormCheckbox";
import ModalData from "@/components/shared/Modal/ModalData";

const MODULE_OPTIONS = [
  { value: "tasks", label: "Owned Tasks" },
  { value: "assignedTasks", label: "Assigned Tasks" },
  { value: "projects", label: "Owned Projects" },
  { value: "assignedProjects", label: "Assigned Projects" },
  { value: "meetings", label: "Owned Meetings" },
  { value: "assignedMeetings", label: "Assigned Meetings" },
  { value: "todos", label: "To-dos" },
  { value: "requests", label: "Change Requests" },
  { value: "subordinates", label: "Subordinates" },
];

const ALL_MODULE_VALUES = ["total", ...MODULE_OPTIONS.map((opt) => opt.value)];

export default function HandOverData() {
  const { setBreadcrumbs } = useBreadcrumbs();
  const location = useLocation();
  const preselectedOldUserId =
    (location.state as { oldUserId?: string } | null)?.oldUserId || "";
  const [isPartialMode, setIsPartialMode] = useState(false);
  const permission = useSelector(getUserPermission).HANDOVER;

  useEffect(() => {
    setBreadcrumbs([{ label: "Data Handover", href: "" }]);
  }, [setBreadcrumbs]);

  const methods = useForm({
    defaultValues: {
      oldUserId: preselectedOldUserId,
      newUserId: "",
      selectedModules: [] as string[],
    },
  });

  const {
    watch,
    setValue,
    control,
    formState: { errors },
  } = methods;
  const oldUserId = watch("oldUserId");
  const newUserId = watch("newUserId");
  const selectedModules = watch("selectedModules") || [];

  const { data: statsRes } = useGetHandoverStats({
    userId: oldUserId,
    enabled: !!oldUserId,
  });
  const stats = statsRes?.data;

  // Reset selected modules when oldUserId changes
  useEffect(() => {
    setValue("selectedModules", []);
  }, [oldUserId, setValue]);

  // Fetch employees for dropdowns
  const { data: employeeRes } = useGetEmployeeDd({
    filter: { isBoth: true },
    enable: true,
  });

  const employeeOptions = useMemo(() => {
    return (
      employeeRes?.data?.map((emp) => ({
        value: emp.employeeId,
        label: `${emp.employeeName} (${emp.designationName || formatEmployeeType(emp.employeeType)})`,
      })) || []
    );
  }, [employeeRes?.data]);

  const selectedOldUser = employeeRes?.data?.find(
    (emp) => emp.employeeId === oldUserId,
  );

  // Filter Target User Options based on Source User Type
  const targetUserOptions = useMemo(() => {
    return (
      employeeRes?.data
        ?.filter((emp) => {
          if (emp.employeeId === oldUserId) return false;
          if (!selectedOldUser) return true;

          const sourceRole = selectedOldUser.employeeType;
          const targetRole = emp.employeeType;

          if (sourceRole === "OWNER") return targetRole === "OWNER";
          if (sourceRole === "CONSULTANT") return targetRole === "CONSULTANT";
          if (sourceRole === "EMPLOYEE")
            return targetRole === "EMPLOYEE" || targetRole === "OWNER";
          if (sourceRole === "SAHAYTEAMMATE")
            return (
              targetRole === "SAHAYTEAMMATE" || targetRole === "CONSULTANT"
            );

          return true;
        })
        .map((emp) => ({
          value: emp.employeeId,
          label: `${emp.employeeName} (${emp.designationName || formatEmployeeType(emp.employeeType)})`,
        })) || []
    );
  }, [employeeRes?.data, oldUserId, selectedOldUser]);

  // Reset target user if it becomes invalid after source user change
  useEffect(() => {
    if (
      newUserId &&
      !targetUserOptions.find((opt) => opt.value === newUserId)
    ) {
      setValue("newUserId", "");
    }
  }, [oldUserId, targetUserOptions, newUserId, setValue]);

  const { mutate: executeHandover, isPending: isExecutingFull } =
    useExecuteHandover();
  const { mutate: executePartialHandover, isPending: isExecutingPartial } =
    useExecutePartialHandover();
  const { mutate: updateEmployee, isPending: isDeactivating } =
    useAddOrUpdateEmployee();

  const isExecuting = isExecutingFull || isExecutingPartial || isDeactivating;

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const runHandover = (onSuccess: () => void) => {
    if (isPartialMode) {
      executePartialHandover(
        {
          oldUserId,
          newUserId,
          moduleKey: selectedModules,
        },
        { onSuccess },
      );
    } else {
      executeHandover(
        {
          oldUserId,
          newUserId,
        },
        { onSuccess },
      );
    }
  };

  const handleConfirmHandoverOnly = () => {
    runHandover(() => {
      window.location.reload();
    });
  };

  const handleConfirmHandoverWithInactive = () => {
    runHandover(() => {
      if (!selectedOldUser) {
        window.location.reload();
        return;
      }
      updateEmployee(
        {
          employeeId: selectedOldUser.employeeId,
          isDeactivated: true,
          employeeMobile: selectedOldUser.employeeMobile,
        } as EmployeeData,
        {
          onSuccess: () => {
            window.location.reload();
          },
        },
      );
    });
  };

  const handleExecute = () => {
    if (!oldUserId || !newUserId) return;
    if (isPartialMode && selectedModules.length === 0) {
      toast.error("Please select at least one module for partial handover");
      return;
    }
    setIsConfirmModalOpen(true);
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
              <h1 className="text-xl font-bold text-gray-900">Data Handover</h1>
              <p className="text-sm text-gray-500 mt-1">
                {isPartialMode
                  ? "Transfer specific modules and responsibilities from one user to another."
                  : "Transfer all responsibilities and data from one user to another."}
              </p>
            </div>
            <div className="flex bg-gray-200/70 p-1 rounded-lg gap-1 border border-gray-200">
              <Button
                type="button"
                variant={!isPartialMode ? "default" : "ghost"}
                size="sm"
                className={`text-sm font-medium px-4 py-1.5 h-8 rounded-md transition-all ${!isPartialMode ? "shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
                onClick={() => setIsPartialMode(false)}
              >
                Full Handover
              </Button>
              <Button
                type="button"
                variant={isPartialMode ? "default" : "ghost"}
                size="sm"
                className={`text-sm font-medium px-4 py-1.5 h-8 rounded-md transition-all ${isPartialMode ? "shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
                onClick={() => setIsPartialMode(true)}
              >
                Partial Handover
              </Button>
            </div>
          </div>

          <div className="p-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Old User Selection */}
              <div className="space-y-3">
                <div className="flex justify-between items-end h-7 mb-3">
                  <label className="text-sm font-semibold text-gray-700">
                    Source User (Leaving)
                  </label>
                </div>
                <Controller
                  control={control}
                  name="oldUserId"
                  rules={{ required: "Please select source user" }}
                  render={({ field }) => (
                    <SearchDropdown
                      options={employeeOptions}
                      selectedValues={field.value ? [field.value] : []}
                      onSelect={(value) => {
                        field.onChange(value.value);
                        setValue("oldUserId", value.value);
                      }}
                      placeholder="Select source user"
                      error={errors.oldUserId}
                      className="w-full"
                      onSearchChange={() => {}}
                    />
                  )}
                />
                <p className="text-xs text-gray-400">
                  The user whose data will be transferred.
                </p>
              </div>

              {/* New User Selection */}
              <div className="space-y-3">
                <div className="flex items-end h-7 mb-3">
                  <label className="text-sm font-semibold text-gray-700">
                    Target User (Taking Over)
                  </label>
                </div>
                <Controller
                  control={control}
                  name="newUserId"
                  rules={{ required: "Please select target user" }}
                  render={({ field }) => (
                    <SearchDropdown
                      options={targetUserOptions}
                      selectedValues={field.value ? [field.value] : []}
                      onSelect={(value) => {
                        field.onChange(value.value);
                        setValue("newUserId", value.value);
                      }}
                      placeholder="Select target user"
                      error={errors.newUserId}
                      disabled={!oldUserId}
                      className="w-full"
                      onSearchChange={() => {}}
                    />
                  )}
                />
                <p className="text-xs text-gray-400">
                  The user who will receive all assigned items.
                </p>
              </div>
            </div>

            {/* Impact Stats */}
            {oldUserId && stats && (
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <label className="text-sm font-semibold text-gray-700">
                  Handover Impact
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { key: "total", label: "Total", value: stats.total },
                    { key: "tasks", label: "Owned Tasks", value: stats.tasks },
                    {
                      key: "assignedTasks",
                      label: "Assigned Tasks",
                      value: stats.assignedTasks,
                    },
                    {
                      key: "projects",
                      label: "Owned Projects",
                      value: stats.projects,
                    },
                    {
                      key: "assignedProjects",
                      label: "Assigned Projects",
                      value: stats.assignedProjects,
                    },
                    {
                      key: "meetings",
                      label: "Owned Meetings",
                      value: stats.meetings,
                    },
                    {
                      key: "assignedMeetings",
                      label: "Assigned Meetings",
                      value: stats.assignedMeetings,
                    },
                    { key: "todos", label: "To-dos", value: stats.todos },
                    {
                      key: "requests",
                      label: "Change Requests",
                      value: stats.requests,
                    },
                    {
                      key: "subordinates",
                      label: "Subordinates",
                      value: stats.subordinates,
                    },
                  ].map((stat) => (
                    <div
                      key={stat.key}
                      className="flex justify-between items-center p-3 rounded-lg bg-gray-50 border border-gray-100"
                    >
                      <span className="flex items-center text-sm text-gray-600 font-medium">
                        {isPartialMode && (
                          <FormCheckbox
                            id={`module-${stat.key}`}
                            checked={selectedModules.includes(stat.key)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              if (stat.key === "total") {
                                setValue(
                                  "selectedModules",
                                  checked ? ALL_MODULE_VALUES : [],
                                );
                                return;
                              }
                              const withoutKey = selectedModules.filter(
                                (m) => m !== stat.key && m !== "total",
                              );
                              const next = checked
                                ? [...withoutKey, stat.key]
                                : withoutKey;
                              const allOthersSelected = MODULE_OPTIONS.every(
                                (opt) => next.includes(opt.value),
                              );
                              setValue(
                                "selectedModules",
                                allOthersSelected
                                  ? [...next, "total"]
                                  : next,
                              );
                            }}
                            containerClass="mt-0 mr-2"
                          />
                        )}
                        {stat.label}
                      </span>
                      <span className="text-base font-semibold text-gray-900">
                        {stat.value ?? 0}
                      </span>
                    </div>
                  ))}
                </div>
                {isPartialMode && (
                  <p className="text-xs text-gray-400">
                    Only the checked modules will be transferred to the target
                    user.
                  </p>
                )}
              </div>
            )}

            {/* Warning Section */}
            {oldUserId && newUserId && (
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex gap-3">
                <div className="text-amber-500 text-xl">⚠️</div>
                <div className="text-sm text-amber-800">
                  <p className="font-bold mb-1">Important Note:</p>
                  {isPartialMode ? (
                    <>
                      This action will reassign only the selected modules from{" "}
                      <b>{selectedOldUser?.employeeName}</b> to the selected
                      target user. This process cannot be automatically undone.
                    </>
                  ) : (
                    <>
                      This action will reassign all tasks, projects, meetings,
                      and responsibilities from{" "}
                      <b>{selectedOldUser?.employeeName}</b> to the selected
                      target user. This process cannot be automatically undone.
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => methods.reset()}
                disabled={isExecuting}
              >
                Reset
              </Button>
              <Button
                onClick={handleExecute}
                disabled={
                  !oldUserId ||
                  !newUserId ||
                  isExecuting ||
                  (isPartialMode && selectedModules.length === 0)
                }
                isLoading={isExecuting}
                className="px-8"
              >
                {isPartialMode
                  ? "Execute Partial Handover"
                  : "Execute Handover"}
              </Button>
            </div>
          </div>
        </div>

        <ModalData
          isModalOpen={isConfirmModalOpen}
          modalClose={() => setIsConfirmModalOpen(false)}
          modalTitle="Confirm Handover"
          containerClass="min-w-[400px] max-w-[500px]"
          buttons={
            selectedOldUser?.isDeactivated
              ? [
                  {
                    btnText: "Confirm",
                    isLoading: isExecuting,
                    btnClick: () => {
                      handleConfirmHandoverOnly();
                      setIsConfirmModalOpen(false);
                    },
                  },
                ]
              : [
                  {
                    btnText: "Handover Only",
                    buttonCss:
                      "bg-gray-200 text-black border-gray-300 hover:bg-gray-300",
                    isLoading: isExecuting,
                    btnClick: () => {
                      handleConfirmHandoverOnly();
                      setIsConfirmModalOpen(false);
                    },
                  },
                  {
                    btnText: "Handover & Mark Inactive",
                    isLoading: isExecuting,
                    btnClick: () => {
                      handleConfirmHandoverWithInactive();
                      setIsConfirmModalOpen(false);
                    },
                  },
                ]
          }
        >
          <p className="text-sm text-gray-600">
            {selectedOldUser?.isDeactivated
              ? `${selectedOldUser?.employeeName} is already inactive. Proceed with the handover?`
              : `${selectedOldUser?.employeeName} is currently active. Choose whether to also mark them inactive after the handover completes.`}
          </p>
        </ModalData>
      </div>
    </FormProvider>
  );
}
