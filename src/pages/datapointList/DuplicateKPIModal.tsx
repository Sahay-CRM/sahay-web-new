import React, { useState, useEffect } from "react";
import ModalData from "@/components/shared/Modal/ModalData";
import { useGetEmployeeDd } from "@/features/api/companyEmployee";
import SearchDropdown from "@/components/shared/Form/SearchDropdown";

interface DuplicateKPIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (employeeId: string) => void;
  kpiData: KPIFormData | null;
  isLoading?: boolean;
}

const DuplicateKPIModal: React.FC<DuplicateKPIModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  kpiData,
  isLoading = false,
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [isEmployeeSearch, setIsEmployeeSearch] = useState("");
  const [error, setError] = useState<string>("");

  const { data: employeeData } = useGetEmployeeDd({
    filter: {
      isDeactivated: false,
      search: isEmployeeSearch.length >= 3 ? isEmployeeSearch : undefined,
      pageSize: 25,
    },
    enable: isEmployeeSearch.length >= 3,
  });

  useEffect(() => {
    if (isOpen && kpiData) {
      setSelectedEmployee("");
      setError("");
    }
  }, [isOpen, kpiData]);

  const allOptions = (employeeData?.data || [])
    .filter((item) => !item.isDeactivated)
    .map((emp) => ({
      value: emp.employeeId,
      label: emp.employeeName,
    }));

  const handleConfirm = () => {
    if (!selectedEmployee) {
      setError("Please select an employee");
      return;
    }
    if (kpiData?.kpiId) {
      onConfirm(selectedEmployee);
    }
  };

  return (
    <ModalData
      isModalOpen={isOpen}
      modalClose={onClose}
      modalTitle="Duplicate KPI"
      buttons={[
        {
          btnText: "Cancel",
          btnClick: onClose,
          buttonCss: "bg-gray-100 text-black hover:bg-gray-200",
        },
        {
          btnText: "Duplicate",
          btnClick: handleConfirm,
          isLoading: isLoading,
        },
      ]}
    >
      <div className="space-y-4 py-2">
        <div className="  flex  gap-5 ">
          <p className="   text-sm">Duplicating KPI :</p>
          <p className="text-sm font-semibold text-primary truncate">
            {kpiData?.KPIName}
          </p>
        </div>

        <div className="space-y-4">
          <SearchDropdown
            options={allOptions}
            selectedValues={selectedEmployee ? [selectedEmployee] : []}
            onSelect={(value) => {
              setSelectedEmployee(value.value);
              setError("");
            }}
            placeholder="Search and select employee..."
            label="Assign to New User"
            isMandatory
            onSearchChange={setIsEmployeeSearch}
            error={error ? { message: error } : undefined}
          />
        </div>
      </div>
    </ModalData>
  );
};

export default DuplicateKPIModal;
