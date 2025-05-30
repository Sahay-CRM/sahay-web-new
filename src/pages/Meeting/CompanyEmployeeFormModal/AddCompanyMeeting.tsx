import { Controller, FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import StepProgress from "@/components/shared/StepFom/StepForm";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import { Card } from "@/components/ui/card";
import { useAddCompanyEmployee } from "./useAddCompanyMeeting";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import TableData from "@/components/shared/DataTable/DataTable";
// import { FormDatePicker } from "@/components/shared/Form/FormDatePicker/FormDatePicker";

interface AddAdminMeetingProps {
  isEditMode?: boolean;
}

export default function AddMeeting({
  isEditMode = false,
}: AddAdminMeetingProps) {
  const { id } = useParams();
  // const isEditMode = !!id;

  const {
    step,
    nextStep,
    prevStep,
    onSubmit,
    steps,
    methods,
    setCountryCode,
    fetchEmployeeById,
  } = useAddCompanyEmployee();

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = methods;

  useEffect(() => {
    if (isEditMode && id) {
      fetchEmployeeById(id).then((data) => {
        reset(data);
        setCountryCode(data.countryCode ?? "+91");
      });
    }
  }, [isEditMode, id, fetchEmployeeById, reset, setCountryCode]);

  const data = {
    success: true,
    status: 200,
    message: "Meetings fetched successfully.",
    totalCount: 2,
    data: [
      {
        srNo: 1,
        meetingId: "1158d877-9a2c-4280-881f-eded62d37308",
        meetingName: "Pritesh Meeting",
        meetingDescription: "Pritesh Meeting",
        meetingDateTime: "2025-05-15T00:10:00.000Z",
        companyId: "90f1e0ad-2e58-44a0-a8fb-2e2f2b9b84da",
        createdBy: "02afc708-d586-4584-b729-aa320adb78d5",
        meetingTypeId: "87627210-9fe7-42b1-ab17-29e2aba9d4cb",
        meetingStatusId: "c1c98df6-480b-4dec-8ba6-8f718e96395d",
        joiners: ["02afc708-d586-4584-b729-aa320adb78d5"],
      },
      {
        srNo: 2,
        meetingId: "00095009-6ed1-4688-830e-98da8bc2c761",
        meetingName: "Just addeda",
        meetingDescription: "Just added meeting",
        meetingDateTime: "2025-04-18T19:10:00.000Z",
        companyId: "90f1e0ad-2e58-44a0-a8fb-2e2f2b9b84da",
        createdBy: "068eeab4-ed89-47f9-bd9d-1e1344bbcd6d",
        meetingTypeId: "a2c3f895-94fd-4eb0-b023-8e78bc2774cb",
        meetingStatusId: "c1c98df6-480b-4dec-8ba6-8f718e96395d",
        joiners: ["02afc708-d586-4584-b729-aa320adb78d5"],
      },
    ],
  };
  return (
    <FormProvider {...methods}>
      <div className="w-full mx-auto p-4">
        <h2 className="text-xl font-semibold mb-4">
          {isEditMode ? "Update Meeting" : "Add New Meeting"}
        </h2>

        <StepProgress currentStep={step} totalSteps={4} stepNames={steps} />

        <div className="flex items-end justify-end gap-2 mt-2 mb-4">
          {step > 1 && <Button onClick={prevStep}>Back</Button>}
          {step < 4 ? (
            <Button onClick={nextStep}>Next</Button>
          ) : (
            <Button onClick={handleSubmit((data) => onSubmit(data, id))}>
              {isEditMode ? "Update" : "Submit"}
            </Button>
          )}
        </div>

        {step === 1 && (
          <div className="grid grid-cols-2 gap-4">
            <Card className="col-span-2 px-4 py-4 grid grid-cols-2 gap-4">
              <FormInputField
                label="Meeting Name"
                {...register("meetingName", { required: "Name is required" })}
                error={errors.meetingName}
              />

              <FormInputField
                label="Meeting Description"
                {...register("meetingDescription", {
                  required: "Description is required",
                })}
                error={errors.meetingDescription}
              />

              {/* <FormInputField
                type="date"
                label="Meeting Date"
                {...register("meetingDateTime", {
                  required: "Date & Time is required",
                })}
                error={errors.meetingDateTime}
              /> */}
              {/* <Controller
                name="dueDate"
                control={methods.control}
                render={({ field }) => (
                  <FormDatePicker
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              /> */}
            </Card>
          </div>
        )}

        {step === 2 && (
          <Controller
            name="meetingStatus"
            control={methods.control}
            rules={{ required: "Please select a meeting" }}
            render={({ field }) => (
              <TableData
                {...field}
                tableData={data?.data?.map((item, index) => ({
                  ...item,
                  srNo: index + 1,
                }))}
                columns={{
                  srNo: "Sr No",
                  meetingName: "Meeting Name",
                }}
                primaryKey="meetingId"
                multiSelect={false}
                selectedValue={field.value}
                handleChange={field.onChange}
                paginationDetails={data}
                // setPaginationFilter={setPaginationFilter}
              />
            )}
          />
        )}
        {step === 3 && (
          <Controller
            name="meetingStatus"
            control={methods.control}
            rules={{ required: "Please select a meeting" }}
            render={({ field }) => (
              <TableData
                {...field}
                tableData={data?.data?.map((item, index) => ({
                  ...item,
                  srNo: index + 1,
                }))}
                columns={{
                  srNo: "Sr No",
                  meetingName: "Meeting Name",
                }}
                primaryKey="meetingId"
                multiSelect={false}
                selectedValue={field.value}
                handleChange={field.onChange}
                paginationDetails={data}
                // setPaginationFilter={setPaginationFilter}
              />
            )}
          />
        )}

        {step === 4 && (
          <Controller
            name="meetingStatus"
            control={methods.control}
            rules={{ required: "Please select a meeting" }}
            render={({ field }) => (
              <TableData
                {...field}
                tableData={data?.data?.map((item, index) => ({
                  ...item,
                  srNo: index + 1,
                }))}
                columns={{
                  srNo: "Sr No",
                  meetingName: "Meeting Name",
                }}
                primaryKey="meetingId"
                multiSelect={false}
                selectedValue={field.value}
                handleChange={field.onChange}
                paginationDetails={data}
                // setPaginationFilter={setPaginationFilter}
              />
            )}
          />
        )}
      </div>
    </FormProvider>
  );
}
