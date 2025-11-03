import { useEffect, useState } from "react"; // Added useState, useRef, ChangeEvent
import { FormProvider, useFormContext, Controller } from "react-hook-form"; // Added useFormContext, Controller

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import useStepForm from "@/components/shared/StepProgress/useStepForm";
import StepProgress from "@/components/shared/StepProgress/stepProgress";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import TableData from "@/components/shared/DataTable/DataTable";
import SearchInput from "@/components/shared/SearchInput";
import DropdownSearchMenu from "@/components/shared/DropdownSearchMenu/DropdownSearchMenu";
// import FormDateTimePicker from "@/components/shared/FormDateTimePicker/formDateTimePicker";

import AddMeetingModal from "./addRepeatMeetingModal";
import useAddRepeatMeetingForm from "./useAddRepeatMeetingForm"; // Renamed import

import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { getEmployee } from "@/features/api/companyEmployee";
import { getMeetingType } from "@/features/api/meetingType";
// import { useDdMeetingStatus } from "@/features/api/meetingStatus";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { mapPaginationDetails } from "@/lib/mapPaginationDetails";
// import FormSelect from "@/components/shared/Form/FormSelect";
// import DatePicker from "react-datepicker";
import PageNotAccess from "@/pages/PageNoAccess";
import { Repeat } from "lucide-react";
import CustomModalFile from "@/components/shared/CustomModal";
import { buildRepetitionOptions } from "@/components/shared/RepeatOption/repeatOption";
import { FormLabel } from "@/components/ui/form";
import { FormTimePicker } from "@/components/shared/FormDateTimePicker/formTimePicker";

const MeetingType = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 25,
    search: "",
  });

  const { data: meetingTypeData, isLoading } = getMeetingType({
    filter: paginationFilter,
  });
  const [columnToggleOptions, setColumnToggleOptions] = useState([
    { key: "srNo", label: "Sr No", visible: true },
    { key: "meetingTypeName", label: "Meeting Type Name", visible: true },
  ]);

  const visibleColumns = columnToggleOptions.reduce(
    (acc, col) => {
      if (col.visible) acc[col.key] = col.label;
      return acc;
    },
    {} as Record<string, string>,
  );
  const onToggleColumn = (key: string) => {
    setColumnToggleOptions((prev) =>
      prev.map((col) =>
        col.key === key ? { ...col, visible: !col.visible } : col,
      ),
    );
  };
  const canToggleColumns = columnToggleOptions.length > 3;
  return (
    <div>
      <div className="mt-1 mb-4 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <SearchInput
            placeholder="Search..."
            searchValue={paginationFilter?.search || ""}
            setPaginationFilter={setPaginationFilter}
            className="w-80"
          />
          {errors.meetingTypeId && (
            <p className="text-red-600 text-[calc(1em-1px)] tb:text-[calc(1em-2px)] whitespace-nowrap before:content-['*']">
              {typeof errors.meetingTypeId?.message === "string"
                ? errors.meetingTypeId.message
                : ""}
            </p>
          )}
        </div>
        {canToggleColumns && (
          <div className="ml-4">
            <DropdownSearchMenu
              columns={columnToggleOptions}
              onToggleColumn={onToggleColumn}
            />
          </div>
        )}
      </div>
      <Controller
        name="meetingTypeId"
        control={control}
        rules={{ required: "Please select a meeting type" }}
        render={({ field }) => (
          <TableData
            tableData={
              meetingTypeData?.data?.map((item, index) => ({
                ...item,
                srNo:
                  (meetingTypeData.currentPage - 1) * meetingTypeData.pageSize +
                  index +
                  1,
              })) || []
            }
            columns={visibleColumns}
            primaryKey="meetingTypeId"
            multiSelect={false}
            selectedValue={field.value}
            handleChange={field.onChange}
            paginationDetails={mapPaginationDetails(meetingTypeData)}
            setPaginationFilter={setPaginationFilter}
            onCheckbox={() => true}
            isActionButton={() => false}
            moduleKey="type"
            showActionsColumn={false}
            isLoading={isLoading}
          />
        )}
      />
    </div>
  );
};

const MeetingInfo = () => {
  const {
    register,
    formState: { errors },
    control,
    watch,
    setValue,
  } = useFormContext();

  const { meetingApiData, saveCustomRepeatData } = useAddRepeatMeetingForm();
  const meetingDateTime = watch("meetingDateTime");

  const repeatOptions = buildRepetitionOptions(new Date());
  const [openCustomModal, setOpenCustomModal] = useState(false);
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="col-span-2 px-4 py-4 grid grid-cols-2 gap-4">
        <FormInputField
          label="Meeting Name"
          {...register("meetingName", { required: "Name is required" })}
          error={errors.meetingName}
          isMandatory
        />
        <FormInputField
          label="Meeting Description"
          {...register("meetingDescription", {
            required: "Description is required",
          })}
          error={errors.meetingDescription}
          isMandatory
        />

        <Controller
          control={control}
          name="repeatType"
          rules={{ required: "Please select Repetition Type" }}
          render={({ field }) => {
            const selectedRepeatLabel =
              repeatOptions.find((item) => item.value === field.value)?.label ||
              (field.value === "CUSTOMTYPE" ? "Custom" : "Repeat");

            return (
              <>
                <div className="flex flex-col space-y-1">
                  <FormLabel className="flex items-center">
                    Repetition
                    <span className="text-red-500 ml-1">*</span>
                  </FormLabel>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div
                        className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer border rounded-md ${
                          !meetingDateTime
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-accent"
                        }`}
                        onClick={(e) => {
                          if (!meetingDateTime) e.preventDefault();
                        }}
                      >
                        <Repeat className="w-4 h-4" />
                        <span>{selectedRepeatLabel}</span>
                      </div>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="start" className="w-fit">
                      {repeatOptions.map((item) => {
                        const isSelected = item.value === field.value;
                        return (
                          <DropdownMenuItem
                            key={item.value}
                            onClick={() => {
                              if (item.value === "CUSTOMTYPE") {
                                setOpenCustomModal(true);
                              } else {
                                field.onChange(item.value);
                              }
                            }}
                            className={`flex items-center justify-between ${
                              isSelected
                                ? "bg-accent text-accent-foreground"
                                : ""
                            }`}
                          >
                            <span>{item.label}</span>
                            {isSelected && <span className="ml-2">✔</span>}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {errors.repeatType && (
                    <span className="text-red-600 text-[calc(1em-1px)] tb:text-[calc(1em-2px)] before:content-['*']">
                      {String(errors.repeatType.message)}
                    </span>
                  )}

                  <CustomModalFile
                    open={openCustomModal}
                    defaultValues={meetingApiData?.customObj ?? undefined}
                    onOpenChange={setOpenCustomModal}
                    onSave={(data) => {
                      field.onChange("CUSTOMTYPE");
                      setValue("customObj", data);
                      saveCustomRepeatData(data);
                    }}
                  />
                </div>
              </>
            );
          }}
        />

        <Controller
          control={control}
          name="meetingDateTime"
          rules={{ required: "Time is required" }}
          render={({ field }) => (
            <FormTimePicker
              label="Meeting Time"
              value={field.value ? new Date(field.value) : null}
              onChange={(time) => field.onChange(time)}
              error={errors.meetingDateTime}
            />
          )}
        />
      </Card>
    </div>
  );
};

const Joiners = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 25,
    search: "",
  });

  const { data: employeedata, isLoading } = getEmployee({
    filter: { ...paginationFilter, isDeactivated: false },
  });
  const [columnToggleOptions, setColumnToggleOptions] = useState([
    { key: "srNo", label: "Sr No", visible: true },
    { key: "employeeName", label: "Joiners", visible: true },
    { key: "employeeMobile", label: "Mobile", visible: true },
  ]);

  const visibleColumns = columnToggleOptions.reduce(
    (acc, col) => {
      if (col.visible) acc[col.key] = col.label;
      return acc;
    },
    {} as Record<string, string>,
  );

  const onToggleColumn = (key: string) => {
    setColumnToggleOptions((prev) =>
      prev.map((col) =>
        col.key === key ? { ...col, visible: !col.visible } : col,
      ),
    );
  };
  const canToggleColumns = columnToggleOptions.length > 3;

  return (
    <div>
      <div className="mt-1 mb-4 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <SearchInput
            placeholder="Search..."
            searchValue={paginationFilter?.search || ""}
            setPaginationFilter={setPaginationFilter}
            className="w-80"
          />

          {errors?.employeeId && (
            <div className="mb-1">
              <span className="text-red-600 text-[calc(1em-1px)] tb:text-[calc(1em-2px)] whitespace-nowrap before:content-['*']">
                {String(errors?.employeeId?.message || "")}
              </span>
            </div>
          )}
        </div>
        {canToggleColumns && (
          <div className="ml-4">
            <DropdownSearchMenu
              columns={columnToggleOptions}
              onToggleColumn={onToggleColumn}
            />
          </div>
        )}
      </div>
      <Controller
        name="employeeId"
        control={control}
        rules={{
          validate: (value) => {
            if (!value || value.length === 0) {
              return "Please select at least one joiner";
            }
            const hasTeamLeader = value.some(
              (emp: EmployeeDetails) => emp.isTeamLeader,
            );
            if (!hasTeamLeader) {
              return "At least one joiner must be marked as Team Leader";
            }

            return true;
          },
        }}
        render={({ field }) => {
          return (
            <TableData
              tableData={employeedata?.data.map((item, index) => {
                const selected = (field.value || []).find(
                  (emp: EmployeeDetails) => emp.employeeId === item.employeeId,
                );
                return {
                  ...item,
                  srNo:
                    (employeedata.currentPage - 1) * employeedata.pageSize +
                    index +
                    1,
                  isTeamLeader: selected?.isTeamLeader || false,
                };
              })}
              columns={visibleColumns}
              primaryKey="employeeId"
              paginationDetails={mapPaginationDetails(employeedata)}
              setPaginationFilter={setPaginationFilter}
              multiSelect={true}
              isEditDelete={() => false}
              moduleKey="emp"
              isActionButton={() => false}
              selectedValue={field.value || []}
              handleChange={(selectedItems) => field.onChange(selectedItems)}
              customActions={(row: EmployeeDetails) => {
                const isSelected = (field.value || []).some(
                  (emp: EmployeeDetails) => emp.employeeId === row.employeeId,
                );
                if (!isSelected) return null;
                const selectedEmp = (field.value || []).find(
                  (emp: EmployeeDetails) => emp.employeeId === row.employeeId,
                );
                const isTeamLeader = selectedEmp?.isTeamLeader;

                return (
                  <Button
                    variant={isTeamLeader ? "secondary" : "outline"}
                    className=" px-3 text-[12px]"
                    onClick={() => {
                      const updated = (field.value || []).map(
                        (emp: EmployeeDetails) =>
                          emp.employeeId === row.employeeId
                            ? { ...emp, isTeamLeader: !emp.isTeamLeader }
                            : emp,
                      );
                      field.onChange(updated);
                    }}
                  >
                    {isTeamLeader ? "Remove" : "Set Team Leader"}
                  </Button>
                );
              }}
              additionalButton={() => false}
              isEditDeleteShow={false}
              isLoading={isLoading}
              actionColumnWidth="w-40"
            />
          );
        }}
      />
    </div>
  );
};

const AddRepeatMeeting = () => {
  const {
    onFinish,
    isModalOpen,
    handleClose,
    onSubmit,
    trigger,
    meetingPreview,
    methods,
    repetitiveMeetingId,
    isPending,
    meetingApiData,
    permission,
  } = useAddRepeatMeetingForm();

  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([
      { label: "Live Meeting Templates", href: "/dashboard/repeat-meeting" },
      {
        label: repetitiveMeetingId
          ? "Update Live Meeting Templates"
          : "Add Live Meeting Templates",
        href: "",
      },
      ...(repetitiveMeetingId
        ? [
            {
              label: `${
                meetingApiData?.meetingName ? meetingApiData?.meetingName : ""
              }`,
              href: `/dashboard/kpi/${repetitiveMeetingId}`,
              isHighlight: true,
            },
          ]
        : []),
    ]);
  }, [repetitiveMeetingId, meetingApiData?.meetingName, setBreadcrumbs]);

  const steps = [
    <MeetingType key="meetingType" />,
    <MeetingInfo />,
    <Joiners key="joiners" />,
  ];

  const {
    back,
    next,
    stepContent,
    totalSteps,
    currentStep,
    isFirstStep,
    isLastStep,
  } = useStepForm(steps, trigger);

  const stepNames = ["Meeting Type", "Meeting Info", "Joiners"];

  if (permission && (permission.Add === false || permission.Edit === false)) {
    return <PageNotAccess />;
  }

  return (
    <FormProvider {...methods}>
      <div className="w-full px-2 overflow-x-auto sm:px-4 py-6">
        <StepProgress
          currentStep={currentStep}
          stepNames={stepNames}
          totalSteps={totalSteps}
          back={back}
          isFirstStep={isFirstStep}
          next={next}
          isLastStep={isLastStep}
          isPending={isPending}
          onFinish={onFinish}
          isUpdate={!!repetitiveMeetingId}
        />

        <div className="step-content w-full">{stepContent}</div>

        {isModalOpen && (
          <AddMeetingModal
            modalData={meetingPreview as MeetingData}
            isModalOpen={isModalOpen}
            modalClose={handleClose}
            onSubmit={onSubmit}
            isLoading={isPending}
          />
        )}
      </div>
    </FormProvider>
  );
};

export default AddRepeatMeeting;
