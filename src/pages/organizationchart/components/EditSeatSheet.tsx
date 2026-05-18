import { useState, useEffect } from "react";
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

export function EditSeatSheet({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  positions,
  companyId,
  initialData,
}: EditSeatSheetProps) {
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
    defaultValues: initialData || {
      seatTitle: "",
      employeeId: [],
      isDeptHead: false,
      isManager: false,
      parentPositionId: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const onFormSubmit = (data: AddSeatFormData) => {
    onSubmit(data);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="sm:max-w-[450px] p-0 flex flex-col border-l shadow-2xl"
      >
        <SheetHeader className="px-6 py-5 border-b bg-slate-50 flex flex-row items-center justify-between space-y-0 shrink-0">
          <SheetTitle className="text-xl font-bold text-slate-800">
            Edit seat
          </SheetTitle>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onFormSubmit)}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-8 py-8 space-y-9">
            {/* Seat Title */}
            <div className="space-y-2.5">
              <Label className="text-[13px] font-bold text-slate-700">
                Seat title <span className="text-red-500">*</span>
              </Label>
              <Input
                {...register("seatTitle", { required: true })}
                placeholder="Type a title"
                className="h-11 bg-white border-slate-200 focus-visible:ring-primary/20 text-sm"
              />
            </div>

            {/* Employee Selection */}
            <div className="space-y-2.5">
              <Label className="text-[13px] font-bold text-slate-700">
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

            {/* Supervisor Selection */}

            <div className="space-y-2.5">
              <Label className="text-[13px] font-bold text-slate-700">
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
                        : "bg-white border-slate-300"
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
                <p className="text-sm font-bold text-slate-700">
                  This seat is a manager
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Managers have additional permissions to view and manage their
                  team's performance and data.
                </p>
              </div>
            </div>
          </div>

          <SheetFooter className="px-8 py-5 bg-slate-50 border-t flex items-center justify-end shrink-0">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="text-slate-500 font-bold hover:bg-slate-100"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-[#14b8a6] hover:bg-[#0d9488] text-white font-bold px-10 h-11 rounded-md transition-all shadow-md"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  "Save and close"
                )}
              </Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
