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
  employeeId: string;
}

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { employeeId: string }) => void;
  parentName?: string;
  isLoading?: boolean;
}

export default function AddMemberModal({
  isOpen,
  onClose,
  onSubmit,
  parentName,
  isLoading,
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
      employeeId: "",
    },
  });

  const handleFormSubmit = (data: AddMemberFormData) => {
    onSubmit({ employeeId: data.employeeId });
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
              name="employeeId"
              control={control}
              rules={{ required: "Select an employee" }}
              render={({ field }) => (
                <SearchDropdown
                  label="Select Employees"
                  placeholder="Search and select employees..."
                  options={employeeOptions}
                  selectedValues={field.value ? [field.value] : []}
                  onSelect={(val) => {
                    field.onChange(val.value);
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
              disabled={isLoading}
            >
              {isLoading ? "Adding..." : "Add Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
