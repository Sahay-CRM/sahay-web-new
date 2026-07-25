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
import ModalData from "@/components/shared/Modal/ModalData";

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
  const [pendingEmployee, setPendingEmployee] = useState<{
    id: string;
    name: string;
    onChange: () => void;
  } | null>(null);

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
            Add position
          </SheetTitle>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onFormSubmit)}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8">
            {/* Position Title */}
            <div className="space-y-2.5">
              <Controller
                name="seatTitle"
                control={control}
                rules={{ required: "Position title is required" }}
                render={({ field, fieldState }) => (
                  <FormInputField
                    {...field}
                    id="seatTitle"
                    label="Position title"
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
                    label="Employee(s) in position"
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
                        // Check if employee is already in another seat
                        const isAlreadyAssigned = positions.some((pos) => {
                          if (pos.employees && Array.isArray(pos.employees)) {
                            return pos.employees.some((e) => e.employeeId === val.value);
                          }
                          return pos.employeeId === val.value;
                        });

                        const doSelect = () => {
                          field.onChange([...current, val.value]);
                        };

                        if (isAlreadyAssigned) {
                          setPendingEmployee({
                            id: val.value,
                            name: val.label,
                            onChange: doSelect,
                          });
                        } else {
                          doSelect();
                        }
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
                    label="Supervisor of position"
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
                  This position is a manager
                </Label>
                <p className="text-xs text-gray-500 leading-relaxed ">
                  Managers have additional permissions to view and manage their
                  team's performance and data.
                </p>
              </div>
            </div>
          </div>

          <SheetFooter className="px-8 py-5 bg-gray-50 border-t flex items-center justify-end shrink-0">
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

        {/* Warning Modal for Duplicate Employee Assignment */}
        <ModalData
          isModalOpen={!!pendingEmployee}
          modalTitle="Employee Already Assigned"
          modalClose={() => setPendingEmployee(null)}
          containerClass="!min-w-0 !max-w-[425px] !min-h-0 w-full"
          buttons={[
            {
              btnText: "Cancel",
              buttonCss:
                "py-1.5 px-5 bg-white border border-gray-300 text-black hover:bg-gray-50",
              btnClick: () => setPendingEmployee(null),
            },
            {
              btnText: "Confirm",
              buttonCss: "py-1.5 px-5 bg-primary text-white hover:bg-primary/95",
              btnClick: () => {
                if (pendingEmployee) {
                  pendingEmployee.onChange();
                  setPendingEmployee(null);
                }
              },
            },
          ]}
        >
          <p className="text-sm text-gray-600">
            Employee <strong>{pendingEmployee?.name}</strong> is already assigned to another position. Do you want to also assign them to this position?
          </p>
        </ModalData>
      </SheetContent>
    </Sheet>
  );
}
