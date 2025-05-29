import React from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FormLabel } from "@/components/ui/form";
import ModalData from "@/components/shared/Modal/ModalData";

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

  const onSubmit = (data: FormValues) => {
    const selected = companies.find((c) => c.companyId === data.companyId);
    if (selected) {
      onSelect(selected);
      modalClose();
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) modalClose();
  };

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
        <div className="space-y-4">
          <FormLabel htmlFor="companyId">Company</FormLabel>
          <Controller
            name="companyId"
            control={control}
            rules={{ required: "Please select a company" }}
            render={({ field }) => (
              <RadioGroup
                className="flex flex-col gap-3"
                value={field.value}
                onValueChange={field.onChange}
              >
                {companies.map((c) => (
                  <div key={c.companyId} className="flex items-center">
                    <RadioGroupItem
                      id={`company-${c.companyId}`}
                      value={c.companyId}
                      className="h-4 w-4"
                    />
                    <label
                      htmlFor={`company-${c.companyId}`}
                      className="ml-2 cursor-pointer"
                    >
                      {c.companyName}
                    </label>
                  </div>
                ))}
              </RadioGroup>
            )}
          />
          {errors.companyId && (
            <p className="text-red-600 text-sm">{errors.companyId.message}</p>
          )}
        </div>
      </ModalData>
    </FormProvider>
  );
};

export default CompanyModal;
