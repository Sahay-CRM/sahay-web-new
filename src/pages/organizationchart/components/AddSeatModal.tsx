import { useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import {
  Plus,
  LayoutTemplate,
  ChevronDown,
  Trash2,
  GripVertical,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SearchDropdown from "@/components/shared/Form/SearchDropdown";
import { useGetEmployeesNotInTeam } from "@/features/api/companyTeam";

export function AddSeatModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  positions,
  companyId,
}: AddSeatModalProps) {
  const [empSearch, setEmpSearch] = useState("");

  const { data: empRes } = useGetEmployeesNotInTeam({
    filter: { companyId, search: empSearch },
  });

  const empOptions = (empRes?.data || []).map((emp) => ({
    label: emp.employeeName || "",
    value: emp.employeeId || "",
  }));

  const supervisorOptions = positions.map((p) => ({
    label: p.employeeName || p.designationName || "Unassigned",
    value: p.positionId,
  }));

  const { handleSubmit, control, reset, register } = useForm<AddSeatFormData>({
    defaultValues: {
      seatTitle: "",
      employeeId: [],
      isDeptHead: false,
      isManager: false,
      roles: [{ value: "" }],
      parentPositionId: "",
      createAnother: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "roles",
  });

  const onFormSubmit = (data: AddSeatFormData) => {
    onSubmit(data);
    if (!data.createAnother) {
      onClose();
    } else {
      reset({ ...data, seatTitle: "", employeeId: [], roles: [{ value: "" }] });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="px-6 py-4 border-b bg-slate-50 flex flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-lg font-bold text-slate-800">
            New seat
          </DialogTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-slate-500 hover:text-slate-700 cursor-pointer text-sm font-medium">
              <LayoutTemplate className="w-4 h-4" />
              <span>View</span>
              <ChevronDown className="w-3 h-3" />
            </div>
          </div>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onFormSubmit)}
          className="flex flex-col max-h-[85vh]"
        >
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
            {/* Seat Title */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-600">
                Seat title <span className="text-red-500">*</span>
              </Label>
              <Input
                {...register("seatTitle", { required: true })}
                placeholder="Type a title"
                className="h-10 bg-white border-slate-200 focus:ring-primary/20"
              />
            </div>

            {/* Employee Selection */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-600">
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
                  This seat is the head of its department
                </p>
                <p className="text-xs text-slate-500 leading-relaxed max-w-[480px]">
                  New seats will automatically be assigned to the same
                  department as their supervisor, unless they are a department
                  head themselves.
                </p>
              </div>
            </div>

            {/* Roles Section */}
            <div className="space-y-3">
              <div>
                <p className="text-sm font-bold text-slate-700">Roles</p>
                <p className="text-xs text-slate-500 mt-1">
                  The top roles and responsibilities written with as few words
                  as possible. Together, they represent greater than 80% of the
                  value this person brings in their role.
                </p>
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-3">
                    <div className="p-1.5 cursor-grab text-slate-300">
                      <GripVertical className="w-4 h-4" />
                    </div>
                    <Input
                      {...register(`roles.${index}.value` as const)}
                      placeholder="Role for this position"
                      className="h-10 bg-white border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => append({ value: "" })}
                className="text-primary text-sm font-bold flex items-center gap-1.5 hover:underline pl-9"
              >
                <Plus className="w-4 h-4" /> Add role
              </button>
            </div>

            {/* Supervisor Selection */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-600">
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

          <div className="px-6 py-4 bg-slate-50 border-t flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                {...register("createAnother")}
                className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/20"
              />
              <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                Create another seat
              </span>
            </label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="text-slate-500 font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-[#14b8a6] hover:bg-[#0d9488] text-white font-bold px-8 h-10 rounded-md transition-all shadow-sm"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
