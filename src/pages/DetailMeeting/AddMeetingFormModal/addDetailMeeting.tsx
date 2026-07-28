import { Controller, FormProvider } from "react-hook-form";
import { useEffect, useRef, useState, useMemo, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import useAddDetailMeeting from "./useAddDetailMeeting";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import SearchDropdown from "@/components/shared/Form/SearchDropdown";
import PageNotAccess from "@/pages/PageNoAccess";
import CompanyAccessGuard from "@/components/shared/CompanyAccessGuard/CompanyAccessGuard";
import { getCompaniesList } from "@/features/selectors/company.selector";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FormDateTimePicker from "@/components/shared/FormDateTimePicker/formDateTimePicker";
import AddMeetingModal from "./addMeetingModal";
import { getInitials } from "@/features/utils/app.utils";
import { getEmployee } from "@/features/api/companyEmployee";
import { getMeetingType } from "@/features/api/meetingType";
import { useGetDetailMeetingSearch } from "@/features/api/detailMeeting";
import { cn } from "@/lib/utils";
import { ImageBaseURL } from "@/features/utils/urls.utils";

import {
  Calendar,
  Users,
  X,
  Send,
  Loader2,
  Briefcase,
  Video,
  Crown,
  Upload,
  FileText,
  Download,
  Trash2,
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

export default function AddDetailMeeting() {
  const hookProps = useAddDetailMeeting();
  const {
    onSubmit,
    methods,
    meetingPreview,
    companyMeetingId,
    isPending,
    meetingApiData,
    permission,
    meetingDocsVal,
  } = hookProps;

  const {
    handleSubmit,
    register,
    control,
    setValue,
    watch,
    formState: { errors },
  } = methods;

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isModalOpen, setModalOpen] = useState(false);
  const handleClose = () => setModalOpen(false);
  const { setBreadcrumbs } = useBreadcrumbs();
  const navigate = useNavigate();

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

    const newFiles = meetingDocsVal.filter((_: unknown, idx: number) => idx !== indexToRemove);
    setValue("meetingDocuments", newFiles);
  };

  const companiesList = useSelector(getCompaniesList);
  const currentCompany = companiesList?.find((c) => c.isCurrentCompany);
  const resourceCompanyId = meetingApiData?.companyId;
  const isAuthorized =
    !companyMeetingId ||
    !resourceCompanyId ||
    resourceCompanyId === currentCompany?.companyId;

  // Set breadcrumbs
  useEffect(() => {
    setBreadcrumbs([
      { label: "Live Meetings", href: "/dashboard/meeting/detail" },
      {
        label: companyMeetingId ? "Update Live Meeting" : "Add Live Meeting",
        href: "",
      },
      ...(companyMeetingId && isAuthorized
        ? [
            {
              label: meetingApiData?.meetingName || "",
              href: `/dashboard/kpi/${companyMeetingId}`,
              isHighlight: true,
            },
          ]
        : []),
    ]);
  }, [companyMeetingId, meetingApiData?.meetingName, setBreadcrumbs, isAuthorized]);

  // Form values watchers
  const meetingNameValue = watch("meetingName") || "";
  const meetingDescriptionValue = watch("meetingDescription") || "";
  const prevMeetingNameRef = useRef(meetingNameValue);

  // Auto-fill description if empty
  useEffect(() => {
    if (meetingDescriptionValue === "" || meetingDescriptionValue === prevMeetingNameRef.current) {
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
    if (companyMeetingId && originalName === null && meetingNameValue.trim().length > 0) {
      setOriginalName(meetingNameValue);
    }
  }, [companyMeetingId, originalName, meetingNameValue]);

  useEffect(() => {
    if (companyMeetingId && originalName !== null) {
      setNameChanged(meetingNameValue !== originalName);
    }
  }, [companyMeetingId, originalName, meetingNameValue]);

  const shouldSearch = !companyMeetingId || nameChanged;
  const { data: meetingSearchData } = useGetDetailMeetingSearch(
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
    return meetingTypeData?.data?.map((t) => ({
      label: t.meetingTypeName || "",
      value: t.meetingTypeId || "",
      parentType: t.parentType || "",
    })) || [];
  }, [meetingTypeData]);

  const meetingTypeVal = watch("meetingTypeId");
  const employeeVal = (watch("employeeId") || []) as EmployeeDetails[];
  const meetingDateTimeVal = watch("meetingDateTime");

  const selectedType = meetingTypeOptions.find((t) => t.value === (meetingTypeVal?.meetingTypeId || meetingTypeVal));

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
    return employeeData?.data?.map((e) => ({
      label: e.employeeName || "",
      value: e.employeeId || "",
      raw: e,
    })) || [];
  }, [employeeData]);

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

  if (permission) {
    if (!companyMeetingId && permission.Add === false) {
      return <PageNotAccess />;
    }
    if (companyMeetingId && permission.Edit === false) {
      return <PageNotAccess />;
    }
  }

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
                {companyMeetingId ? "Update Live Meeting" : "Create New Live Meeting"}
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
                        {...register("meetingName", { required: "Meeting Name is required" })}
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
                        {meetingSearchData?.data?.map((item: MeetingSearchResponse) => (
                          <div
                            key={item.meetingId}
                            className="px-3 py-2 text-sm text-gray-700 border-b last:border-b-0 cursor-default hover:bg-gray-50 transition-colors"
                          >
                            <span className="font-medium">{item.meetingName}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Meeting Description */}
                  <div>
                    <label className="block text-md font-semibold text-gray-900 mb-1">
                      Meeting Description <span className="text-red-500">*</span>
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

                {/* Meeting Type and Date */}
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
                        const rawVal = field.value?.meetingTypeId || field.value;
                        return (
                          <SearchDropdown
                            className="w-full border-gray-200 text-base h-11 font-normal"
                            options={meetingTypeOptions}
                            selectedValues={rawVal ? [rawVal] : []}
                            onSelect={(value) => {
                              const matched = meetingTypeData?.data?.find((o) => o.meetingTypeId === value.value);
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

                  {/* Meeting Date & Time */}
                  <div>
                    <label className="block text-md font-semibold text-gray-900 mb-1">
                      Meeting Date & Time <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      control={control}
                      name="meetingDateTime"
                      rules={{ required: "Meeting Date & Time is required" }}
                      render={({ field }) => {
                        const localDate = field.value ? new Date(field.value) : null;
                        return (
                          <div className="[&_input]:text-base [&_input]:h-11 [&_input]:py-0 [&_input]:px-3.5 [&_input]:border-gray-200 [&_svg]:hidden">
                            <FormDateTimePicker
                              label=""
                              value={localDate}
                              onChange={(date) => {
                                field.onChange(date?.toISOString());
                              }}
                              error={errors.meetingDateTime}
                              disablePastDates={true}
                            />
                          </div>
                        );
                      }}
                    />
                  </div>
                </div>

                {/* Joiners / Attendees */}
                <div>
                  <label className="block text-md font-semibold text-gray-900 mb-1.5">
                    Attendees / Joiners <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    control={control}
                    name="employeeId"
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
                      const selectedIds = (field.value || []).map((v: EmployeeDetails) => v.employeeId);
                      return (
                        <SearchDropdown
                          className="w-full border-gray-200 text-base py-2.5 h-auto font-normal"
                          placeholder="Search attendees..."
                          options={employeeOptions}
                          selectedValues={selectedIds}
                          multiSelect={true}
                          onSelect={(item) => {
                            const currentVals: EmployeeDetails[] = Array.isArray(field.value) ? field.value : [];
                            const isAlreadySelected = currentVals.some((v) => v.employeeId === item.value);
                            if (isAlreadySelected) {
                              field.onChange(currentVals.filter((v) => v.employeeId !== item.value));
                            } else {
                              const rawEmp = employeeOptions.find((o) => o.value === item.value)?.raw;
                              if (rawEmp) {
                                field.onChange([
                                  ...currentVals,
                                  {
                                    employeeId: rawEmp.employeeId,
                                    employeeName: rawEmp.employeeName,
                                    employeeMobile: rawEmp.employeeMobile || null,
                                    employeeType: rawEmp.employeeType || null,
                                    designationName: rawEmp.designationName || null,
                                    isTeamLeader: false,
                                  },
                                ]);
                              }
                            }
                          }}
                          onSearchChange={setEmployeeSearch}
                          error={errors.employeeId}
                          isCrossShow={false}
                          onActionClick={(empId) => {
                            const currentVals: EmployeeDetails[] = Array.isArray(field.value) ? field.value : [];
                            const updated = currentVals.map((item) => ({
                              ...item,
                              isTeamLeader: item.employeeId === empId ? !item.isTeamLeader : item.isTeamLeader,
                            }));
                            field.onChange(updated);
                          }}
                          actionText="Set as Team Leader"
                          activeActionText="Team Leader"
                          actionActiveValues={
                            (field.value || [])
                              .filter((e: EmployeeDetails) => e.isTeamLeader)
                              .map((e: EmployeeDetails) => e.employeeId)
                          }
                        />
                      );
                    }}
                  />

                  {/* Selected Employees Pills */}
                  {employeeVal.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3 items-center">
                      {employeeVal.slice(0, 8).map((emp) => (
                        <div
                          key={emp.employeeId}
                          className={cn(
                            "flex items-center space-x-2 border px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
                            emp.isTeamLeader 
                              ? "bg-slate-50 border-[#2f328e]/20 text-slate-800" 
                              : "bg-gray-50 border-gray-150 text-gray-700"
                          )}
                        >
                          <div className="relative pt-1 select-none">
                            <div className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[10px] font-bold shadow-sm text-slate-700">
                              {getInitials(emp.employeeName)}
                            </div>
                            {emp.isTeamLeader && (
                              <Crown className="w-3.5 h-3.5 text-[#2f328e] fill-none absolute -top-1.5 left-1/2 -translate-x-1/2 stroke-[2.5]" />
                            )}
                          </div>
                          <span>
                            {emp.employeeName}
                          </span>
                          
                          <button
                            type="button"
                            onClick={() => {
                              setValue(
                                "employeeId",
                                employeeVal.filter((v) => v.employeeId !== emp.employeeId),
                                { shouldValidate: true }
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
                {meetingApiData?.detailMeetingStatus === "ENDED" && (
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
                        {meetingDocsVal.map((file: File | { fileId: string; fileName: string }, idx: number) => {
                          const isUploaded = !("name" in file) && "fileName" in file;
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
                                        "_blank"
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
                        })}
                      </div>
                    )}
                    {meetingDocsVal.length === 0 && (
                      <p className="text-sm text-gray-400 italic">No files selected</p>
                    )}
                  </div>
                )}
              </Card>

              {/* Action Buttons (Bottom) */}
              <div className="flex items-center space-x-3 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard/meeting/detail")}
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
                      <span>{companyMeetingId ? "Update Meeting" : "Create Meeting"}</span>
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

                  {/* Attendees Summary */}
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-gray-50 text-gray-500 rounded-lg">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 font-semibold tracking-wider uppercase">
                        Attendees
                      </p>
                      <div className="flex -space-x-1.5 mt-1.5">
                        {employeeVal.map((emp) => (
                          <div
                            key={emp.employeeId}
                            className="relative inline-block pt-1.5"
                            title={emp.isTeamLeader ? `${emp.employeeName} (Team Leader)` : emp.employeeName}
                          >
                            <div
                              className={cn(
                                "h-7 w-7 rounded-full ring-2 ring-white flex items-center justify-center shadow-sm text-[10px] font-bold",
                                emp.isTeamLeader
                                  ? "bg-[#2f328e]/10 text-[#2f328e]"
                                  : "bg-primary/10 text-primary"
                              )}
                            >
                              {getInitials(emp.employeeName)}
                            </div>
                            {emp.isTeamLeader && (
                              <Crown className="w-3.5 h-3.5 text-[#2f328e] fill-none absolute -top-0.5 left-1/2 -translate-x-1/2 stroke-[2.5]" />
                            )}
                          </div>
                        ))}
                        {employeeVal.length === 0 && (
                          <span className="text-sm text-gray-400 font-medium">No attendees</span>
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
                        Date & Time
                      </p>
                      <p className="text-sm font-semibold text-gray-700 mt-0.5">
                        {formatDateTime(meetingDateTimeVal) || "Set date & time..."}
                      </p>
                    </div>
                  </div>

                  {/* Documents Summary */}
                  {meetingApiData?.detailMeetingStatus === "ENDED" && meetingDocsVal.length > 0 && (
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
