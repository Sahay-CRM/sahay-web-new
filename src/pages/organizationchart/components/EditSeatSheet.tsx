import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Loader2 } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import SearchDropdown from "@/components/shared/Form/SearchDropdown";
import FormCheckbox from "@/components/shared/Form/FormCheckbox/FormCheckbox";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import { useGetEmployeeDd } from "@/features/api/companyEmployee";
import ModalData from "@/components/shared/Modal/ModalData";

export function EditSeatSheet({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  positions,
  companyId,
  initialData,
  isRoot = false,
  editingNodeId,
}: EditSeatSheetProps) {
  const [empSearch, setEmpSearch] = useState("");
  const [pendingEmployee, setPendingEmployee] = useState<{
    id: string;
    name: string;
    onChange: () => void;
  } | null>(null);
  const [pendingDuplicateSeat, setPendingDuplicateSeat] = useState<AddSeatFormData | null>(null);

  const { data: empRes } = useGetEmployeeDd({
    filter: { companyId: companyId || "", search: empSearch },
  });

  const currentAssignedOptions: { label: string; value: string }[] = [];
  positions.forEach((p) => {
    if (p.employees && Array.isArray(p.employees) && p.employees.length > 0) {
      p.employees.forEach((e) => {
        currentAssignedOptions.push({
          label: e.employeeName || "",
          value: e.employeeId || "",
        });
      });
    } else if (p.employeeId) {
      const ids = p.employeeId.split(",").map((id) => id.trim()).filter(Boolean);
      const names = p.employeeName
        ? p.employeeName.split(",").map((n) => n.trim())
        : [];
      ids.forEach((id, index) => {
        currentAssignedOptions.push({
          label: names[index] || "Employee",
          value: id,
        });
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
      ? `${p.seatTitle}`
      : p.employeeName || p.designationName || "Unassigned",
    value: p.positionId,
  }));

  const {
    handleSubmit,
    control,
    reset,
    register,
    formState: { errors },
  } = useForm<AddSeatFormData>({
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
    const hasDuplicateTitle = positions.some((p) => {
      if (editingNodeId && p.positionId === editingNodeId) {
        return false;
      }
      const parentA = p.parentPositionId || "";
      const parentB = data.parentPositionId || "";
      const sameParent = parentA === parentB;
      const sameTitle = p.seatTitle?.trim().toLowerCase() === data.seatTitle.trim().toLowerCase();
      return sameParent && sameTitle;
    });

    if (hasDuplicateTitle) {
      setPendingDuplicateSeat(data);
    } else {
      onSubmit(data);
      onClose();
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 transition-opacity cursor-pointer" 
          onClick={onClose} 
        />
      )}
      {/* Drawer Container */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:max-w-[450px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col border-l
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
        style={{ pointerEvents: isOpen ? "auto" : "none" }}
      >
        {/* Header */}
        <div className="px-8 py-5 border-b bg-primary flex flex-row items-center justify-between space-y-0 shrink-0">
          <h2 className="text-xl font-bold text-white">
            Edit position
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-white hover:text-white/80 text-2xl border-none bg-transparent cursor-pointer shadow-none p-0 flex items-center justify-center font-normal"
          >
            &times;
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onFormSubmit)}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-8 py-8 space-y-9">
            <FormInputField
              id="seatTitle"
              {...register("seatTitle", { required: "Position title is required" })}
              error={errors.seatTitle}
              label="Position title"
              placeholder="Type a title"
              containerClass="mt-0 tb:mt-0"
              className="h-11 bg-white border-slate-200 focus-visible:ring-primary/20 text-sm"
              isMandatory={true}
            />

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
                          if (editingNodeId && pos.positionId === editingNodeId) {
                            return false;
                          }
                          if (pos.employees && Array.isArray(pos.employees) && pos.employees.length > 0) {
                            return pos.employees.some((e) => e.employeeId === val.value);
                          }
                          if (pos.employeeId) {
                            const ids = pos.employeeId.split(",").map((id) => id.trim()).filter(Boolean);
                            return ids.includes(val.value);
                          }
                          return false;
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

            {/* Supervisor Selection - hidden for root/top-level seat */}
            {!isRoot && (
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
            )}

            {/* Manager Checkbox */}
            <div className="flex items-center gap-3 group pt-2">
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
              <div className="space-y-0">
                <Label
                  htmlFor="isManager"
                  className="text-md  text-slate-700 cursor-pointer  select-none"
                >
                  This position is a manager
                </Label>
                <p className="text-sm text-slate-500  ">
                  Managers have additional permissions to view and manage their
                  team's performance and data.
                </p>
              </div>
            </div>
          </div>

          <div className="px-8 py-5 bg-slate-50 border-t flex items-center justify-end shrink-0">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="text-slate-500 font-bold hover:bg-slate-100 "
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-primary hover:bg-primary-dark text-white font-bold px-10 h-11 rounded-md transition-all shadow-md  border-none"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  "Save and close"
                )}
              </Button>
            </div>
          </div>
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

        {/* Warning Modal for Duplicate Seat Title */}
        <ModalData
          isModalOpen={!!pendingDuplicateSeat}
          modalTitle="Duplicate Position Title"
          modalClose={() => setPendingDuplicateSeat(null)}
          containerClass="!min-w-0 !max-w-[425px] !min-h-0 w-full"
          buttons={[
            {
              btnText: "Cancel",
              buttonCss:
                "py-1.5 px-5 bg-white border border-gray-300 text-black hover:bg-gray-50",
              btnClick: () => setPendingDuplicateSeat(null),
            },
            {
              btnText: "Confirm",
              buttonCss: "py-1.5 px-5 bg-primary text-white hover:bg-primary/95",
              btnClick: () => {
                if (pendingDuplicateSeat) {
                  onSubmit(pendingDuplicateSeat);
                  setPendingDuplicateSeat(null);
                  onClose();
                }
              },
            },
          ]}
        >
          <p className="text-sm text-gray-600">
            A position with the title <strong>{pendingDuplicateSeat?.seatTitle}</strong> already reports to the selected supervisor. Do you want to save anyway?
          </p>
        </ModalData>
      </div>
    </>
  );
}
