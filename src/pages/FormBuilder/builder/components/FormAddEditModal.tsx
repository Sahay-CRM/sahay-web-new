import { FormProvider, useForm } from "react-hook-form";
import ModalData from "@/components/shared/Modal/ModalData";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import { useCreateForm, useUpdateForm } from "@/features/api/Form";
import { useEffect } from "react";
import { queryClient } from "@/queryClient";

interface FormAddEditModalProps {
  isModalOpen: boolean;
  modalClose: () => void;
  modalData: FormDetails | null;
  onSuccess?: (id: string) => void;
}

const FormAddEditModal = ({
  isModalOpen,
  modalClose,
  modalData,
  onSuccess,
}: FormAddEditModalProps) => {
  const methods = useForm<Partial<FormDetails>>({
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const { mutate: createForm, isPending: isCreating } = useCreateForm();
  const { mutate: updateForm, isPending: isUpdating } = useUpdateForm();

  useEffect(() => {
    if (modalData) {
      methods.reset({
        name: modalData.name,
        description: modalData.description,
      });
    } else {
      methods.reset({
        name: "",
        description: "",
      });
    }
  }, [modalData, methods]);

  const onSubmit = (data: Partial<FormDetails>) => {
    const payload = {
      ...data,
      isActive: false, // Always send isActive: false for new/edited forms via this modal
    };

    if (modalData?.id) {
      updateForm(
        { id: modalData.id, data: payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["get-forms"] });
            modalClose();
            if (onSuccess) onSuccess(modalData.id);
          },
        },
      );
    } else {
      createForm(payload, {
        onSuccess: (res) => {
          queryClient.invalidateQueries({ queryKey: ["get-forms"] });
          modalClose();
          if (onSuccess && res?.data?.id) onSuccess(res.data.id);
        },
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <ModalData
        isModalOpen={isModalOpen}
        modalTitle={modalData?.id ? "Edit Form" : "Create Form"}
        modalClose={modalClose}
        buttons={[
          {
            btnText: "Submit",
            btnClick: methods.handleSubmit(onSubmit),
            isLoading: isCreating || isUpdating,
          },
        ]}
      >
        <div className="space-y-4">
          <FormInputField
            id="name"
            {...methods.register("name", {
              required: "Form Name is required",
            })}
            error={methods.formState.errors.name}
            label="Form Name"
            placeholder="Enter form name"
            isMandatory={true}
          />
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">
              Description
            </label>
            <textarea
              {...methods.register("description")}
              className="w-full p-2 border border-gray-200 rounded-md text-sm focus:border-[#2f328e] outline-none min-h-[100px]"
              placeholder="Enter description"
            />
          </div>
        </div>
      </ModalData>
    </FormProvider>
  );
};

export default FormAddEditModal;
