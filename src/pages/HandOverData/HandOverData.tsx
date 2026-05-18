import { useEffect, useState, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { Button } from "@/components/ui/button";
import FormSelect from "@/components/shared/Form/FormSelect";
import useGetEmployeeDd from "@/features/api/companyEmployee/useGetEmployeeDd";
import {
  useExecuteHandover,
  useExecutePartialHandover,
} from "@/features/api/HandOver";
import HandOverStatsModal from "./HandOverStatsModal";
import { Eye } from "lucide-react";
import { useSelector } from "react-redux";
import { getUserPermission } from "@/features/selectors/auth.selector";
import PageNotAccess from "../PageNoAccess";
import { toast } from "sonner";

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

export default function HandOverData() {
  const { setBreadcrumbs } = useBreadcrumbs();
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isPartialMode, setIsPartialMode] = useState(false);
  const permission = useSelector(getUserPermission).HANDOVER;

  useEffect(() => {
    setBreadcrumbs([{ label: "Data Handover", href: "" }]);
  }, [setBreadcrumbs]);

  const methods = useForm({
    defaultValues: {
      oldUserId: "",
      newUserId: "",
      selectedModules: [] as string[],
    },
  });

  const { watch, setValue } = methods;
  const oldUserId = watch("oldUserId");
  const newUserId = watch("newUserId");
  const selectedModules = watch("selectedModules") || [];

  // Fetch employees for dropdowns
  const { data: employeeRes } = useGetEmployeeDd({
    filter: {},
    enable: true,
  });

  const employeeOptions = useMemo(() => {
    return (
      employeeRes?.data?.map((emp) => ({
        value: emp.employeeId,
        label: `${emp.employeeName} (${emp.designationName || emp.employeeType})`,
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
          label: `${emp.employeeName} (${emp.designationName || emp.employeeType})`,
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

  const isExecuting = isExecutingFull || isExecutingPartial;

  const handleExecute = () => {
    if (!oldUserId || !newUserId) return;
    if (isPartialMode) {
      if (selectedModules.length === 0) {
        toast.error("Please select at least one module for partial handover");
        return;
      }
      executePartialHandover(
        {
          oldUserId,
          newUserId,
          moduleKey: selectedModules,
        },
        {
          onSuccess: () => {
            window.location.reload();
          },
        },
      );
    } else {
      executeHandover(
        {
          oldUserId,
          newUserId,
        },
        {
          onSuccess: () => {
            window.location.reload();
          },
        },
      );
    }
  };

  if (!permission || permission.View === false) {
    return <PageNotAccess />;
  }

  return (
    <FormProvider {...methods}>
      <div className="w-full px-4 py-8 max-w-4xl mx-auto">
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
                  {oldUserId && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary/80 h-7 px-2 font-medium"
                      onClick={() => setIsStatsModalOpen(true)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Impact
                    </Button>
                  )}
                </div>
                <FormSelect
                  placeholder="Select source user"
                  options={employeeOptions}
                  value={oldUserId}
                  isSearchable
                  onChange={(val) => {
                    setValue("oldUserId", val as string);
                  }}
                  className="w-full"
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
                <FormSelect
                  placeholder="Select target user"
                  options={targetUserOptions}
                  value={newUserId}
                  isSearchable
                  disabled={!oldUserId}
                  onChange={(val) => {
                    setValue("newUserId", val as string);
                  }}
                  className="w-full"
                />
                <p className="text-xs text-gray-400">
                  The user who will receive all assigned items.
                </p>
              </div>
            </div>

            {/* Partial Modules Selection */}
            {isPartialMode && (
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <div className="flex items-end h-7 mb-3">
                  <label className="text-sm font-semibold text-gray-700">
                    Select Modules to Handover
                  </label>
                </div>
                <FormSelect
                  placeholder="Select modules (e.g., Owned Tasks, Projects)..."
                  options={MODULE_OPTIONS}
                  value={selectedModules}
                  isMulti
                  onChange={(val) => {
                    setValue("selectedModules", val as string[]);
                  }}
                  className="w-full"
                />
                <p className="text-xs text-gray-400">
                  Only the selected modules will be transferred to the target
                  user.
                </p>
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

        {/* Stats Modal */}
        <HandOverStatsModal
          isOpen={isStatsModalOpen}
          onClose={() => setIsStatsModalOpen(false)}
          userId={oldUserId}
          userName={selectedOldUser?.employeeName || ""}
        />
      </div>
    </FormProvider>
  );
}
