import { Controller, FormProvider } from "react-hook-form";
import { useEffect, useRef, useState, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import useAddProjectSingle from "./useAddProjectSingle";
import { useGetCompanyProjectSearch } from "@/features/api/companyProject";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import SearchDropdown from "@/components/shared/Form/SearchDropdown";
import PageNotAccess from "@/pages/PageNoAccess";
import CompanyAccessGuard from "@/components/shared/CompanyAccessGuard/CompanyAccessGuard";
import { getCompaniesList } from "@/features/selectors/company.selector";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FormDateTimePicker from "@/components/shared/FormDateTimePicker/formDateTimePicker";
import RequestModal from "@/components/shared/Modal/RequestModal";
import { getInitials } from "@/features/utils/app.utils";
import { ImageBaseURL } from "@/features/utils/urls.utils";

import {
  Folder,
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
  Layers,
} from "lucide-react";

interface ProjectSearchResponse {
  projectId: string;
  projectName: string;
}

interface Employee {
  employeeId: string;
  employeeName: string;
  employeeMobile?: string | null;
  employeeType?: string | null;
  designationName?: string | null;
}

interface SubParameter {
  subParameterId: string;
  subParameterName: string;
}

export default function AddProjectSingle() {
  const hookProps = useAddProjectSingle();
  const {
    onSubmit,
    methods,
    employeeData,
    setPaginationFilterEmployee,
    setPaginationFilterSubPara,
    subParameterData,
    companyProjectId,
    isPending,
    projectApiData,
    permission,
    StatusOptions,
    bussinessFunctOptions,
    watchedCoreParameter,
    setIsStatusSearch,
    setIsBusFuncSearch,
    isConfModalOpen,
    setIsConfModalOpen,
    reasons,
    setReasons,
    onConfirmSubmit,
    parentProjectOptions,
    setParentProjectSearch,
  } = hookProps;

  const {
    handleSubmit,
    register,
    control,
    setValue,
    watch,
    formState: { errors },
  } = methods;

  const [isReqModalOpen, setIsReqModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { setBreadcrumbs } = useBreadcrumbs();
  const navigate = useNavigate();

  const companiesList = useSelector(getCompaniesList);
  const currentCompany = companiesList?.find((c) => c.isCurrentCompany);
  const resourceCompanyId = projectApiData?.data?.companyId;
  const isAuthorized =
    !companyProjectId ||
    !resourceCompanyId ||
    resourceCompanyId === currentCompany?.companyId;

  // Set breadcrumbs
  useEffect(() => {
    setBreadcrumbs([
      { label: "Company Projects", href: "/dashboard/projects" },
      { label: companyProjectId ? "Update Project" : "Add Project", href: "" },
      ...(companyProjectId && isAuthorized
        ? [
            {
              label: projectApiData?.data?.projectName || "",
              href: `/dashboard/projects/view/${companyProjectId}`,
              isHighlight: true,
            },
          ]
        : []),
    ]);
  }, [setBreadcrumbs, projectApiData?.data?.projectName, companyProjectId, isAuthorized]);

  // Form values watchers for real-time summary card and logic
  const projectNameValue = watch("projectName") || "";
  const projectDescriptionValue = watch("projectDescription") || "";
  const prevProjectNameRef = useRef(projectNameValue);

  // Auto-fill description if empty and matches previous name
  useEffect(() => {
    if (projectDescriptionValue === "" || projectDescriptionValue === prevProjectNameRef.current) {
      if (projectDescriptionValue !== projectNameValue) {
        setValue("projectDescription", projectNameValue);
      }
    }
    prevProjectNameRef.current = projectNameValue;
  }, [projectNameValue, projectDescriptionValue, setValue]);

  // Similar projects check logic
  const [originalName, setOriginalName] = useState<string | null>(null);
  const [nameChanged, setNameChanged] = useState(false);

  useEffect(() => {
    if (companyProjectId && originalName === null && projectNameValue.trim().length > 0) {
      setOriginalName(projectNameValue);
    }
  }, [companyProjectId, originalName, projectNameValue]);

  useEffect(() => {
    if (companyProjectId && originalName !== null) {
      setNameChanged(projectNameValue !== originalName);
    }
  }, [companyProjectId, originalName, projectNameValue]);

  const shouldSearch = !companyProjectId || nameChanged;
  const { data: projectSearchData } = useGetCompanyProjectSearch(
    shouldSearch ? projectNameValue : "",
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
    if (companyProjectId && !nameChanged) {
      setShowSearchDropdown(false);
      return;
    }
    const hasResults =
      (projectSearchData?.data?.length ?? 0) > 0 &&
      projectNameValue.trim().length >= 5;

    if (hasResults) {
      setShowSearchDropdown(true);
    } else {
      setShowSearchDropdown(false);
    }
  }, [projectNameValue, projectSearchData, companyProjectId, nameChanged]);

  const showSimilarResults =
    shouldSearch &&
    showSearchDropdown &&
    projectNameValue.trim().length >= 5 &&
    (projectSearchData?.data?.length ?? 0) > 0;

  // Watch fields for Project Summary Real-time view
  const statusVal = watch("projectStatusId");
  const businessFuncVal = watch("coreParameterId");
  const subParameterVal = watch("subParameterId") || [];
  const employeeVal = watch("employeeId") || [];
  const deadlineVal = watch("projectDeadline");
  const projectDocsVal = watch("projectDocuments") || [];

  const selectedStatus = StatusOptions.find((s) => s.value === statusVal);
  const selectedBusinessFunc = bussinessFunctOptions.find((b) => b.value === businessFuncVal);

  const selectedEmployees = (employeeVal
    .map((id) => {
      return (
        employeeData?.data?.find((e: Employee) => e.employeeId === id) ||
        projectApiData?.data?.ProjectEmployees?.find((e: { employeeId: string }) => e.employeeId === id)
      );
    })
    .filter(Boolean) as Employee[]);

  const selectedSubParameters = (subParameterVal
    .map((id) => {
      return (
        subParameterData?.data?.find((s: SubParameter) => s.subParameterId === id) ||
        projectApiData?.data?.ProjectParameters?.subParameters?.find((s: { subParameterId: string }) => s.subParameterId === id)
      );
    })
    .filter(Boolean) as SubParameter[]);

  const formattedDeadline = deadlineVal
    ? new Date(deadlineVal).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "";

  const quickDeadlines = [
    { label: "Today", value: "today" },
    { label: "Tomorrow", value: "tomorrow" },
    { label: "This Week", value: "this_week" },
    { label: "Next Week", value: "next_week" },
  ];

  const handleQuickDeadline = (type: string, onChange: (d: Date) => void) => {
    const targetDate = new Date();
    if (type === "today") {
      targetDate.setHours(18, 0, 0, 0);
    } else if (type === "tomorrow") {
      targetDate.setDate(targetDate.getDate() + 1);
      targetDate.setHours(18, 0, 0, 0);
    } else if (type === "this_week") {
      const day = targetDate.getDay();
      const diff = 5 - day; // 5 is Friday
      targetDate.setDate(targetDate.getDate() + (diff >= 0 ? diff : diff + 7));
      targetDate.setHours(18, 0, 0, 0);
    } else if (type === "next_week") {
      const day = targetDate.getDay();
      const diff = 5 - day + 7;
      targetDate.setDate(targetDate.getDate() + diff);
      targetDate.setHours(18, 0, 0, 0);
    }
    onChange(targetDate);
  };

  // Employee Dropdown Options
  const employeeOptions = employeeData?.data
    ? employeeData.data.map((e: Employee) => ({
        label: e.employeeName || "",
        value: e.employeeId || "",
      }))
    : [];

  // Key Result Area (SubParameter) Options
  const subParameterOptions = subParameterData?.data
    ? subParameterData.data.map((s: SubParameter) => ({
        label: s.subParameterName || "",
        value: s.subParameterId || "",
      }))
    : [];

  // File uploading logic
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const currentFiles = watch("projectDocuments") || [];
    const newFiles = [...currentFiles, ...files];
    setValue("projectDocuments", newFiles);

    if (e.target) e.target.value = ""; // Reset input
  };

  const handleRemoveFile = (indexToRemove: number) => {
    const fileToRemove = projectDocsVal[indexToRemove];
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

    const newFiles = projectDocsVal.filter((_, idx) => idx !== indexToRemove);
    setValue("projectDocuments", newFiles);
  };

  if (!permission || permission.Add === false) {
    return <PageNotAccess />;
  }

  return (
    <CompanyAccessGuard
      companyId={companyProjectId ? resourceCompanyId : undefined}
      isLoading={companyProjectId ? !projectApiData : false}
    >
      <FormProvider {...methods}>
        <div className="w-full h-full p-6 flex flex-col overflow-y-auto bg-[#f8f8fb] font-sans">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {companyProjectId ? "Update Project" : "Create New Project"}
              </h1>
            </div>
          </div>

          {/* Form Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left Card: Form Inputs */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6 border border-gray-100 shadow-sm bg-white rounded-xl space-y-5">
                {/* Project Name and Description */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Project Name */}
                  <div className="relative" ref={searchDropdownRef}>
                    <label className="block text-md font-semibold text-gray-900 mb-1.5">
                      Project Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        className={`w-full border rounded-md px-3.5 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                          errors.projectName
                            ? "border-red-500 focus:ring-red-200"
                            : "border-gray-200 focus:border-primary"
                        }`}
                        placeholder="Enter project name..."
                        {...register("projectName", { required: "Project Name is required" })}
                        onFocus={() => {
                          if (
                            shouldSearch &&
                            projectNameValue.trim().length >= 5 &&
                            (projectSearchData?.data?.length ?? 0) > 0
                          ) {
                            setShowSearchDropdown(true);
                          }
                        }}
                      />
                    </div>
                    {errors.projectName && (
                      <span className="text-red-500 text-xs mt-1 block">
                        {String(errors.projectName.message)}
                      </span>
                    )}

                    {showSimilarResults && (
                      <div className="absolute top-[100%] mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto z-[99]">
                        <div className="px-3 py-2 text-[12px] text-gray-500 bg-gray-50 border-b border-gray-200 sticky top-0 font-medium">
                          Similar Projects Found
                        </div>
                        {projectSearchData?.data?.map((item: ProjectSearchResponse) => (
                          <div
                            key={item.projectId}
                            className="px-3 py-2 text-sm text-gray-700 border-b last:border-b-0 cursor-default hover:bg-gray-50 transition-colors"
                          >
                            <span className="font-medium">{item.projectName}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Project Description */}
                  <div>
                    <label className="block text-md font-semibold text-gray-900 mb-1.5">
                      Project Description <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className={`w-full border rounded-md px-3.5 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                        errors.projectDescription
                          ? "border-red-500 focus:ring-red-200"
                          : "border-gray-200 focus:border-primary"
                      }`}
                      placeholder="Enter project description..."
                      {...register("projectDescription", {
                        required: "Please Enter Project Description",
                      })}
                    />
                    {errors.projectDescription && (
                      <span className="text-red-500 text-xs mt-1 block">
                        {String(errors.projectDescription.message)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Deadline and Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Project Deadline */}
                  <div>
                    <label className="block text-md font-semibold text-gray-900 mb-3">
                      Project Deadline <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      control={control}
                      name="projectDeadline"
                      rules={{ required: "Project Deadline is required" }}
                      render={({ field }) => (
                        <div>
                          <div className="[&_input]:text-base [&_input]:py-2.5 [&_input]:px-3.5 [&_input]:border-gray-200 [&_input]:h-auto [&_svg]:hidden">
                            <FormDateTimePicker
                              label=""
                              value={field.value}
                              onChange={field.onChange}
                              error={errors.projectDeadline}
                              disablePastDays={
                                Number(import.meta.env.VITE_DISABLEPASTDATES) || 3
                              }
                              disabled={projectApiData?.data?.deadlineRequest === "PENDING"}
                            />
                          </div>
                          {projectApiData?.data?.deadlineRequest === "PENDING" && (
                            <p className="text-xs text-primary mt-1">
                              Deadline change request is pending approval
                            </p>
                          )}

                          {/* Quick Deadline Chips */}
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {quickDeadlines.map((chip) => (
                              <button
                                key={chip.value}
                                type="button"
                                onClick={() => handleQuickDeadline(chip.value, field.onChange)}
                                className="px-2.5 py-1 text-[11px] bg-gray-100 hover:bg-primary/10 hover:text-primary text-gray-600 rounded-md font-medium transition-all"
                              >
                                {chip.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    />
                  </div>

                  {/* Project Status */}
                  <div>
                    <label className="block text-md font-semibold text-gray-900 mb-1.5">
                      Project Status <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      control={control}
                      name="projectStatusId"
                      rules={{ required: "Please select Project Status" }}
                      render={({ field }) => (
                        <SearchDropdown
                          className="w-full border-gray-200 text-base py-2.5 h-auto font-normal"
                          options={StatusOptions}
                          selectedValues={field.value ? [field.value] : []}
                          onSelect={(value) => {
                            field.onChange(value.value);
                            setValue("projectStatusId", value.value);
                          }}
                          placeholder="Select Project Status..."
                          error={errors.projectStatusId}
                          onSearchChange={setIsStatusSearch}
                          isCrossShow={false}
                        />
                      )}
                    />
                  </div>
                </div>

                {/* Business Function and Key Result Area (KRA) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Business Function */}
                  <div>
                    <label className="block text-md font-semibold text-gray-900 mb-1.5">
                      Business Function
                    </label>
                    <Controller
                      control={control}
                      name="coreParameterId"
                      render={({ field }) => (
                        <SearchDropdown
                          className="w-full border-gray-200 text-base py-2.5 h-auto font-normal"
                          options={bussinessFunctOptions}
                          selectedValues={field.value ? [field.value] : []}
                          onSelect={(value) => {
                            field.onChange(value.value);
                            setValue("coreParameterId", value.value);
                          }}
                          placeholder="Select Business Function..."
                          error={errors.coreParameterId}
                          onSearchChange={setIsBusFuncSearch}
                          isCrossShow={true}
                        />
                      )}
                    />
                  </div>

                  {/* Key Result Area (SubParameter) */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-md font-semibold text-gray-900">
                        Key Result Area (KRA)
                      </label>
                      {watchedCoreParameter && (
                        <button
                          type="button"
                          onClick={() => setIsReqModalOpen(true)}
                          className="text-xs font-semibold text-primary hover:underline focus:outline-none"
                        >
                          + Request Business Function
                        </button>
                      )}
                    </div>
                    <Controller
                      control={control}
                      name="subParameterId"
                      render={({ field }) => (
                        <SearchDropdown
                          className="w-full border-gray-200 text-base py-2.5 h-auto font-normal"
                          placeholder="Select Key Result Areas..."
                          options={subParameterOptions}
                          selectedValues={Array.isArray(field.value) ? field.value : []}
                          multiSelect={true}
                          disabled={!watchedCoreParameter}
                          onSelect={(item) => {
                            const vals = Array.isArray(field.value) ? field.value : [];
                            if (vals.includes(item.value)) {
                              field.onChange(vals.filter((v) => v !== item.value));
                            } else {
                              field.onChange([...vals, item.value]);
                            }
                          }}
                          onSearchChange={(val) =>
                            setPaginationFilterSubPara((prev) => ({
                              ...prev,
                              search: val,
                              currentPage: 1,
                            }))
                          }
                          error={errors.subParameterId}
                          isCrossShow={false}
                        />
                      )}
                    />

                    {/* Selected KRAs pills */}
                    {selectedSubParameters.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {selectedSubParameters.map((kra) => (
                          <div
                            key={kra.subParameterId}
                            className="flex items-center space-x-1 bg-gray-50 border border-gray-150 px-2.5 py-1 rounded-full text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <span>{kra.subParameterName}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const vals = Array.isArray(subParameterVal) ? subParameterVal : [];
                                setValue(
                                  "subParameterId",
                                  vals.filter((v) => v !== kra.subParameterId),
                                  { shouldValidate: true }
                                );
                              }}
                              className="text-gray-400 hover:text-red-500 rounded-full focus:outline-none"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Assign To (Employees) and Parent Project */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Assign To */}
                  <div>
                    <label className="block text-md font-semibold text-gray-900 mb-1.5">
                      Assign To <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      control={control}
                      name="employeeId"
                      rules={{ required: "Please assign this project to at least one user" }}
                      render={({ field }) => (
                        <SearchDropdown
                          className="w-full border-gray-200 text-base py-2.5 h-auto font-normal"
                          placeholder="Search employee..."
                          options={employeeOptions}
                          selectedValues={Array.isArray(field.value) ? field.value : []}
                          multiSelect={true}
                          onSelect={(item) => {
                            const vals = Array.isArray(field.value) ? field.value : [];
                            if (vals.includes(item.value)) {
                              field.onChange(vals.filter((v) => v !== item.value));
                            } else {
                              field.onChange([...vals, item.value]);
                            }
                          }}
                          onSearchChange={(val) =>
                            setPaginationFilterEmployee((prev) => ({
                              ...prev,
                              search: val,
                              currentPage: 1,
                            }))
                          }
                          error={errors.employeeId}
                          isCrossShow={false}
                        />
                      )}
                    />

                    {/* Selected Employees Pills */}
                    {selectedEmployees.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2.5 items-center">
                        {selectedEmployees.slice(0, 4).map((emp) => (
                          <div
                            key={emp.employeeId}
                            className="flex items-center space-x-1.5 bg-gray-50 border border-gray-150 hover:bg-gray-100 px-2.5 py-1 rounded-full text-xs font-medium text-gray-700 transition-colors"
                          >
                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] text-primary font-bold">
                              {getInitials(emp.employeeName)}
                            </div>
                            <span>{emp.employeeName}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const vals = Array.isArray(employeeVal) ? employeeVal : [];
                                setValue(
                                  "employeeId",
                                  vals.filter((v) => v !== emp.employeeId),
                                  { shouldValidate: true }
                                );
                              }}
                              className="text-gray-400 hover:text-red-500 rounded-full focus:outline-none"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                        {selectedEmployees.length > 4 && (
                          <div className="px-2.5 py-1 rounded-full text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 transition-colors border border-primary/20">
                            +{selectedEmployees.length - 4} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Parent Project */}
                  <div>
                    <label className="block text-md font-semibold text-gray-900 mb-1.5">
                      Parent Project
                    </label>
                    <Controller
                      control={control}
                      name="parentProjectId"
                      render={({ field }) => (
                        <SearchDropdown
                          className="w-full border-gray-200 text-base py-2.5 h-auto font-normal"
                          options={parentProjectOptions}
                          selectedValues={field.value ? [field.value] : []}
                          onSelect={(value) => {
                            field.onChange(value.value);
                            setValue("parentProjectId", value.value);
                          }}
                          placeholder="Select Parent Project..."
                          error={errors.parentProjectId}
                          onSearchChange={setParentProjectSearch}
                          isCrossShow={true}
                        />
                      )}
                    />
                  </div>
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

                  {projectDocsVal.length > 0 && (
                    <div className="mt-2 flex flex-col gap-2">
                      <p className="text-xs text-gray-500 font-medium">
                        {projectDocsVal.length} file(s) selected
                      </p>
                      {projectDocsVal.map((file: File | { fileId: string; fileName: string }, idx: number) => {
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
                                      `${ImageBaseURL}/share/pDocs/${(file as { fileName: string }).fileName}`,
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
                  {projectDocsVal.length === 0 && (
                    <p className="text-sm text-gray-400 italic">No files selected</p>
                  )}
                </div>
              </Card>

              {/* Action Buttons (Bottom) */}
              <div className="flex items-center space-x-3 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard/projects")}
                  className="px-6 border-gray-300 text-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit(onSubmit)}
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
                      <span>{companyProjectId ? "Update Project" : "Create Project"}</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Right Card: Project Summary Sidebar */}
            <div className="space-y-6">
              <Card className="p-5 border border-gray-150 shadow-sm bg-white rounded-xl space-y-4">
                <h3 className="text-base font-bold text-gray-800 border-b border-gray-100 pb-3">
                  Project Summary
                </h3>

                <div className="space-y-4">
                  {/* Project Name Summary Block */}
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-gray-50 text-gray-500 rounded-lg">
                      <Folder className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-gray-400 font-semibold tracking-wider uppercase">
                        Project Name
                      </p>
                      <p className="text-sm font-semibold text-gray-700 mt-0.5 break-words">
                        {projectNameValue || "Project Title..."}
                      </p>
                    </div>
                  </div>

                  {/* Status Summary Block */}
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
                        {selectedStatus ? selectedStatus.label : "Draft / Active"}
                      </p>
                    </div>
                  </div>

                  {/* Business Function Summary Block */}
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-gray-50 text-gray-500 rounded-lg">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 font-semibold tracking-wider uppercase">
                        Business Function
                      </p>
                      <p className="text-sm font-semibold text-gray-700 mt-0.5">
                        {selectedBusinessFunc ? selectedBusinessFunc.label : "Not Selected"}
                      </p>
                    </div>
                  </div>

                  {/* Key Result Areas Summary Block */}
                  {selectedSubParameters.length > 0 && (
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-gray-50 text-gray-500 rounded-lg">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-gray-400 font-semibold tracking-wider uppercase">
                          Key Result Areas
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {selectedSubParameters.map((kra) => (
                            <span
                              key={kra.subParameterId}
                              className="text-[10px] bg-primary/5 text-primary border border-primary/10 px-2 py-0.5 rounded font-medium"
                            >
                              {kra.subParameterName}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Assignees Summary Block */}
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-gray-50 text-gray-500 rounded-lg">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 font-semibold tracking-wider uppercase">
                        Assign To
                      </p>
                      <div className="flex -space-x-1.5 overflow-hidden mt-1.5">
                        {selectedEmployees.map((emp) => (
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
                        {selectedEmployees.length === 0 && (
                          <span className="text-sm text-gray-400 font-medium">Unassigned</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Deadline Summary Block */}
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-gray-50 text-gray-500 rounded-lg">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 font-semibold tracking-wider uppercase">
                        Deadline
                      </p>
                      <p className="text-sm font-semibold text-gray-700 mt-0.5">
                        {formattedDeadline || "Set a deadline..."}
                      </p>
                    </div>
                  </div>

                  {/* Documents Summary Block */}
                  {projectDocsVal.length > 0 && (
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-gray-50 text-gray-500 rounded-lg">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-400 font-semibold tracking-wider uppercase">
                          Documents
                        </p>
                        <p className="text-sm font-semibold text-gray-700 mt-0.5">
                          {projectDocsVal.length} document(s) uploaded
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Request business function modal */}
        <RequestModal
          type="SubParameter"
          isModalOpen={isReqModalOpen}
          modalClose={() => setIsReqModalOpen(false)}
          modalTitle="Request Business Function"
        />

        {/* Forced deadline change confirmation dialog */}
        <Dialog open={isConfModalOpen} onOpenChange={setIsConfModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirmation Required</DialogTitle>
              <DialogDescription>
                The deadline has been changed. Please provide a reason to proceed with the update.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="reason" className="text-sm font-medium">
                  Reason
                </label>
                <Textarea
                  id="reason"
                  placeholder="Enter reasons for deadline change..."
                  value={reasons}
                  onChange={(e) => setReasons(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsConfModalOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button onClick={onConfirmSubmit} disabled={isPending || !reasons.trim()}>
                {isPending ? "Confirming..." : "Confirm"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </FormProvider>
    </CompanyAccessGuard>
  );
}
