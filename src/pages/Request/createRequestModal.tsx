import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import FormSelect from "@/components/shared/Form/FormSelect";
import ModalData from "@/components/shared/Modal/ModalData";
import { useAddUpdateRequestMutation } from "@/features/api/Request";
import { Controller, useForm } from "react-hook-form";

interface ViewRepeatTaskProps {
  isModalOpen: boolean;
  modalClose: () => void;
}
export default function CreateRequestModal({
  isModalOpen,
  modalClose,
}: ViewRepeatTaskProps) {
  const { mutate: addRequest } = useAddUpdateRequestMutation();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RequestFormValues>();

  const requestTypeOption = [
    { label: "Task", value: "TASK" },
    { label: "Department", value: "DEPARTMENT" },
    { label: "KPI", value: "KPI" },
    { label: "Business Function", value: "BUSINESS_FUNCTION" },
  ];

  const onSubmit = (data: RequestFormValues) => {
    const payload = {
      requestType: data.requestType,
      requesterNote: data.notes,
      requestTitle: data.requestName,
    };

    addRequest(payload, {
      onSuccess: () => {
        modalClose();
      },
    });
  };

  return (
    <ModalData
      isModalOpen={isModalOpen}
      modalTitle="Add Ticket"
      modalClose={modalClose}
      buttons={[
        {
          btnText: "Cancel",
          buttonCss: "py-1.5 px-5",
          btnClick: modalClose,
        },
        {
          btnText: "Submit",
          buttonCss: "py-1.5 px-5",
          btnClick: handleSubmit(onSubmit), // use RHF submit
        },
      ]}
    >
      <div>
        <Controller
          control={control}
          name="requestType"
          render={({ field }) => (
            <FormSelect
              label="Request Type"
              value={field.value}
              onChange={field.onChange}
              options={requestTypeOption}
              error={errors.requestType}
              className="mb-2"
              labelClass="mb-2"
              placeholder="Select Ticket Type"
            />
          )}
        />
        <div>
          <FormInputField
            label="Request Name"
            placeholder="Enter Request Name"
            isMandatory
            {...register("requestName", {
              required: "Request Name is required",
            })}
            className="mt-0 mb-2"
            error={errors.requestName}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Notes</label>
          <textarea
            {...register("notes")}
            placeholder="Enter your notes..."
            className="w-full border rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-300"
            rows={4}
          />
          {errors.notes && (
            <span className="text-red-500 text-sm">{errors.notes.message}</span>
          )}
        </div>
      </div>
    </ModalData>
  );
}
