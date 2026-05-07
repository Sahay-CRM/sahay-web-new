import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm, Controller } from "react-hook-form";
import { useGetEmployeesNotInTeam } from "@/features/api/companyTeam";
import { useState } from "react";
import { useSelector } from "react-redux";
import { getUserDetail } from "@/features/selectors/auth.selector";
import SearchDropdown from "@/components/shared/Form/SearchDropdown";

interface AddMemberFormData {
  employeeIds: string[];
}

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { employeeId: string }) => void;
  parentName?: string;
}

export default function AddMemberModal({
  isOpen,
  onClose,
  onSubmit,
  parentName,
}: AddMemberModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const user = useSelector(getUserDetail);

  const { data: employeeRes } = useGetEmployeesNotInTeam({
    filter: {
      companyId: user?.companyId,
      search: searchTerm,
    },
  });

  const employeeOptions = (employeeRes?.data || []).map(
    (emp: EmployeeDetailsById) => ({
      label: emp.employeeName || "",
      value: emp.employeeId || "",
    }),
  );

  const { handleSubmit, control, reset } = useForm<AddMemberFormData>({
    defaultValues: {
      employeeIds: [],
    },
  });

  const handleFormSubmit = (data: AddMemberFormData) => {
    data.employeeIds.forEach((id) => {
      onSubmit({ employeeId: id });
    });
    reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Add Team Members{" "}
            {parentName && parentName !== "Root" ? `to ${parentName}` : ""}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4 py-4"
        >
          <div className="space-y-2">
            <Controller
              name="employeeIds"
              control={control}
              rules={{ required: "Select at least one employee" }}
              render={({ field }) => (
                <SearchDropdown
                  label="Select Employees"
                  placeholder="Search and select employees..."
                  options={employeeOptions}
                  selectedValues={field.value}
                  onSelect={(val) => {
                    if (val.value === "CLEAR_ALL") {
                      field.onChange([]);
                    } else {
                      const currentValues = Array.isArray(field.value)
                        ? field.value
                        : [];
                      const newValues = currentValues.includes(val.value)
                        ? currentValues.filter((v) => v !== val.value)
                        : [...currentValues, val.value];
                      field.onChange(newValues);
                    }
                  }}
                  onSearchChange={setSearchTerm}
                  isMandatory={true}
                />
              )}
            />
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-black text-white hover:bg-gray-800"
            >
              Add Member
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
