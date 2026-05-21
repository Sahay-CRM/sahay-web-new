import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Loader2 } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import SearchDropdown from "@/components/shared/Form/SearchDropdown";
import FormCheckbox from "@/components/shared/Form/FormCheckbox/FormCheckbox";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
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
      ? `${p.seatTitle} `
      : p.employeeName || p.designationName || "Unassigned",
    value: p.positionId,
  }));

  const { handleSubmit, control, reset } = useForm<AddSeatFormData>({
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
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="sm:max-w-[450px] p-0 flex flex-col border-l shadow-2xl bg-white [&>button]:text-white/80 hover:[&>button]:text-white [&>button]:top-5 [&>button]:right-6"
      >
        <SheetHeader className="px-8 py-5 border-b bg-primary flex flex-row items-center justify-between space-y-0 shrink-0">
          <SheetTitle className="text-xl font-bold text-white ">
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
              <Controller
                name="seatTitle"
                control={control}
                rules={{ required: "Seat title is required" }}
                render={({ field, fieldState }) => (
                  <FormInputField
                    {...field}
                    id="seatTitle"
                    label="Seat title"
                    placeholder="Type a title"
                    isMandatory={true}
                    error={fieldState.error}
                    containerClass="mt-0 tb:mt-0"
                    className="h-11 bg-white border-gray-200 focus-visible:ring-primary/20 text-sm"
                  />
                )}
              />
            </div>

            {/* Employee Selection */}
            <div className="space-y-2.5">
              <Controller
                name="employeeId"
                control={control}
                render={({ field }) => (
                  <SearchDropdown
                    label="Employee(s) in seat"
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
              <Controller
                name="parentPositionId"
                control={control}
                render={({ field }) => (
                  <SearchDropdown
                    label="Supervisor of seat"
                    placeholder="Type or choose assigned supervisor"
                    options={supervisorOptions}
                    selectedValues={field.value ? [field.value] : []}
                    onSelect={(val) => field.onChange(val.value)}
                    onSearchChange={() => {}}
                  />
                )}
              />
            </div>

            {/* Dept Head Checkbox (Commented out as it's not active in system logic) */}
            {/* 
            <div className="flex items-start gap-3 group">
              <Controller
                name="isDeptHead"
                control={control}
                render={({ field }) => (
                  <FormCheckbox
                    id="isDeptHead"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    containerClass="mt-1 tb:mt-1"
                    className="w-5 h-5 accent-primary cursor-pointer"
                  />
                )}
              />
              <div className="space-y-1">
                <label htmlFor="isDeptHead" className="text-sm font-bold text-gray-700 cursor-pointer  select-none">
                  This seat is the head of its department
                </label>
                <p className="text-xs text-gray-500 leading-relaxed max-w-[480px] ">
                  New seats will automatically be assigned to the same
                  department as their supervisor, unless they are a department
                  head themselves.
                </p>
              </div>
            </div>
            */}

            {/* Manager Checkbox */}
            <div className="flex  items-center gap-3 group pt-2">
              <Controller
                name="isManager"
                control={control}
                render={({ field }) => (
                  <FormCheckbox
                    id="isManager"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    containerClass="mt-1 tb:mt-1"
                    className="w-4 h-4 accent-primary cursor-pointer"
                  />
                )}
              />
              <div className="space-y-1">
                <Label
                  htmlFor="isManager"
                  className="text-sm font-bold text-gray-700 cursor-pointer  select-none"
                >
                  This seat is a manager
                </Label>
                <p className="text-xs text-gray-500 leading-relaxed ">
                  Managers have additional permissions to view and manage their
                  team's performance and data.
                </p>
              </div>
            </div>
          </div>

          <SheetFooter className="px-8 py-5 bg-gray-50 border-t flex items-center justify-end shrink-0">
            {/* Create another seat checkbox (Commented out per user request) */}
            {/*
            <FormCheckbox
              id="createAnother"
              label="Create another seat"
              labelClass="text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer select-none "
              checked={false}
              onChange={() => {}}
              containerClass="mt-0 tb:mt-0"
              className="w-4 h-4 accent-primary cursor-pointer"
            />
            */}
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="text-gray-500 font-bold hover:bg-gray-100 "
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-primary hover:bg-primary-dark text-white font-bold px-8 h-11 rounded-md transition-all shadow-md  border-none"
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
