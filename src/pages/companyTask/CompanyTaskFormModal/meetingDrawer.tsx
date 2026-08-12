import { useRef, useEffect, useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import FormSelect from "@/components/shared/Form/FormSelect";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import FormDateTimePicker from "@/components/shared/FormDateTimePicker/formDateTimePicker";
import SearchDropdown from "@/components/shared/Form/SearchDropdown";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { useGetEmployeeDd } from "@/features/api/companyEmployee";
import { getMeetingType } from "@/features/api/meetingType";
import { useGetCompanyMeetingSearch, useAddUpdateCompanyMeeting } from "@/features/api/companyMeeting";
import { useDdMeetingStatus } from "@/features/api/meetingStatus";

type MeetingFormData = {
  meetingId: string;
  meetingName: string;
  meetingDescription: string;
  meetingDateTime: Date | string | null;
  endDate: Date | string | null;
  meetingTypeId: string;
  meetingStatusId: string;
  employeeId: string[];
  estimatedHours?: string;
  estimatedMinutes?: string;
  remarks?: string;
};

interface MeetingDrawerProps {
  open: boolean;
  onClose: () => void;
  onMeetingCreated?: (meeting: CompanyMeetingDataProps) => void;
  isPlanningMode?: boolean;
  onPlanningSubmit?: (meeting: { meetingId: string; estimatedTime: number; remarks: string; title: string }) => void;
}

export default function MeetingDrawer({
  open,
  onClose,
  onMeetingCreated,
  isPlanningMode = false,
  onPlanningSubmit,
}: MeetingDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isStatusSearch, setIsStatusSearch] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");

  const { data: meetingTypeData } = getMeetingType({
    filter: {},
  });

  const meetingTypeOptions = meetingTypeData
    ? meetingTypeData.data.map((type) => ({
        label: type.meetingTypeName || "",
        value: type.meetingTypeId || "",
      }))
    : [];

  const { data: meetingStatusData } = useDdMeetingStatus({
    filter: {
      search: isStatusSearch.length >= 3 ? isStatusSearch : undefined,
    },
  });

  const meetingStatusOptions = useMemo(() => {
    return (
      meetingStatusData?.map((status) => ({
        label: status.meetingStatus,
        value: status.meetingStatusId,
        color: status.color,
      })) || []
    );
  }, [meetingStatusData]);

  const { data: employeedata } = useGetEmployeeDd({
    filter: {
      isDeactivated: false,
      search: employeeSearch.trim().length >= 3 ? employeeSearch : undefined,
    },
  });

  const employeeOptions = employeedata?.data
    ? employeedata.data.map((emp) => ({
        label: emp.employeeName || "",
        value: emp.employeeId || "",
      }))
    : [];

  const { mutate: addMeeting, isPending: isCreatingMeeting } = useAddUpdateCompanyMeeting();

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
    setValue,
  } = useForm<MeetingFormData>({
    defaultValues: {
      meetingId: "",
      meetingName: "",
      meetingDescription: "",
      meetingDateTime: null,
      endDate: null,
      meetingTypeId: "",
      meetingStatusId: "",
      employeeId: [],
      estimatedHours: "",
      estimatedMinutes: "",
      remarks: "",
    },
  });

  const meetingNameValue = watch("meetingName") || "";
  const meetingDescriptionValue = watch("meetingDescription") || "";
  const prevMeetingNameRef = useRef(meetingNameValue);

  // Similar meetings search hook
  const { data: meetingSearchData } = useGetCompanyMeetingSearch(
    meetingNameValue.trim().length >= 5 ? meetingNameValue : "",
  );

  const showResults =
    showDropdown &&
    meetingNameValue.trim().length >= 5 &&
    (meetingSearchData?.data?.length ?? 0) > 0;

  useEffect(() => {
    if (meetingDescriptionValue === "" || meetingDescriptionValue === prevMeetingNameRef.current) {
      if (meetingDescriptionValue !== meetingNameValue) {
        setValue("meetingDescription", meetingNameValue);
      }
    }
    prevMeetingNameRef.current = meetingNameValue;
  }, [meetingNameValue, meetingDescriptionValue, setValue]);

  useEffect(() => {
    if (meetingTypeData?.data?.[0]?.meetingTypeId && !watch("meetingTypeId")) {
      setValue("meetingTypeId", meetingTypeData.data[0].meetingTypeId);
    }
  }, [setValue, meetingTypeData?.data, watch]);

  useEffect(() => {
    if (meetingStatusOptions.length > 0 && !watch("meetingStatusId")) {
      setValue("meetingStatusId", meetingStatusOptions[0].value);
    }
  }, [meetingStatusOptions, setValue, watch]);

  useEffect(() => {
    if (open) {
      reset({
        meetingId: "",
        meetingName: "",
        meetingDescription: "",
        meetingDateTime: null,
        endDate: null,
        meetingTypeId: meetingTypeData?.data?.[0]?.meetingTypeId || "",
        meetingStatusId: meetingStatusOptions?.[0]?.value || "",
        employeeId: [],
        estimatedHours: "",
        estimatedMinutes: "",
        remarks: "",
      });
      setShowDropdown(false);
      setEmployeeSearch("");
    }
  }, [open, reset, meetingTypeData, meetingStatusOptions]);

  // Click outside to close drawer and similar meetings dropdown
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Close similar meetings search dropdown if click is outside it
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setShowDropdown(false);
      }

      // Ignore click if it's on a portal, calendar popover, or select dropdown overlay
      if (
        target.closest("[role='dialog']") ||
        target.closest("[role='listbox']") ||
        target.closest("[data-radix-portal]") ||
        target.closest(".rdp") ||
        target.closest(".react-datepicker")
      ) {
        return;
      }

      if (
        drawerRef.current &&
        !drawerRef.current.contains(target) &&
        open
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [open, onClose]);

  // selectedJoinersIds and handleSelectAttendee removed

  const onSubmit = (data: MeetingFormData) => {
    if (isPlanningMode) {
      const hours = Number(data.estimatedHours) || 0;
      const minutes = Number(data.estimatedMinutes) || 0;
      const mins = hours * 60 + minutes;
      if (mins <= 0) {
        toast.error("Estimated time must be greater than 0");
        return;
      }
    }

    const payload = {
      meetingName: data.meetingName,
      meetingDescription: data.meetingDescription || data.meetingName,
      meetingDateTime: data.meetingDateTime
        ? new Date(data.meetingDateTime).toISOString()
        : null,
      endDate: data.endDate
        ? new Date(data.endDate).toISOString()
        : null,
      meetingTypeId: data.meetingTypeId,
      meetingStatusId: data.meetingStatusId,
      joiners: data.employeeId,
    } as unknown as CompanyMeetingDataProps;

    addMeeting(payload, {
      onSuccess: (res) => {
        toast.success(res.message || "Meeting created successfully");
        const meeting = Array.isArray(res?.data)
          ? res?.data[0]
          : res?.data;
        if (isPlanningMode && onPlanningSubmit && meeting?.meetingId) {
          const mins = (Number(data.estimatedHours) || 0) * 60 + (Number(data.estimatedMinutes) || 0);
          const remarksVal = data.remarks || "";
          onPlanningSubmit({
            meetingId: meeting.meetingId,
            estimatedTime: mins,
            remarks: remarksVal,
            title: meeting.meetingName || data.meetingName,
          });
        } else {
          if (onMeetingCreated && meeting) {
            onMeetingCreated(meeting);
          }
          onClose();
        }
      },
      onError: (error: Error) => {
        const axiosError = error as AxiosError<{ message?: string }>; 
        toast.error(axiosError.response?.data?.message || "Failed to create meeting");
      },
    });
  };

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/60 z-[70] transition-opacity" />}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-lg z-[70] transform transition-transform duration-300 ease-in-out flex flex-col
          ${open ? "translate-x-0" : "translate-x-full"}
        `}
        style={{ pointerEvents: open ? "auto" : "none" }}
      >
        <div className="flex justify-between items-center p-4 border-b shrink-0">
          <h2 className="text-lg font-semibold text-gray-800">Add Company Meeting </h2>
          <button
            onClick={onClose}
            type="button"
            className="text-gray-500 text-2xl hover:text-gray-700 focus:outline-none"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            <div className="relative z-50" ref={dropdownRef}>
              <FormInputField
                label="Meeting Name"
                isMandatory
                {...register("meetingName", {
                  required: "Meeting Name is required",
                })}
                error={errors.meetingName}
                placeholder="Enter meeting name..."
                onFocus={() => {
                  if (meetingNameValue.trim().length >= 5) {
                    setShowDropdown(true);
                  }
                }}
              />
              {showResults && (
                <div
                  className="absolute top-[100%] left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto z-[999]"
                  onWheel={(e) => e.stopPropagation()}
                >
                  <div className="px-3 py-2 text-[12px] text-gray-500 bg-gray-50 border-b border-gray-200 sticky top-0 font-medium">
                    Similar Meetings Found
                  </div>
                  {meetingSearchData?.data?.map((item: { meetingId?: string; meetingName?: string }) => (
                    <div
                      key={item.meetingId}
                      className="px-3 py-2 text-sm text-gray-750 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 font-normal"
                      onClick={() => {
                        setValue("meetingName", item.meetingName || "");
                        setValue("meetingDescription", item.meetingName || "");
                        setShowDropdown(false);
                      }}
                    >
                      <span>{item.meetingName}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <FormInputField
              label="Meeting Description"
              isMandatory
              {...register("meetingDescription", {
                required: "Description is required",
              })}
              error={errors.meetingDescription}
              placeholder="Enter meeting description..."
            />

            <Controller
              control={control}
              name="meetingDateTime"
              rules={{
                required: {
                  value: true,
                  message: "Meeting Start Date is Required",
                },
              }}
              render={({ field }) => {
                const localDate = field.value
                  ? new Date(
                      new Date(field.value).getTime() +
                        new Date().getTimezoneOffset() * 60000,
                    )
                  : null;

                return (
                  <div className="[&_input]:text-base [&_input]:py-2 [&_input]:px-3.5 [&_input]:border-gray-200 [&_input]:h-auto [&_svg]:hidden">
                    <FormDateTimePicker
                      label="Meeting Start Date"
                      value={localDate}
                      isMandatory
                      onChange={(date) => {
                        if (date) {
                          const utcDate = new Date(
                            date.getTime() - date.getTimezoneOffset() * 60000,
                          );
                          field.onChange(utcDate);
                        } else {
                          field.onChange(null);
                        }
                      }}
                      error={errors.meetingDateTime}
                      portalId=""
                    />
                  </div>
                );
              }}
            />

            <Controller
              control={control}
              name="endDate"
              render={({ field }) => {
                const localDate = field.value
                  ? new Date(
                      new Date(field.value).getTime() +
                        new Date().getTimezoneOffset() * 60000,
                    )
                  : null;

                return (
                  <div className="[&_input]:text-base [&_input]:py-2 [&_input]:px-3.5 [&_input]:border-gray-200 [&_input]:h-auto [&_svg]:hidden">
                    <FormDateTimePicker
                      label="Meeting End Date"
                      value={localDate}
                      onChange={(date) => {
                        if (date) {
                          const utcDate = new Date(
                            date.getTime() - date.getTimezoneOffset() * 60000,
                          );
                          field.onChange(utcDate);
                        } else {
                          field.onChange(null);
                        }
                      }}
                      error={errors.endDate}
                      portalId=""
                    />
                  </div>
                );
              }}
            />

            <Controller
              control={control}
              name="meetingStatusId"
              rules={{ required: "Meeting Status is required" }}
              render={({ field }) => (
                <SearchDropdown
                  className="w-full border-gray-200 text-base py-2.5 h-auto font-normal"
                  label="Meeting Status"
                  options={meetingStatusOptions}
                  error={errors.meetingStatusId}
                  isMandatory
                  placeholder="Select an Meeting status..."
                  selectedValues={field.value ? [field.value] : []}
                  onSelect={(value) => field.onChange(value.value)}
                  onSearchChange={setIsStatusSearch}
                />
              )}
            />

            <Controller
              control={control}
              name="meetingTypeId"
              rules={{ required: "Meeting Type is required" }}
              render={({ field }) => (
                <FormSelect
                  label="Meeting Type"
                  value={field.value}
                  onChange={field.onChange}
                  options={meetingTypeOptions}
                  error={errors.meetingTypeId}
                  placeholder="Select meeting type"
                  isMandatory
                />
              )}
            />

            <Controller
              control={control}
              name="employeeId"
              rules={{ required: "Please select at least one joiner" }}
              render={({ field }) => (
                <SearchDropdown
                  className="w-full border-gray-200 text-base py-2.5 h-auto font-normal shadow-none"
                  label="Joiners"
                  isMandatory
                  placeholder="Select joiners..."
                  options={employeeOptions}
                  selectedValues={field.value || []}
                  multiSelect={true}
                  onSelect={(item) => {
                    const currentVals = Array.isArray(field.value) ? field.value : [];
                    if (currentVals.includes(item.value)) {
                      field.onChange(currentVals.filter((v) => v !== item.value));
                    } else {
                      field.onChange([...currentVals, item.value]);
                    }
                  }}
                  onSearchChange={setEmployeeSearch}
                  error={errors.employeeId}
                  isCrossShow={false}
                />
              )}
            />


            {isPlanningMode && (
              <>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Estimated Hours</label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="0"
                      {...register("estimatedHours")}
                      className="border-gray-200 focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Estimated Minutes</label>
                    <Input
                      type="number"
                      min={0}
                      max={59}
                      placeholder="0"
                      {...register("estimatedMinutes")}
                      className="border-gray-200 focus:border-primary"
                    />
                  </div>
                </div>
                <div className="space-y-1 mt-4">
                  <label className="text-sm font-semibold text-gray-700">Remarks</label>
                  <Textarea
                    placeholder="Add planning remarks..."
                    {...register("remarks")}
                    className="border-gray-200 focus:border-primary resize-none min-h-[80px]"
                  />
                </div>
              </>
            )}
          </div>

          <div className="p-4 border-t flex justify-end space-x-2 shrink-0 bg-gray-50/50">
            <Button
              variant="outline"
              type="button"
              onClick={onClose}
              className="border-gray-300 text-gray-700 font-medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreatingMeeting}
              className="bg-primary hover:bg-primary-dark text-white font-medium"
            >
              {isCreatingMeeting ? "Saving..." : "Save Meeting"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
