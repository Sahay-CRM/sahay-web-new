import { useEffect, useState, useMemo } from "react"; // Added useState, useRef, ChangeEvent
import { FormProvider, useFormContext, Controller } from "react-hook-form"; // Added useFormContext, Controller

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import useStepForm from "@/components/shared/StepProgress/useStepForm";
import StepProgress from "@/components/shared/StepProgress/stepProgress";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import TableData from "@/components/shared/DataTable/DataTable";
import SearchInput from "@/components/shared/SearchInput";
import DropdownSearchMenu from "@/components/shared/DropdownSearchMenu/DropdownSearchMenu";
import FormDateTimePicker from "@/components/shared/FormDateTimePicker/formDateTimePicker";

import AddMeetingModal from "./addRepeatMeetingModal";
import useAddRepeatMeetingForm from "./useAddRepeatMeetingForm"; // Renamed import

import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { getEmployee } from "@/features/api/companyEmployee";
import { getMeetingType } from "@/features/api/meetingType";
import { useDdMeetingStatus } from "@/features/api/meetingStatus";

import { mapPaginationDetails } from "@/lib/mapPaginationDetails";
import FormSelect from "@/components/shared/Form/FormSelect";
import DatePicker from "react-datepicker";
import PageNotAccess from "@/pages/PageNoAccess";

interface MeetingInfoProps {
  isUpdateMeeting: boolean;
}

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

const MeetingInfo = ({ isUpdateMeeting }: MeetingInfoProps) => {
  const {
    register,
    formState: { errors },
    control,
    watch,
    setValue,
  } = useFormContext();

  const meetingType = watch("meetingTypeId");
  const meetingDateTime = watch("meetingDateTime");

  let repetitionOptions = [{}];
  const getDayName = (date: Date) =>
    date.toLocaleDateString("en-US", { weekday: "long" });
  function getOrdinalWeekday(date: Date) {
    const day = date.getDay();
    const dateOfMonth = date.getDate();
    const lastDateOfMonth = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0,
    ).getDate();

    const weekdayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const ordinals = ["first", "second", "third", "fourth", "fifth"];

    // Calculate week number in month (1-based)
    const weekNumber = Math.ceil(dateOfMonth / 7);

    // Check if date is in the last week of the month
    const daysLeftInMonth = lastDateOfMonth - dateOfMonth;
    const isLastWeek = daysLeftInMonth < 7;

    const ordinalLabel = isLastWeek ? "last" : ordinals[weekNumber - 1];

    return `${ordinalLabel} ${weekdayNames[day]}`;
  }

  if (meetingDateTime) {
    try {
      const dateObj = new Date(meetingDateTime);
      const dayName = getDayName(dateObj);
      const ordinalWeekday = getOrdinalWeekday(dateObj);
      const lastDateOfMonth = new Date(
        dateObj.getFullYear(),
        dateObj.getMonth() + 1,
        0,
      ).getDate();

      const dateOfMonth = dateObj.getDate();
      const daysLeftInMonth = lastDateOfMonth - dateOfMonth;
      const isLastWeek = daysLeftInMonth < 7;
      const monthName = dateObj.toLocaleDateString("en-US", { month: "long" }); // e.g., "March"
      const isLastDayOfMonth = dateOfMonth === lastDateOfMonth;

      repetitionOptions = [
        { value: "DAILY", label: "Daily" },
        { value: "DAILYALTERNATE", label: "Daily (Every Other Day)" },
        { value: "WEEKLY", label: `Weekly on ${dayName}` },
        // Conditionally include only one of these two:
        ...(isLastWeek
          ? [
              {
                value: "MONTHLYLASTWEEKDAY",
                label: `Monthly on the last ${dayName}`,
              },
            ]
          : [
              {
                value: "MONTHLYNWEEKDAY",
                label: `Monthly on the ${ordinalWeekday}`,
              },
            ]),
        {
          value: "MONTHLYDATE",
          label: `Monthly on the ${getOrdinalDate(dateOfMonth)} date `,
        },
        ...(isLastDayOfMonth
          ? [
              {
                value: "MONTHLYLASTDAY",
                label: `Monthly on the last day (${getOrdinalDate(lastDateOfMonth)})`,
              },
            ]
          : []),

        {
          value: "YEARLYDATE",
          label: `Yearly on ${monthName} ${getOrdinalDate(dateOfMonth)}`, // Yearly - Date (e.g., March 14th)
        },
        ...(!isLastDayOfMonth
          ? [
              {
                value: "YEARLYMONTHNWEEKDAY",
                label: `Yearly on the ${ordinalWeekday} of ${monthName}  `,
              },
            ]
          : []),
        ...(isLastDayOfMonth
          ? [
              {
                value: "YEARLYMONTHLASTWEEKDAY",
                label: `Yearly on the last ${dayName} of ${monthName}  `,
              },
            ]
          : []),
      ];
    } catch {
      // fallback if invalid date
      repetitionOptions = [];
    }
  } else {
    repetitionOptions = [];
  }

  function getOrdinalDate(n: number) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  const { data: meetingStatusData } = useDdMeetingStatus();

  const meetingStatusOptions = useMemo(() => {
    return (
      meetingStatusData?.map((status) => ({
        label: status.meetingStatus,
        value: status.meetingStatusId,
        order: status.meetingStatusOrder,
      })) || []
    );
  }, [meetingStatusData]);

  const shouldHideStatus =
    !isUpdateMeeting && meetingType?.parentType === "DETAIL";

  useEffect(() => {
    if (shouldHideStatus && meetingStatusOptions.length > 0) {
      const defaultStatus = meetingStatusOptions.find((s) => s.order === 1);
      if (defaultStatus) {
        setValue("meetingStatusId", defaultStatus.value, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    }
  }, [shouldHideStatus, meetingStatusOptions, setValue]);

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
                error={errors.meetingDateTime}
                // disableDaysFromToday={5}
              />
            );
          }}
        />
        <Controller
          control={control}
          name="repeatType"
          rules={{ required: "Please select Repetition Type" }}
          render={({ field }) => (
            <FormSelect
              label="Repetition"
              options={repetitionOptions}
              placeholder="Select Repetition"
              {...field}
              // value={field.value || ""}
              // onChange={field.onChange}
              error={errors.repeatType}
              isMandatory={true}
              disabled={!meetingDateTime}
            />
          )}
        />
        <Controller
          control={control}
          name="meetingTimePlanned"
          render={({ field }) => (
            <DatePicker
              // selected={selectedDateTime}
              onChange={field.onChange}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={15}
              timeCaption="Time"
              dateFormat="h:mm aa"
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
    <MeetingInfo isUpdateMeeting={repetitiveMeetingId ? true : false} />,
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
