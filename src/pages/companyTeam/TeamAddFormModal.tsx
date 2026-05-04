import { FormProvider, useForm } from "react-hook-form";
import ModalData from "@/components/shared/Modal/ModalData";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import { useAddUpdateTeam } from "@/features/api/companyTeam";
import { useSelector } from "react-redux";
import { getUserDetail } from "@/features/selectors/auth.selector";

interface TeamAddFormModalProps {
  isModalOpen: boolean;
  modalClose: () => void;
  modalData: Team | null;
}

export default function TeamAddFormModal({
  isModalOpen,
  modalClose,
  modalData,
}: TeamAddFormModalProps) {
  const methods = useForm<Team>({
    defaultValues: {
      teamName: modalData?.teamName || "",
      teamId: modalData?.teamId || undefined,
    },
  });

  const profileData = useSelector(getUserDetail);
  const companyId = profileData?.companyId;

  const addUpdateTeam = useAddUpdateTeam();

  const submitHandler = (data: Team) => {
    const payload = {
      ...data,
      companyId: companyId,
      ...(modalData?.teamId && { teamId: modalData.teamId }),
    };
    addUpdateTeam.mutate(payload, {
      onSuccess: () => {
        methods.reset();
        modalClose();
      },
    });
  };

  return (
    <FormProvider {...methods}>
      <ModalData
        isModalOpen={isModalOpen}
        modalTitle={modalData?.teamId ? "Edit Team" : "Create New Team"}
        modalClose={() => {
          methods.reset();
          modalClose();
        }}
        buttons={[
          {
            btnText: modalData?.teamId ? "Update Team" : "Create Team",
            buttonCss: "py-1.5 px-5",
            btnClick: methods.handleSubmit(submitHandler),
            isLoading: addUpdateTeam.isPending,
          },
        ]}
      >
        <div className="space-y-4">
          <FormInputField
            id="teamName"
            {...methods.register("teamName", {
              required: "Enter Team Name",
            })}
            error={methods.formState.errors.teamName}
            label="Team Name"
            placeholder={"e.g. Engineering Team"}
            containerClass="mt-0 tb:mt-0"
            className="text-lg"
            isMandatory={true}
          />
        </div>
      </ModalData>
    </FormProvider>
  );
}
