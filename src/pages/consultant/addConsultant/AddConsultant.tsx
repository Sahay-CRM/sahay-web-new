import { FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import FormImage from "@/components/shared/Form/FormImage/FormImage";
import { Card } from "@/components/ui/card";
import { useAddConsultant } from "./useAddConsultant";

export default function AddConsultant() {
  const { onSubmit, methods } = useAddConsultant();
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = methods;

  return (
    <FormProvider {...methods}>
      <div className="w-full mx-auto p-4">
        <h1 className="font-semibold capitalize text-xl text-black">
          Add Consultant
        </h1>
        <div className="flex items-end justify-end gap-2 mt-2 mb-4">
          <Button onClick={methods.handleSubmit(onSubmit)}>Submit</Button>
        </div>
        <div className="flex gap-6">
          <Card className="flex items-start w-1/3 px-4 py-4">
            <FormImage
              value={watch("profilePic")}
              onChange={(val) => setValue("profilePic", val)}
              label="Upload Profile"
            />
          </Card>

          <Card className="w-2/3 px-4 py-4">
            <FormInputField
              label="Consultant Name"
              {...register("name", { required: "Name is required" })}
              error={errors.name}
            />
            <FormInputField
              label="Mobile Number"
              {...register("mobile", { required: "Mobile is required" })}
              error={errors.mobile}
            />
            <FormInputField
              label="Email"
              {...register("email", { required: "Email is required" })}
              error={errors.email}
            />
          </Card>
        </div>
      </div>
    </FormProvider>
  );
}
