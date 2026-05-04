import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm, Controller } from "react-hook-form";
import useGetEmployeeDd from "@/features/api/companyEmployee/useGetEmployeeDd";
import { useState } from "react";
import SearchDropdown from "@/components/shared/Form/SearchDropdown";

interface AddMemberFormData {
  employeeId: string;
}

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddMemberFormData) => void;
  parentName?: string;
}

export default function AddMemberModal({
  isOpen,
  onClose,
  onSubmit,
  parentName,
}: AddMemberModalProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: employeeRes } = useGetEmployeeDd({
    filter: { search: searchTerm, limit: 100 },
  });

  const employeeOptions = (employeeRes?.data || []).map(
    (emp: EmployeeData) => ({
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
    onSubmit(data);
    reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Add Team Member{" "}
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
                  label="Select Employee"
                  placeholder="Search and select employee..."
                  options={employeeOptions}
                  selectedValues={field.value ? [field.value] : []}
                  onSelect={(val) => field.onChange(val.value)}
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
