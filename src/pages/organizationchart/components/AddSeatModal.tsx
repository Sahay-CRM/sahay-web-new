import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Plus, Loader2 } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SearchDropdown from "@/components/shared/Form/SearchDropdown";
import { useGetEmployeeDd } from "@/features/api/companyEmployee";

export function AddSeatModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  positions,
  companyId,
  initialParentId,
}: AddSeatModalProps) {
  const [empSearch, setEmpSearch] = useState("");

  const { data: empRes } = useGetEmployeeDd({
    filter: { companyId: companyId || "", search: empSearch },
  });

  const currentAssignedOptions: { label: string; value: string }[] = [];
  positions.forEach((p) => {
    if (p.employees && Array.isArray(p.employees)) {
      p.employees.forEach((e) => {
        currentAssignedOptions.push({
          label: e.employeeName || "",
          value: e.employeeId || "",
        });
      });
    } else if (p.employeeId && p.employeeName) {
      currentAssignedOptions.push({
        label: p.employeeName,
        value: p.employeeId,
      });
    }
  });

  const apiEmpOptions = (empRes?.data || []).map((emp) => ({
    label: emp.employeeName || "",
    value: emp.employeeId || "",
  }));

  const allMap = new Map<string, string>();
  currentAssignedOptions.forEach((o) => {
    if (o.value && o.label) allMap.set(o.value, o.label);
  });
  apiEmpOptions.forEach((o) => {
    if (o.value && o.label) allMap.set(o.value, o.label);
  });

  const empOptions = Array.from(allMap.entries()).map(([value, label]) => ({
    label,
    value,
  }));

  const supervisorOptions = positions.map((p) => ({
    label: p.seatTitle
      ? `${p.seatTitle} (${p.employeeName || "Unassigned"})`
      : p.employeeName || p.designationName || "Unassigned",
    value: p.positionId,
  }));

  const { handleSubmit, control, reset, register } = useForm<AddSeatFormData>({
    defaultValues: {
      seatTitle: "",
      employeeId: [],
      isDeptHead: false,
      isManager: false,
      parentPositionId: initialParentId || "",
      createAnother: false,
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        seatTitle: "",
        employeeId: [],
        isDeptHead: false,
        isManager: false,
        parentPositionId: initialParentId || "",
        createAnother: false,
      });
    }
  }, [isOpen, initialParentId, reset]);

  const onFormSubmit = (data: AddSeatFormData) => {
    onSubmit(data);
    if (!data.createAnother) {
      onClose();
    } else {
      reset({ ...data, seatTitle: "", employeeId: [] });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="sm:max-w-[450px] p-0 flex flex-col border-l shadow-2xl bg-white"
      >
        <SheetHeader className="px-8 py-5 border-b bg-gray-50 flex flex-row items-center justify-between space-y-0 shrink-0">
          <SheetTitle className="text-xl font-bold text-gray-800">
            New seat
          </SheetTitle>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onFormSubmit)}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8">
            {/* Seat Title */}
            <div className="space-y-2.5">
              <Label className="text-[13px] font-bold text-gray-700">
                Seat title <span className="text-red-500">*</span>
              </Label>
              <Input
                {...register("seatTitle", { required: true })}
                placeholder="Type a title"
                className="h-11 bg-white border-gray-200 focus-visible:ring-primary/20 text-sm"
              />
            </div>

            {/* Employee Selection */}
            <div className="space-y-2.5">
              <Label className="text-[13px] font-bold text-gray-700">
                Employee(s) in seat
              </Label>
              <Controller
                name="employeeId"
                control={control}
                render={({ field }) => (
                  <SearchDropdown
                    label=""
                    placeholder="Type or choose assigned employees"
                    options={empOptions}
                    multiSelect
                    selectedValues={field.value || []}
                    onSelect={(val) => {
                      const current = field.value || [];
                      if (current.includes(val.value)) {
                        field.onChange(
                          current.filter((v: string) => v !== val.value),
                        );
                      } else {
                        field.onChange([...current, val.value]);
                      }
                    }}
                    onSearchChange={setEmpSearch}
                  />
                )}
              />
            </div>

            {/* Dept Head Checkbox */}
            <div className="flex items-start gap-3 group">
              <Controller
                name="isDeptHead"
                control={control}
                render={({ field }) => (
                  <div
                    className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-all ${
                      field.value
                        ? "bg-primary border-primary"
                        : "bg-white border-gray-300"
                    }`}
                    onClick={() => field.onChange(!field.value)}
                  >
                    {field.value && (
                      <Plus className="w-3.5 h-3.5 text-white stroke-[3px] rotate-45" />
                    )}
                  </div>
                )}
              />
              <div className="space-y-1">
                <p className="text-sm font-bold text-gray-700">
                  This seat is the head of its department
                </p>
                <p className="text-xs text-gray-500 leading-relaxed max-w-[480px]">
                  New seats will automatically be assigned to the same
                  department as their supervisor, unless they are a department
                  head themselves.
                </p>
              </div>
            </div>

            {/* Supervisor Selection */}
            <div className="space-y-2.5">
              <Label className="text-[13px] font-bold text-gray-700">
                Supervisor of seat
              </Label>
              <Controller
                name="parentPositionId"
                control={control}
                render={({ field }) => (
                  <SearchDropdown
                    label=""
                    placeholder="Type or choose assigned supervisor"
                    options={supervisorOptions}
                    selectedValues={field.value ? [field.value] : []}
                    onSelect={(val) => field.onChange(val.value)}
                    onSearchChange={() => {}}
                  />
                )}
              />
            </div>

            {/* Manager Checkbox */}
            <div className="flex items-start gap-3 group pt-2">
              <Controller
                name="isManager"
                control={control}
                render={({ field }) => (
                  <div
                    className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-all ${
                      field.value
                        ? "bg-primary border-primary"
                        : "bg-white border-gray-300"
                    }`}
                    onClick={() => field.onChange(!field.value)}
                  >
                    {field.value && (
                      <Plus className="w-3.5 h-3.5 text-white stroke-[3px] rotate-45" />
                    )}
                  </div>
                )}
              />
              <div className="space-y-1">
                <p className="text-sm font-bold text-gray-700">
                  This seat is a manager
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Managers have additional permissions to view and manage their
                  team's performance and data.
                </p>
              </div>
            </div>
          </div>

          <SheetFooter className="px-8 py-5 bg-gray-50 border-t flex items-center justify-between shrink-0">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                {...register("createAnother")}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20"
              />
              <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
                Create another seat
              </span>
            </label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="text-gray-500 font-bold hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-[#14b8a6] hover:bg-[#0d9488] text-white font-bold px-8 h-11 rounded-md transition-all shadow-md"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
