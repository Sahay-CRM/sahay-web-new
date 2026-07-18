import { useRef, useEffect, useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import FormSelect from "@/components/shared/Form/FormSelect";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import FormDateTimePicker from "@/components/shared/FormDateTimePicker/formDateTimePicker";
import SearchDropdown from "@/components/shared/Form/SearchDropdown";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Check, ChevronDown } from "lucide-react";

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
  teamLeaders: string[];
};

interface MeetingDrawerProps {
  open: boolean;
  onClose: () => void;
  onMeetingCreated?: (meeting: CompanyMeetingDataProps) => void;
}

export default function MeetingDrawer({
  open,
  onClose,
  onMeetingCreated,
}: MeetingDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isStatusSearch, setIsStatusSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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
    filter: { isDeactivated: false },
  });

  const employeeOptions = employeedata?.data
    ? employeedata.data.map((emp) => ({
        label: emp.employeeName || "",
        value: emp.employeeId || "",
      }))
    : [];

  const filteredEmployees = employeeOptions.filter((opt) =>
    opt.label.toLowerCase().includes(employeeSearch.toLowerCase())
  );

  const { mutate: addMeeting, isPending: isCreatingMeeting } = useAddUpdateCompanyMeeting();

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
    setValue,
    trigger,
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
      teamLeaders: [],
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
        teamLeaders: [],
      });
      setShowDropdown(false);
      setIsDropdownOpen(false);
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

  const selectedJoinersIds = watch("employeeId") || [];
  const teamLeadersIds = watch("teamLeaders") || [];

  const handleSelectAttendee = (id: string) => {
    if (selectedJoinersIds.includes(id)) {
      const updatedJoiners = selectedJoinersIds.filter((item) => item !== id);
      const updatedLeaders = teamLeadersIds.filter((item) => item !== id);
      setValue("employeeId", updatedJoiners);
      setValue("teamLeaders", updatedLeaders);
    } else {
      const updatedJoiners = [...selectedJoinersIds, id];
      setValue("employeeId", updatedJoiners);
      // Auto-set the first attendee as Team Leader if none exists
      if (teamLeadersIds.length === 0) {
        setValue("teamLeaders", [id]);
      }
    }
    trigger("employeeId");
  };

  const handleToggleTeamLeader = (id: string) => {
    if (teamLeadersIds.includes(id)) {
      setValue("teamLeaders", teamLeadersIds.filter((item) => item !== id));
    } else {
      setValue("teamLeaders", [...teamLeadersIds, id]);
    }
    trigger("employeeId");
  };

  const onSubmit = (data: MeetingFormData) => {
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
      teamLeaders: data.teamLeaders,
    } as unknown as CompanyMeetingDataProps;

    addMeeting(payload, {
      onSuccess: (res) => {
        toast.success(res.message || "Meeting created successfully");
        const meeting = Array.isArray(res?.data)
          ? res?.data[0]
          : res?.data;
        if (onMeetingCreated && meeting) {
          onMeetingCreated(meeting);
        }
        onClose();
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
          <h2 className="text-lg font-semibold text-gray-800">Add Company Meeting</h2>
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
                  {meetingSearchData?.data?.map((item) => (
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

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                Joiners <span className="text-red-500">*</span>
              </label>
              <Controller
                control={control}
                name="employeeId"
                rules={{
                  validate: {
                    atLeastOne: (val) => (!val || val.length === 0 ? "Please select at least one joiner" : true),
                    hasLeader: () => {
                      const leaders = watch("teamLeaders") || [];
                      return leaders.length === 0 ? "At least one joiner must be marked as Team Leader" : true;
                    }
                  }
                }}
                render={() => (
                  <Popover open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        type="button"
                        className="w-full font-light hover:bg-white justify-between text-left text-black overflow-hidden whitespace-nowrap text-ellipsis relative py-2.5 h-auto text-base border-gray-200"
                      >
                        <span className={`truncate pr-10 ${selectedJoinersIds.length === 0 ? "text-gray-400" : ""}`}>
                          {selectedJoinersIds.length > 0
                            ? employeeOptions
                                .filter((opt) => selectedJoinersIds.includes(opt.value))
                                .map((opt) => {
                                  const isLeader = teamLeadersIds.includes(opt.value);
                                  return opt.label + (isLeader ? " (TL)" : "");
                                })
                                .join(", ")
                            : "Select attendees..."}
                        </span>
                        <ChevronDown className="absolute right-3 text-gray-500 w-4 h-4" />
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent
                      align="start"
                      className="p-0 pointer-events-auto w-[var(--radix-popover-trigger-width)] max-w-md bg-white border border-gray-200 rounded-md shadow-lg z-[999]"
                    >
                      <div className="p-2">
                        <Input
                          placeholder="Search joiners..."
                          value={employeeSearch}
                          onChange={(e) => setEmployeeSearch(e.target.value)}
                          className="h-9 focus-visible:ring-primary border-gray-200 text-sm"
                        />
                      </div>

                      <div
                        className="max-h-60 overflow-y-auto divide-y divide-gray-50"
                        onWheel={(e) => e.stopPropagation()}
                      >
                        {filteredEmployees.length > 0 ? (
                          filteredEmployees.map((item) => {
                            const isSelected = selectedJoinersIds.includes(item.value);
                            const isLeader = teamLeadersIds.includes(item.value);

                            return (
                              <div
                                key={item.value}
                                className={`px-3 py-2 flex items-center justify-between text-sm transition-colors cursor-pointer ${
                                  isSelected ? "bg-gray-50/80" : "hover:bg-gray-50"
                                }`}
                                onClick={() => handleSelectAttendee(item.value)}
                              >
                                <div className="flex items-center space-x-2 truncate">
                                  <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                    isSelected ? "bg-primary border-primary text-white" : "border-gray-300"
                                  }`}>
                                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                  <span className={`truncate ${isSelected ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                                    {item.label}
                                  </span>
                                </div>

                                {isSelected && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation(); // prevent toggling selection
                                      handleToggleTeamLeader(item.value);
                                    }}
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors border select-none shrink-0 ${
                                      isLeader
                                        ? "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200"
                                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                                    }`}
                                  >
                                    {isLeader ? "Team Leader" : "Set TL"}
                                  </button>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <div className="px-3 py-2 text-sm text-gray-500">
                            No results found
                          </div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.employeeId && (
                <span className="text-red-600 text-xs mt-1 block before:content-['*']">
                  {errors.employeeId.message}
                </span>
              )}
            </div>

            {selectedJoinersIds.length > 0 && (
              <div className="space-y-2 border border-gray-150 rounded-lg p-3.5 bg-gray-50/50">
                <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
                  Manage Attendees ({selectedJoinersIds.length})
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedJoinersIds.map((id) => {
                    const emp = employeeOptions.find((opt) => opt.value === id);
                    if (!emp) return null;
                    const isLeader = teamLeadersIds.includes(id);

                    return (
                      <div
                        key={id}
                        className="flex items-center justify-between bg-white px-3 py-2 rounded-md border border-gray-150 shadow-sm"
                      >
                        <span className="text-sm font-medium text-gray-700">
                          {emp.label}
                        </span>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => handleToggleTeamLeader(id)}
                            className={`text-xs font-semibold px-2.5 py-1 rounded transition-colors border ${
                              isLeader
                                ? "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200"
                                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            {isLeader ? "Team Leader" : "Set Team Leader"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSelectAttendee(id)}
                            className="text-gray-400 hover:text-red-500 text-xl font-medium focus:outline-none px-1"
                            title="Remove Attendee"
                          >
                            &times;
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
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
