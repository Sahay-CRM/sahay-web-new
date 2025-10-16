import React, { useState, useMemo } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import ModalData from "@/components/shared/Modal/ModalData";
import { Input } from "@/components/ui/input"; // Import Input component

interface CompanyModalProps {
  isModalOpen: boolean;
  modalClose: () => void;
  companies: Company[];
  onSelect: (data: Company) => void;
}

interface FormValues {
  companyId: string;
}

const CompanyModal: React.FC<CompanyModalProps> = ({
  isModalOpen,
  modalClose,
  companies,
  onSelect,
}) => {
  const methods = useForm<FormValues>({ defaultValues: { companyId: "" } });
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = methods;
  const [searchTerm, setSearchTerm] = useState("");

  const onSubmit = (data: FormValues) => {
    const selected = companies.find((c) => c.companyId === data.companyId);
    if (selected) {
      onSelect(selected);
      modalClose();
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      modalClose();
      setSearchTerm(""); // Reset search term on modal close
    }
  };

  const filteredCompanies = useMemo(() => {
    if (searchTerm.trim().length < 3) {
      return [];
    }

    return companies.filter(
      (company) =>
        company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.userType?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [companies, searchTerm]);

  return (
    <FormProvider {...methods}>
      <ModalData
        isModalOpen={isModalOpen}
        modalTitle="Select Company"
        modalClose={handleOpenChange}
        buttons={[
          {
            btnText: "Submit",
            buttonCss: "py-1.5 px-5",
            btnClick: handleSubmit(onSubmit),
          },
        ]}
      >
        <div className="pb-2">
          <Input
            type="text"
            placeholder="Search company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded-md w-full mb-3"
          />
          <Controller
            name="companyId"
            control={control}
            rules={{ required: "Please select a company" }}
            render={({ field }) => (
              <RadioGroup
                className="flex flex-col gap-2 max-h-96 overflow-y-auto"
                value={field.value}
                onValueChange={field.onChange}
              >
                {searchTerm.trim().length < 3 ? (
                  <p className="text-center text-gray-500 py-4">
                    Type something to find companies.
                  </p>
                ) : filteredCompanies.length > 0 ? (
                  filteredCompanies.map((c, index) => (
                    <label
                      key={c.companyId + index}
                      htmlFor={`company-${c.companyId}`}
                      className={`flex items-center p-2.5 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors ${
                        field.value === c.companyId
                          ? "bg-blue-50 border-blue-500"
                          : "border-gray-200"
                      }`}
                    >
                      <RadioGroupItem
                        id={`company-${c.companyId}`}
                        value={c.companyId}
                        className="h-4 w-4"
                      />
                      <span className="ml-2.5">
                        <span className="font-medium text-sm text-gray-800">
                          {" "}
                          {c.companyName}
                        </span>
                      </span>
                    </label>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    No companies found.
                  </p>
                )}
              </RadioGroup>
            )}
          />
          {errors.companyId && (
            <p className="text-red-600 text-sm mt-1">
              {errors.companyId.message}
            </p>
          )}
        </div>
      </ModalData>
    </FormProvider>
  );
};

export default CompanyModal;
