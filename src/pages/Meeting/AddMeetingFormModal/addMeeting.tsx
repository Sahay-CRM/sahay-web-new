import { Controller, FormProvider } from "react-hook-form";
import { useEffect, useRef, useState, ChangeEvent, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import useAddMeeting from "./useAddMeeting";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import SearchDropdown from "@/components/shared/Form/SearchDropdown";
import CompanyAccessGuard from "@/components/shared/CompanyAccessGuard/CompanyAccessGuard";
import { getCompaniesList } from "@/features/selectors/company.selector";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FormDateTimePicker from "@/components/shared/FormDateTimePicker/formDateTimePicker";
import AddMeetingModal from "./addMeetingModal";
import { getInitials } from "@/features/utils/app.utils";
import { ImageBaseURL } from "@/features/utils/urls.utils";
import { getEmployee } from "@/features/api/companyEmployee";
import { getMeetingType } from "@/features/api/meetingType";
import { useDdMeetingStatus } from "@/features/api/meetingStatus";
import { useGetCompanyMeetingSearch } from "@/features/api/companyMeeting";

import {
  Calendar,
  Users,
  Circle,
  X,
  Send,
  Loader2,
  FileText,
  Upload,
  Download,
  Trash2,
  Briefcase,
  Video,
} from "lucide-react";

interface MeetingSearchResponse {
  meetingId: string;
  meetingName: string;
}

interface EmployeeDetails {
  employeeId: string;
  employeeName: string;
  employeeMobile?: string | null;
  employeeType?: string | null;
  designationName?: string | null;
  isTeamLeader?: boolean;
}

export default function AddMeeting() {
  const hookProps = useAddMeeting();
  const {
    onSubmit,
    methods,
    meetingPreview,
    companyMeetingId,
    isPending,
    meetingApiData,
  } = hookProps;

  const {
    handleSubmit,
    register,
    control,
    setValue,
    watch,
    formState: { errors },
  } = methods;

  const [isModalOpen, setModalOpen] = useState(false);
  const handleClose = () => setModalOpen(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { setBreadcrumbs } = useBreadcrumbs();
  const navigate = useNavigate();

  const companiesList = useSelector(getCompaniesList);
  const currentCompany = companiesList?.find((c) => c.isCurrentCompany);
  const resourceCompanyId = meetingApiData?.data?.companyId;
  const isAuthorized =
    !companyMeetingId ||
    !resourceCompanyId ||
    resourceCompanyId === currentCompany?.companyId;

  // Set breadcrumbs
  useEffect(() => {
    setBreadcrumbs([
      { label: "Company Meeting", href: "/dashboard/meeting" },
      {
        label: companyMeetingId ? "Update Meeting" : "Add Meeting",
        href: "",
      },
      ...(companyMeetingId && isAuthorized
        ? [
            {
              label: meetingApiData?.data?.meetingName || "",
              href: `/dashboard/meeting/detail/${companyMeetingId}`,
              isHighlight: true,
            },
          ]
        : []),
    ]);
  }, [
    companyMeetingId,
    meetingApiData?.data?.meetingName,
    setBreadcrumbs,
    isAuthorized,
  ]);

  // Form values watchers
  const meetingNameValue = watch("meetingName") || "";
  const meetingDescriptionValue = watch("meetingDescription") || "";
  const prevMeetingNameRef = useRef(meetingNameValue);

  // Auto-fill description if empty
  useEffect(() => {
    if (
      meetingDescriptionValue === "" ||
      meetingDescriptionValue === prevMeetingNameRef.current
    ) {
      if (meetingDescriptionValue !== meetingNameValue) {
        setValue("meetingDescription", meetingNameValue);
      }
    }
    prevMeetingNameRef.current = meetingNameValue;
  }, [meetingNameValue, meetingDescriptionValue, setValue]);

  // Similar meetings dropdown check
  const [originalName, setOriginalName] = useState<string | null>(null);
  const [nameChanged, setNameChanged] = useState(false);

  useEffect(() => {
    if (
      companyMeetingId &&
      originalName === null &&
      meetingNameValue.trim().length > 0
    ) {
      setOriginalName(meetingNameValue);
    }
  }, [companyMeetingId, originalName, meetingNameValue]);

  useEffect(() => {
    if (companyMeetingId && originalName !== null) {
      setNameChanged(meetingNameValue !== originalName);
    }
  }, [companyMeetingId, originalName, meetingNameValue]);

  const shouldSearch = !companyMeetingId || nameChanged;
  const { data: meetingSearchData } = useGetCompanyMeetingSearch(
    shouldSearch ? meetingNameValue : "",
  );

  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(event.target as Node)
      ) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (companyMeetingId && !nameChanged) {
      setShowSearchDropdown(false);
      return;
    }
    const hasResults =
      (meetingSearchData?.data?.length ?? 0) > 0 &&
      meetingNameValue.trim().length >= 5;

    if (hasResults) {
      setShowSearchDropdown(true);
    } else {
      setShowSearchDropdown(false);
    }
  }, [meetingNameValue, meetingSearchData, companyMeetingId, nameChanged]);

  const showSimilarResults =
    shouldSearch &&
    showSearchDropdown &&
    meetingNameValue.trim().length >= 5 &&
    (meetingSearchData?.data?.length ?? 0) > 0;

  // Meeting Type options
  const { data: meetingTypeData } = getMeetingType({
    filter: { currentPage: 1, pageSize: 100 },
  });

  const meetingTypeOptions = useMemo(() => {
    return (
      meetingTypeData?.data?.map((t) => ({
        label: t.meetingTypeName || "",
        value: t.meetingTypeId || "",
        parentType: t.parentType || "",
      })) || []
    );
  }, [meetingTypeData]);

  // Meeting Status options
  const [isStatusSearch, setIsStatusSearch] = useState("");
  const { data: meetingStatusData } = useDdMeetingStatus({
    filter: {
      search: isStatusSearch.trim().length > 0 ? isStatusSearch : undefined,
    },
  });

  const meetingStatusOptions = useMemo(() => {
    return (
      meetingStatusData?.map((status) => ({
        label: status.meetingStatus || "",
        value: status.meetingStatusId || "",
        order: status.meetingStatusOrder,
        color: status.color || "#556ee6",
      })) || []
    );
  }, [meetingStatusData]);

  const meetingTypeVal = watch("meetingTypeId");
  const meetingStatusVal = watch("meetingStatusId");
  const employeeVal = (watch("employeeId") || []) as EmployeeDetails[];
  const meetingDateTimeVal = watch("meetingDateTime");
  const endDateVal = watch("endDate");
  const meetingDocsVal = watch("meetingDocuments") || [];

  const selectedType = meetingTypeOptions.find(
    (t) => t.value === (meetingTypeVal?.meetingTypeId || meetingTypeVal),
  );
  const selectedStatus = meetingStatusOptions.find(
    (s) => s.value === meetingStatusVal,
  );

  const shouldHideStatus =
    !companyMeetingId && selectedType?.parentType === "DETAIL";

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

  // Fetch employees
  const [employeeSearch, setEmployeeSearch] = useState("");
  const { data: employeeData } = getEmployee({
    filter: {
      currentPage: 1,
      pageSize: 50,
      search: employeeSearch.trim().length >= 3 ? employeeSearch : undefined,
      isDeactivated: false,
    },
  });

  const employeeOptions = useMemo(() => {
    return (
      employeeData?.data?.map((e) => ({
        label: e.employeeName || "",
        value: e.employeeId || "",
        raw: e,
      })) || []
    );
  }, [employeeData]);

  // File uploading logic
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const currentFiles = watch("meetingDocuments") || [];
    const newFiles = [...currentFiles, ...files];
    setValue("meetingDocuments", newFiles);

    if (e.target) e.target.value = ""; // Reset input
  };

  const handleRemoveFile = (indexToRemove: number) => {
    const fileToRemove = meetingDocsVal[indexToRemove];
    const currentRemovedIds = watch("removedFileIdsArray") || [];
    const updatedRemovedIds = [...currentRemovedIds];

    if (
      typeof fileToRemove === "object" &&
      "fileId" in fileToRemove &&
      !(fileToRemove instanceof File)
    ) {
      if (!updatedRemovedIds.includes(fileToRemove.fileId)) {
        updatedRemovedIds.push(fileToRemove.fileId);
      }
    }
    setValue("removedFileIdsArray", updatedRemovedIds);

    const newFiles = meetingDocsVal.filter(
      (_: unknown, idx: number) => idx !== indexToRemove,
    );
    setValue("meetingDocuments", newFiles);
  };

  const formatDateTime = (val?: string) => {
    if (!val) return "";
    return new Date(val).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleFormSubmit = async () => {
    setModalOpen(true);
  };

  return (
    <CompanyAccessGuard
      companyId={companyMeetingId ? resourceCompanyId : undefined}
      isLoading={companyMeetingId ? !meetingApiData : false}
    >
      <FormProvider {...methods}>
        <div className="w-full h-full p-6 flex flex-col overflow-y-auto bg-[#f8f8fb] font-sans">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {companyMeetingId ? "Update Meeting" : "Create New Meeting"}
              </h1>
            </div>
          </div>

          {/* Form Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left Card: Form Inputs */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6 border border-gray-100 shadow-sm bg-white rounded-xl space-y-4">
                {/* Meeting Name and Description */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Meeting Name */}
                  <div className="relative" ref={searchDropdownRef}>
                    <label className="block text-md font-semibold text-gray-900 mb-1">
                      Meeting Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        className={`w-full border rounded-md px-3.5 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                          errors.meetingName
                            ? "border-red-500 focus:ring-red-200"
                            : "border-gray-200 focus:border-primary"
                        }`}
                        placeholder="Enter meeting name..."
                        {...register("meetingName", {
                          required: "Meeting Name is required",
                        })}
                        onFocus={() => {
                          if (
                            shouldSearch &&
                            meetingNameValue.trim().length >= 5 &&
                            (meetingSearchData?.data?.length ?? 0) > 0
                          ) {
                            setShowSearchDropdown(true);
                          }
                        }}
                      />
                    </div>
                    {errors.meetingName && (
                      <span className="text-red-500 text-xs mt-1 block">
                        {String(errors.meetingName.message)}
                      </span>
                    )}

                    {showSimilarResults && (
                      <div className="absolute top-[100%] mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto z-[99]">
                        <div className="px-3 py-2 text-[12px] text-gray-500 bg-gray-50 border-b border-gray-200 sticky top-0 font-medium">
                          Similar Meetings Found
                        </div>
                        {meetingSearchData?.data?.map(
                          (item: MeetingSearchResponse) => (
                            <div
                              key={item.meetingId}
                              className="px-3 py-2 text-sm text-gray-700 border-b last:border-b-0 cursor-default hover:bg-gray-50 transition-colors"
                            >
                              <span className="font-medium">
                                {item.meetingName}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    )}
                  </div>

                  {/* Meeting Description */}
                  <div>
                    <label className="block text-md font-semibold text-gray-900 mb-1">
                      Meeting Description{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className={`w-full border rounded-md px-3.5 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                        errors.meetingDescription
                          ? "border-red-500 focus:ring-red-200"
                          : "border-gray-200 focus:border-primary"
                      }`}
                      placeholder="Enter meeting description..."
                      {...register("meetingDescription", {
                        required: "Please Enter Meeting Description",
                      })}
                    />
                    {errors.meetingDescription && (
                      <span className="text-red-500 text-xs mt-1 block">
                        {String(errors.meetingDescription.message)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Meeting Type and Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Meeting Type */}
                  <div>
                    <label className="block text-md font-semibold text-gray-900 mb-1">
                      Meeting Type <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      control={control}
                      name="meetingTypeId"
                      rules={{ required: "Please select Meeting Type" }}
                      render={({ field }) => {
                        const rawVal =
                          field.value?.meetingTypeId || field.value;
                        return (
                          <SearchDropdown
                            className="w-full border-gray-200 text-base py-2.5 h-auto font-normal"
                            options={meetingTypeOptions}
                            selectedValues={rawVal ? [rawVal] : []}
                            onSelect={(value) => {
                              const matched = meetingTypeData?.data?.find(
                                (o) => o.meetingTypeId === value.value,
                              );
                              field.onChange(matched || value.value);
                            }}
                            placeholder="Select Meeting Type..."
                            error={errors.meetingTypeId}
                            isCrossShow={false}
                          />
                        );
                      }}
                    />
                  </div>

                  {/* Meeting Status */}
                  {!shouldHideStatus && (
                    <div>
                      <label className="block text-md font-semibold text-gray-900 mb-1">
                        Meeting Status <span className="text-red-500">*</span>
                      </label>
                      <Controller
                        control={control}
                        name="meetingStatusId"
                        rules={{ required: "Please select Meeting Status" }}
                        render={({ field }) => (
                          <SearchDropdown
                            className="w-full border-gray-200 text-base py-2.5 h-auto font-normal"
                            options={meetingStatusOptions}
                            selectedValues={field.value ? [field.value] : []}
                            onSelect={(value) => {
                              field.onChange(value.value);
                              setValue("meetingStatusId", value.value);
                              setValue("meetingStatus", value.label);
                            }}
                            placeholder="Select Meeting Status..."
                            error={errors.meetingStatusId}
                            onSearchChange={setIsStatusSearch}
                            isCrossShow={false}
                          />
                        )}
                      />
                    </div>
                  )}
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Meeting Start Date */}
                  <div>
                    <label className="block text-md font-semibold text-gray-900 mb-1">
                      Meeting Start Date <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      control={control}
                      name="meetingDateTime"
                      rules={{ required: "Meeting Start Date is required" }}
                      render={({ field }) => {
                        const localDate = field.value
                          ? new Date(field.value)
                          : null;
                        return (
                          <div className="[&_input]:text-base [&_input]:py-2.5 [&_input]:px-3.5 [&_input]:border-gray-200 [&_input]:h-auto [&_svg]:hidden">
                            <FormDateTimePicker
                              label=""
                              value={localDate}
                              onChange={(date) => {
                                field.onChange(date?.toISOString());
                              }}
                              error={errors.meetingDateTime}
                              disablePastDays={
                                Number(import.meta.env.VITE_DISABLEPASTDATES) ||
                                3
                              }
                              disabled={
                                meetingApiData?.data?.deadlineRequest ===
                                "PENDING"
                              }
                            />
                          </div>
                        );
                      }}
                    />
                  </div>

                  {/* Meeting End Date */}
                  <div>
                    <label className="block text-md font-semibold text-gray-900 mb-1">
                      Meeting End Date
                    </label>
                    <Controller
                      control={control}
                      name="endDate"
                      render={({ field }) => {
                        const localDate = field.value
                          ? new Date(field.value)
                          : null;
                        return (
                          <div className="[&_input]:text-base [&_input]:py-2.5 [&_input]:px-3.5 [&_input]:border-gray-200 [&_input]:h-auto [&_svg]:hidden">
                            <FormDateTimePicker
                              label=""
                              value={localDate}
                              onChange={(date) => {
                                field.onChange(date?.toISOString());
                              }}
                              error={errors.endDate}
                              disablePastDays={
                                Number(import.meta.env.VITE_DISABLEPASTDATES) ||
                                3
                              }
                              disabled={
                                meetingApiData?.data?.deadlineRequest ===
                                "PENDING"
                              }
                            />
                          </div>
                        );
                      }}
                    />
                  </div>
                </div>

                {/* Joiners / Assignees */}
                <div>
                  <label className="block text-md font-semibold text-gray-900 mb-1.5">
                    Attendees / Joiners <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    control={control}
                    name="employeeId"
                    rules={{
                      required:
                        "Please assign this meeting to at least one attendee",
                    }}
                    render={({ field }) => {
                      const selectedIds = (field.value || []).map(
                        (v: EmployeeDetails) => v.employeeId,
                      );
                      return (
                        <SearchDropdown
                          className="w-full border-gray-200 text-base py-2.5 h-auto font-normal"
                          placeholder="Search attendees..."
                          options={employeeOptions}
                          selectedValues={selectedIds}
                          multiSelect={true}
                          onSelect={(item) => {
                            const currentVals: EmployeeDetails[] =
                              Array.isArray(field.value) ? field.value : [];
                            const isAlreadySelected = currentVals.some(
                              (v) => v.employeeId === item.value,
                            );
                            if (isAlreadySelected) {
                              field.onChange(
                                currentVals.filter(
                                  (v) => v.employeeId !== item.value,
                                ),
                              );
                            } else {
                              const rawEmp = employeeOptions.find(
                                (o) => o.value === item.value,
                              )?.raw;
                              if (rawEmp) {
                                field.onChange([
                                  ...currentVals,
                                  {
                                    employeeId: rawEmp.employeeId,
                                    employeeName: rawEmp.employeeName,
                                    employeeMobile:
                                      rawEmp.employeeMobile || null,
                                    employeeType: rawEmp.employeeType || null,
                                    designationName:
                                      rawEmp.designationName || null,
                                    isTeamLeader: false,
                                  },
                                ]);
                              }
                            }
                          }}
                          onSearchChange={setEmployeeSearch}
                          error={errors.employeeId}
                          isCrossShow={false}
                        />
                      );
                    }}
                  />

                  {/* Selected Employees Pills without Team Leader Crown selection */}
                  {employeeVal.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2.5 items-center">
                      {employeeVal.slice(0, 8).map((emp) => (
                        <div
                          key={emp.employeeId}
                          className="flex items-center space-x-1.5 border hover:bg-gray-100 px-2.5 py-1 rounded-full text-xs font-medium transition-colors bg-gray-50 border-gray-150 text-gray-700"
                        >
                          <div className="w-5 h-5 rounded-full bg-white border flex items-center justify-center text-[10px] font-bold shadow-sm select-none">
                            {getInitials(emp.employeeName)}
                          </div>
                          <span>{emp.employeeName}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setValue(
                                "employeeId",
                                employeeVal.filter(
                                  (v) => v.employeeId !== emp.employeeId,
                                ),
                                { shouldValidate: true },
                              );
                            }}
                            className="text-gray-400 hover:text-red-500 rounded-full focus:outline-none"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      {employeeVal.length > 8 && (
                        <div className="px-2.5 py-1 rounded-full text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 transition-colors border border-primary/20">
                          +{employeeVal.length - 8} more
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Upload Documents */}
                <div className="flex flex-col gap-3">
                  <label className="block text-md font-semibold text-gray-900">
                    Upload Documents (Image, PDF, Doc, Video, etc.)
                  </label>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="px-4 py-2 border-gray-300 text-gray-700 flex items-center gap-2"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4" />
                      Choose Files
                    </Button>
                    <input
                      type="file"
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.mp4,.avi,.mov,.mkv"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                      multiple
                    />
                  </div>

                  {meetingDocsVal.length > 0 && (
                    <div className="mt-2 flex flex-col gap-2">
                      <p className="text-xs text-gray-500 font-medium">
                        {meetingDocsVal.length} file(s) selected
                      </p>
                      {meetingDocsVal.map(
                        (
                          file: File | { fileId: string; fileName: string },
                          idx: number,
                        ) => {
                          const isUploaded =
                            !("name" in file) && "fileName" in file;
                          const fileName = isUploaded
                            ? (file as { fileName: string }).fileName
                            : (file as File).name;

                          return (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-100 rounded-lg"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                                <span className="text-sm font-medium text-gray-700 truncate">
                                  {fileName}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-gray-500 hover:text-primary"
                                  onClick={() => {
                                    if (file instanceof File) {
                                      const fileUrl = URL.createObjectURL(file);
                                      const link = document.createElement("a");
                                      link.href = fileUrl;
                                      link.download = file.name;
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                      URL.revokeObjectURL(fileUrl);
                                    } else if (isUploaded) {
                                      window.open(
                                        `${ImageBaseURL}/share/mDocs/${(file as { fileName: string }).fileName}`,
                                        "_blank",
                                      );
                                    }
                                  }}
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-gray-500 hover:text-red-500"
                                  onClick={() => handleRemoveFile(idx)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        },
                      )}
                    </div>
                  )}
                  {meetingDocsVal.length === 0 && (
                    <p className="text-sm text-gray-400 italic">
                      No files selected
                    </p>
                  )}
                </div>
              </Card>

              {/* Action Buttons (Bottom) */}
              <div className="flex items-center space-x-3 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard/meeting")}
                  className="px-6 border-gray-300 text-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit(handleFormSubmit)}
                  disabled={isPending}
                  className="px-6 flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>
                        {companyMeetingId ? "Update Meeting" : "Create Meeting"}
                      </span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Right Card: Meeting Summary Sidebar */}
            <div className="space-y-6">
              <Card className="p-5 border border-gray-150 shadow-sm bg-white rounded-xl space-y-4">
                <h3 className="text-base font-bold text-gray-800 border-b border-gray-100 pb-3">
                  Meeting Summary
                </h3>

                <div className="space-y-4">
                  {/* Meeting Name Summary */}
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-gray-50 text-gray-500 rounded-lg">
                      <Video className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-gray-400 font-semibold tracking-wider uppercase">
                        Meeting Name
                      </p>
                      <p className="text-sm font-semibold text-gray-700 mt-0.5 break-words">
                        {meetingNameValue || "Meeting Title..."}
                      </p>
                    </div>
                  </div>

                  {/* Meeting Type Summary */}
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-gray-50 text-gray-500 rounded-lg">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 font-semibold tracking-wider uppercase">
                        Meeting Type
                      </p>
                      <p className="text-sm font-semibold text-gray-700 mt-0.5">
                        {selectedType ? selectedType.label : "Not Selected"}
                      </p>
                    </div>
                  </div>

                  {/* Status Summary */}
                  {!shouldHideStatus && (
                    <div className="flex items-start space-x-3">
                      <div
                        className="p-2 bg-gray-50 rounded-lg"
                        style={{ color: selectedStatus?.color || "#556ee6" }}
                      >
                        <Circle
                          className="w-4 h-4"
                          style={{ fill: selectedStatus?.color || "#556ee6" }}
                        />
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-400 font-semibold tracking-wider uppercase">
                          Status
                        </p>
                        <p
                          className="text-sm font-semibold text-gray-700 mt-0.5"
                          style={{ color: selectedStatus?.color }}
                        >
                          {selectedStatus
                            ? selectedStatus.label
                            : "Draft / Scheduled"}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Attendees Summary */}
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-gray-50 text-gray-500 rounded-lg">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 font-semibold tracking-wider uppercase">
                        Attendees
                      </p>
                      <div className="flex -space-x-1.5 overflow-hidden mt-1.5">
                        {employeeVal.map((emp) => (
                          <div
                            key={emp.employeeId}
                            className="relative inline-block h-7 w-7 rounded-full ring-2 ring-white bg-primary/10 overflow-hidden shadow-sm flex items-center justify-center"
                            title={emp.employeeName}
                          >
                            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-primary">
                              {getInitials(emp.employeeName)}
                            </div>
                          </div>
                        ))}
                        {employeeVal.length === 0 && (
                          <span className="text-sm text-gray-400 font-medium">
                            No attendees
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Start Date Summary */}
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-gray-50 text-gray-500 rounded-lg">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 font-semibold tracking-wider uppercase">
                        Start Date & Time
                      </p>
                      <p className="text-sm font-semibold text-gray-700 mt-0.5">
                        {formatDateTime(meetingDateTimeVal) ||
                          "Set start date..."}
                      </p>
                    </div>
                  </div>

                  {/* End Date Summary */}
                  {endDateVal && (
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-gray-50 text-gray-500 rounded-lg">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-400 font-semibold tracking-wider uppercase">
                          End Date & Time
                        </p>
                        <p className="text-sm font-semibold text-gray-700 mt-0.5">
                          {formatDateTime(endDateVal)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Documents Summary */}
                  {meetingDocsVal.length > 0 && (
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-gray-50 text-gray-500 rounded-lg">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-400 font-semibold tracking-wider uppercase">
                          Documents
                        </p>
                        <p className="text-sm font-semibold text-gray-700 mt-0.5">
                          {meetingDocsVal.length} document(s) uploaded
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
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
      </FormProvider>
    </CompanyAccessGuard>
  );
}
