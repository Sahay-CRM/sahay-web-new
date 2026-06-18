import { useEffect, useState } from "react";
import CompanyAccessGuard from "@/components/shared/CompanyAccessGuard/CompanyAccessGuard";
import { FormProvider, useFormContext, Controller } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import useStepForm from "@/components/shared/StepProgress/useStepForm";
import StepProgress from "@/components/shared/StepProgress/stepProgress";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import TableData from "@/components/shared/DataTable/DataTable";
import SearchInput from "@/components/shared/SearchInput";
import DropdownSearchMenu from "@/components/shared/DropdownSearchMenu/DropdownSearchMenu";
import FormDateTimePicker from "@/components/shared/FormDateTimePicker/formDateTimePicker";

import { FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import AddMeetingModal from "./addMeetingModal";
import useCloneDetailMeeting from "./useCloneDetailMeeting";

import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { getEmployee } from "@/features/api/companyEmployee";
import { useGetAdminMeetingTemplatesAll } from "@/features/api/detailMeeting";
import PageNotAccess from "@/pages/PageNoAccess";
import { mapPaginationDetails } from "@/lib/mapPaginationDetails";

const MeetingTemplateStep = () => {
  const { control, setValue } = useFormContext();
  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 25,
    search: "",
  });

  const { data: templatesRes, isLoading } = useGetAdminMeetingTemplatesAll(paginationFilter);
  const templates = templatesRes?.data || [];

  const mappedTemplates = templates.map((item, index) => ({
    ...item,
    srNo:
      ((templatesRes?.currentPage || 1) - 1) * (templatesRes?.pageSize || 25) +
      index +
      1,
  }));

  const [columnToggleOptions, setColumnToggleOptions] = useState([
    { key: "srNo", label: "Sr No", visible: true },
    { key: "title", label: "Template Title", visible: true },
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
    <div className="h-full flex flex-col overflow-hidden">
      <div className="mt-1 mb-4 flex items-start justify-between shrink-0">
        <div className="flex items-center gap-2">
          <SearchInput
            placeholder="Search templates..."
            searchValue={paginationFilter?.search || ""}
            setPaginationFilter={setPaginationFilter}
            className="w-80"
          />
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
        name="templateId"
        control={control}
        rules={{ required: "Please select a meeting template" }}
        render={({ field }) => (
          <TableData
            tableData={mappedTemplates}
            columns={visibleColumns}
            primaryKey="id"
            multiSelect={false}
            selectedValue={mappedTemplates.find((t) => t.id === field.value)}
            handleChange={(item) => {
              if (item && !Array.isArray(item)) {
                field.onChange(item.id || "");
                setValue("templateName", item.title || "");
                const minutes = item.timePlanned
                  ? Math.round(Number(item.timePlanned) / 60)
                  : "";
                setValue("meetingName", item.title || "");
                setValue("meetingTimePlanned", String(minutes));
              }
            }}
            onCheckbox={() => true}
            paginationDetails={mapPaginationDetails(templatesRes)}
            setPaginationFilter={setPaginationFilter}
            isLoading={isLoading}
            showActionsColumn={false}
            actionColumnWidth="w-0"
            tableHeightClass="flex-1"
          />
        )}
      />
    </div>
  );
};

const MeetingInfoStep = () => {
  const {
    register,
    formState: { errors },
    control,
  } = useFormContext();

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="col-span-2 px-4 py-4 grid grid-cols-2 gap-4 h-fit content-start">
        <FormInputField
          label="Meeting Name"
          {...register("meetingName", { required: "Name is required" })}
          error={errors.meetingName}
          isMandatory
          placeholder="Enter Meeting Name"
        />
           <Controller
          control={control}
          name="meetingTimePlanned"
          rules={{
            required: "Planned time is required",
            validate: (value) => {
              if (Number(value) <= 0) {
                return "Planned time must be greater than 0";
              }
              return true;
            },
          }}
          render={({ field }) => {
            const totalMinutes = Number(field.value) || 0;
            const hours = totalMinutes > 0 ? Math.floor(totalMinutes / 60) : 0;
            const minutes = totalMinutes % 60;

            const handleHoursChange = (hVal: string) => {
              const h = parseInt(hVal.replace(/\D/g, ""), 10) || 0;
              field.onChange(h * 60 + minutes);
            };

            const handleMinutesChange = (mVal: string) => {
              const m = parseInt(mVal.replace(/\D/g, ""), 10) || 0;
              field.onChange(hours * 60 + m);
            };

            return (
              <div className="flex flex-col mb-2">
                <FormLabel>
                  Planned Time <span className="text-red-500 text-[20px]">*</span>
                </FormLabel>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1.5">
                    <Input
                      type="text"
                      value={hours || ""}
                      onChange={(e) => handleHoursChange(e.target.value)}
                      className="w-16 text-center text-[20px]"
                      placeholder="0"
                    />
                    <span className="text-sm font-semibold text-gray-500">h</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Input
                      type="text"
                      value={minutes || ""}
                      onChange={(e) => handleMinutesChange(e.target.value)}
                      className="w-16 text-center text-[20px]"
                      placeholder="0"
                    />
                    <span className="text-sm font-semibold text-gray-500">m</span>
                  </div>
                </div>
                {errors.meetingTimePlanned && (
                  <span className="text-red-600 text-[calc(1em-1px)] tb:text-[calc(1em-2px)] before:content-['*'] mt-1">
                    {String(errors.meetingTimePlanned.message)}
                  </span>
                )}
              </div>
            );
          }}
        />
        <FormInputField
          label="Meeting Description"
          {...register("meetingDescription", {
            required: "Description is required",
          })}
          error={errors.meetingDescription}
          isMandatory
          placeholder="Enter Meeting Description"
        />
        <Controller
          control={control}
          name="meetingDateTime"
          rules={{ required: "Date & Time is required" }}
          render={({ field }) => {
            const localDate = field.value ? new Date(field.value) : null;

            return (
              <FormDateTimePicker
                label="Meeting Date & Time"
                value={localDate}
                onChange={(date) => {
                  field.onChange(date?.toISOString());
                }}
                disablePastDates={true}
                error={errors.meetingDateTime}
              />
            );
          }}
        />
     
      </Card>
    </div>
  );
};

const JoinersStep = () => {
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
    { key: "employeeType", label: "Employee Type", visible: true },
    { key: "designationName", label: "Designation", visible: true },
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
    <div className="h-full flex flex-col overflow-hidden">
      <div className="mt-1 mb-4 flex items-start justify-between shrink-0">
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
              tableHeightClass="flex-1"
            />
          );
        }}
      />
    </div>
  );
};

const CloneDetailMeeting = () => {
  const {
    onFinish,
    isModalOpen,
    handleClose,
    onSubmit,
    trigger,
    meetingPreview,
    methods,
    isPending,
    permission,
  } = useCloneDetailMeeting();

  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([
      { label: "Company Meeting", href: "/dashboard/meeting/detail" },
      {
        label: "Clone Live Meeting",
        href: "",
      },
    ]);
  }, [setBreadcrumbs]);

  const steps = [
    <MeetingTemplateStep key="meetingTemplate" />,
    <MeetingInfoStep key="meetingInfo" />,
    <JoinersStep key="joiners" />,
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

  const stepNames = ["Meeting Template", "Meeting Info", "Joiners"];

  if (permission?.Add === false) {
    return <PageNotAccess />;
  }

  return (
    <CompanyAccessGuard>
      <FormProvider {...methods}>
        <div className="w-full h-full px-2 sm:px-4 py-6 flex flex-col overflow-hidden">
          <div className="shrink-0">
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
              isUpdate={false}
              isSubmitDisabled={false}
            />
          </div>

          <div className="step-content w-full flex-1 overflow-hidden flex flex-col pt-4">
            {stepContent}
          </div>

          {isModalOpen && (
            <AddMeetingModal
              modalData={meetingPreview as unknown as MeetingData}
              isModalOpen={isModalOpen}
              modalClose={handleClose}
              onSubmit={onSubmit}
              isLoading={isPending}
            />
          )}
        </div>
      </FormProvider>
    </CompanyAccessGuard>
  );
};

export default CloneDetailMeeting;
