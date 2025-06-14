import { FormProvider, useForm } from "react-hook-form";
import ModalData from "@/components/shared/Modal/ModalData";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import FormImage from "@/components/shared/Form/FormImage/FormImage";
import useBrandFormModal from "./useBrandFormModal";

export default function BrandFormModal({
  isModalOpen,
  modalClose,
  modalData,
}: BrandFormModalProps) {
  const methods = useForm();
  const {
    register,
    errors,
    onSubmit,
    handleModalClose,
    watch,
    setValue,
    isLoading,
  } = useBrandFormModal({
    isModalOpen,
    modalClose,
    modalData,
  });

  return (
    <FormProvider {...methods}>
      <ModalData
        isModalOpen={isModalOpen}
        modalTitle={modalData?.brandId ? "Edit Brand" : "Add Brand"}
        modalClose={handleModalClose}
        buttons={[
          {
            btnText: "Submit",
            buttonCss: "py-1.5 px-5",
            btnClick: onSubmit,
            isLoading: isLoading,
          },
        ]}
      >
        <div className="space-y-4">
          <div>
            <FormInputField
              id="brandName"
              {...register("brandName", {
                required: "Enter Brand Name",
              })}
              error={errors.brandName}
              label="Brand Name"
              placeholder={"Enter Brand Name"}
              containerClass="mt-0 tb:mt-0"
              className="text-lg"
              isMandatory={true}
            />
          </div>
          <div>
            <FormInputField
              label="Brand Description"
              {...register("brandDescription")}
              error={errors.brandDescription}
            />
          </div>
          <div>
            <FormImage
              value={watch("brandLogo") ?? ""}
              onChange={(val) => setValue("brandLogo", val)}
              label="Upload Brand Logo"
            />
          </div>
        </div>
      </ModalData>
    </FormProvider>
  );
}
