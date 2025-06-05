import { Controller, FormProvider, useForm } from "react-hook-form";
import ModalData from "@/components/shared/Modal/ModalData";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import FormImage from "@/components/shared/Form/FormImage/FormImage";
import useProductFormModal from "./useProductFormModal";
import FormSelect from "@/components/shared/Form/FormSelect";

export default function ProductFormModal({
  isModalOpen,
  modalClose,
  modalData,
}: ProductFormModalProps) {
  const methods = useForm();
  const {
    register,
    errors,
    onSubmit,
    handleModalClose,
    watch,
    setValue,
    control,
    brandOptions,
  } = useProductFormModal({
    isModalOpen,
    modalClose,
    modalData,
  });

  return (
    <FormProvider {...methods}>
      <ModalData
        isModalOpen={isModalOpen}
        modalTitle={modalData?.productId ? "Edit Product" : "Add Product"}
        modalClose={handleModalClose}
        buttons={[
          {
            btnText: "Submit",
            buttonCss: "py-1.5 px-5",
            btnClick: onSubmit,
          },
        ]}
      >
        <div className="space-y-4">
          {modalData && !modalData.productId && (
            <div>
              <Controller
                name="brandId"
                control={control}
                render={({ field, fieldState }) => (
                  <FormSelect
                    {...field}
                    label="Brand"
                    options={brandOptions}
                    error={fieldState.error}
                    isMandatory={true}
                  />
                )}
              />
            </div>
          )}
          <div>
            <FormInputField
              id="productName"
              {...register("productName", {
                required: "Enter Product Name",
              })}
              error={errors.productName}
              label="Product Name"
              placeholder={"Enter Product Name"}
              containerClass="mt-0 tb:mt-0"
              className="text-lg"
              isMandatory={true}
            />
          </div>
          <div>
            <FormInputField
              label="Product Description"
              {...register("productDescription")}
              error={errors.productDescription}
            />
          </div>
          <div>
            <FormImage
              value={watch("productImage") ?? ""}
              onChange={(val) => setValue("productImage", val)}
              label="Upload Product Image"
            />
          </div>
        </div>
      </ModalData>
    </FormProvider>
  );
}
