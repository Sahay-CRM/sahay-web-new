import { useForm } from "react-hook-form";
import ModalData from "@/components/shared/Modal/ModalData";
import { useAddUpdateRequestMutation } from "@/features/api/Request";
import FormInputField from "../../Form/FormInput/FormInputField";
import { useEffect } from "react";

interface RequestModalProps {
  type: string;
  isModalOpen: boolean;
  modalClose: () => void;
  modalTitle: string;
  defaultData?: CreateRequest | null;
}

interface RequestFormValues {
  requestName: string;
  notes: string;
}

export default function RequestModal({
  type,
  isModalOpen,
  modalClose,
  modalTitle,
  defaultData,
}: RequestModalProps) {
  const { mutate: addRequest } = useAddUpdateRequestMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RequestFormValues>({
    defaultValues: {
      requestName: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (defaultData) {
      reset({
        requestName: defaultData.requestTitle ?? "",
        notes: defaultData.requesterNote ?? "",
      });
    } else {
      reset({
        requestName: "",
        notes: "",
      });
    }
  }, [defaultData, isModalOpen, reset]);

  const onSubmit = (data: RequestFormValues) => {
    const payload = {
      requestType: type.toLowerCase(),
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
    <div>
      <ModalData
        isModalOpen={isModalOpen}
        modalTitle={modalTitle}
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
        <div className="space-y-4">
          <div>
            <span className="font-semibold">Type: </span>
            <span>{type}</span>
          </div>

          <div>
            <FormInputField
              label="Request Name"
              placeholder="Enter Request Name"
              isMandatory
              {...register("requestName", {
                required: "Request Name is required",
              })}
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
              <span className="text-red-500 text-sm">
                {errors.notes.message}
              </span>
            )}
          </div>
        </div>
      </ModalData>
    </div>
  );
}
