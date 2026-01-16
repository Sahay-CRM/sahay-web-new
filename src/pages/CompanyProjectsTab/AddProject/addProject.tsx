import { FormProvider, useFormContext, Controller } from "react-hook-form"; // Added useFormContext, Controller
import useStepForm from "@/components/shared/StepProgress/useStepForm";
import StepProgress from "@/components/shared/StepProgress/stepProgress";
import useAddProject from "./useAddProject";
import AddProjectModal from "./addProjectModal";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { ChangeEvent, useEffect, useRef, useState } from "react";

import { Card } from "@/components/ui/card";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import TableData from "@/components/shared/DataTable/DataTable";
import DropdownSearchMenu from "@/components/shared/DropdownSearchMenu/DropdownSearchMenu";
import SearchInput from "@/components/shared/SearchInput";

import { getEmployee } from "@/features/api/companyEmployee";
import {
  // useGetCorparameter,
  // useGetProjectStatus,
  useGetSubParaFilter,
} from "@/features/api/companyProject";
import FormDateTimePicker from "@/components/shared/FormDateTimePicker/formDateTimePicker";
import PageNotAccess from "@/pages/PageNoAccess";
import SearchDropdown from "@/components/shared/Form/SearchDropdown";
import { Button } from "@/components/ui/button";
import RequestModal from "@/components/shared/Modal/RequestModal";
import { ImageBaseURL } from "@/features/utils/urls.utils";

interface SubParameterProps {
  setIsReqModalOpen: (value: boolean) => void;
}

const ProjectInfo = () => {
  const {
    register,
    setValue,
    control,
    formState: { errors },
  } = useFormContext();
  const {
    StatusOptions,
    bussinessFunctOptions,
    setIsStatusSearch,
    setIsBusFuncSearch,
  } = useAddProject();

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="col-span-2 px-4 py-4 grid grid-cols-2 mt-4 gap-4">
        <FormInputField
          label="Project Name"
          {...register("projectName", { required: "Name is required" })}
          error={errors.projectName}
          placeholder="Enter Project Name"
        />
        <FormInputField
          label="Project Description"
          {...register("projectDescription", {
            required: "Description is required",
          })}
          placeholder="Project Description"
          error={errors.projectDescription}
        />
        <Controller
          control={control}
          name="projectDeadline"
          render={({ field }) => {
            // Convert to local time for display
            const localDate = field.value
              ? new Date(
                  new Date(field.value).getTime() +
                    new Date().getTimezoneOffset() * 60000,
                )
              : null;

            return (
              <FormDateTimePicker
                label="Project Deadline"
                value={localDate}
                onChange={(date) => {
                  // Convert back to UTC when saving
                  const utcDate = date
                    ? new Date(
                        date.getTime() - date.getTimezoneOffset() * 60000,
                      )
                    : null;
                  field.onChange(utcDate);
                }}
                error={errors.projectDeadline}
              />
            );
          }}
        />
        <Controller
          name="projectStatusId"
          control={control}
          rules={{
            required: {
              value: true,
              message: "Please select a project status",
            },
          }}
          render={({ field }) => (
            <SearchDropdown
              placeholder="Select Project Status..."
              label="Project Status"
              error={errors.projectStatusId}
              isMandatory
              {...field}
              labelClass="mb-5"
              className="h-10"
              options={StatusOptions}
              selectedValues={field.value ? [field.value] : []} // Ensure it's an array
              onSelect={(value) => {
                field.onChange(value.value);
                setValue("projectStatusId", value.value);
              }}
              onSearchChange={setIsStatusSearch}
            />
          )}
        />
        <Controller
          name="coreParameterId"
          control={control}
          render={({ field }) => (
            <SearchDropdown
              placeholder="Select a Business Function..."
              label="Business Function"
              error={errors.coreParameterId}
              // isMandatory
              options={bussinessFunctOptions}
              selectedValues={field.value ? [field.value] : []}
              onSelect={(value) => {
                field.onChange(value.value);
                setValue("coreParameterId", value.value);
              }}
              onSearchChange={setIsBusFuncSearch}
            />
          )}
        />
      </Card>
    </div>
  );
};

const SubParameter = ({ setIsReqModalOpen }: SubParameterProps) => {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext();
  const { isInitialLoad, hasInitializedData } = useAddProject();

  const coreParameterIdValue = watch("coreParameterId");

  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 25,
    search: "",
  });

  useEffect(() => {
    if (coreParameterIdValue) {
      setPaginationFilter((prev) => ({ ...prev, currentPage: 1, search: "" }));
    }
  }, [coreParameterIdValue]);

  const { data: subParameterData, isLoading } = useGetSubParaFilter({
    filter: {
      ...paginationFilter,
      coreParameterId: coreParameterIdValue,
    },
    enable: !!coreParameterIdValue && (!isInitialLoad || hasInitializedData),
  });

  const [columnToggleOptions, setColumnToggleOptions] = useState([
    { key: "srNo", label: "Sr No", visible: true },
    { key: "subParameterName", label: "Key Result Area", visible: true },
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

  if (!coreParameterIdValue) {
    return (
      <div className="text-center py-8 text-gray-500">
        Please select a Business Function first.
      </div>
    );
  }

  return (
    <div>
      <div className="mt-1 mb-4 flex items-center justify-between">
        {/* Left side: Search + Error */}
        <div className="flex items-center space-x-2">
          <SearchInput
            placeholder="Search..."
            searchValue={paginationFilter?.search || ""}
            setPaginationFilter={setPaginationFilter}
            className="w-80"
          />
          {errors?.subParameterId && (
            <div className="mb-1">
              <span className="text-red-600 text-sm">
                {String(errors?.subParameterId?.message || "")}
              </span>
            </div>
          )}
        </div>

        <div>
          {canToggleColumns && (
            <div className="ml-3">
              <DropdownSearchMenu
                columns={columnToggleOptions}
                onToggleColumn={onToggleColumn}
                columnIcon={true}
              />
            </div>
          )}
          <Button
            className="py-2 w-fit cursor-pointer"
            onClick={() => {
              setIsReqModalOpen(true);
            }}
          >
            Request Business Function
          </Button>
        </div>
      </div>
      <Controller
        name="subParameterId"
        control={control}
        render={({ field }) => (
          <TableData
            tableData={subParameterData?.data.map((item, index) => ({
              ...item,
              srNo:
                (subParameterData.currentPage - 1) * subParameterData.pageSize +
                index +
                1,
            }))}
            isActionButton={() => false}
            columns={visibleColumns}
            primaryKey="subParameterId"
            paginationDetails={subParameterData as PaginationFilter}
            setPaginationFilter={setPaginationFilter}
            multiSelect={true}
            selectedValue={field.value || []}
            handleChange={(selectedItems) => {
              const ids = selectedItems.map((item: SubParameter | string) =>
                typeof item === "object" && item !== null
                  ? item.subParameterId
                  : item,
              );
              field.onChange(ids);
            }}
            onCheckbox={() => true}
            isLoading={isLoading}
            showActionsColumn={false}
          />
        )}
      />
    </div>
  );
};

const Employees = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 25,
    search: "",
  });
  const { data: employeeData, isLoading } = getEmployee({
    filter: { ...paginationFilter, isDeactivated: false },
  });
  const [columnToggleOptions, setColumnToggleOptions] = useState([
    { key: "srNo", label: "Sr No", visible: true },
    { key: "employeeName", label: "Employee Name", visible: true },
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
    <div>
      <div className="mt-1 mb-4 flex items-center justify-between">
        {/* Left side: Search + Error */}
        <div className="flex items-center space-x-2">
          <SearchInput
            placeholder="Search..."
            searchValue={paginationFilter?.search || ""}
            setPaginationFilter={setPaginationFilter}
            className="w-80"
          />
          {errors?.employeeId && (
            <div className="mb-1">
              <span className="text-red-600 text-sm">
                {String(errors?.employeeId?.message || "")}
              </span>
            </div>
          )}
        </div>

        {canToggleColumns && (
          <div className="ml-3">
            <DropdownSearchMenu
              columns={columnToggleOptions}
              onToggleColumn={onToggleColumn}
              columnIcon={true}
            />
          </div>
        )}
      </div>
      <Controller
        name="employeeId"
        control={control}
        rules={{ required: "Please select at least one employee" }}
        render={({ field }) => (
          <TableData
            tableData={employeeData?.data.map((item, index) => ({
              ...item,
              srNo:
                (employeeData.currentPage - 1) * employeeData.pageSize +
                index +
                1,
            }))}
            isActionButton={() => false}
            columns={visibleColumns}
            primaryKey="employeeId"
            paginationDetails={employeeData as PaginationFilter}
            setPaginationFilter={setPaginationFilter}
            multiSelect={true}
            selectedValue={field.value || []}
            handleChange={(selectedItems) => {
              const ids = selectedItems.map((item: Employee | string) =>
                typeof item === "object" && item !== null
                  ? item.employeeId
                  : item,
              );
              field.onChange(ids);
            }}
            onCheckbox={() => true}
            isLoading={isLoading}
            showActionsColumn={false}
          />
        )}
      />
    </div>
  );
};
const UploadDoc = () => {
  const { watch, setValue } = useFormContext();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Local state for UI representation of files, synced with form state
  const [displayFiles, setDisplayFiles] = useState<FileType[]>([]);

  // Watch form state for initial files and updates
  const formFiles = watch("projectDocuments");

  useEffect(() => {
    // Sync local displayFiles with formFiles when formFiles changes (e.g., on reset)
    if (formFiles) {
      setDisplayFiles(formFiles);
    }
  }, [formFiles]);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const currentFormFiles = watch("projectDocuments") || [];
    const newFormFiles = [...currentFormFiles, ...files];
    setValue("projectDocuments", newFormFiles);
    setDisplayFiles(newFormFiles); // Update local display

    if (e.target) e.target.value = ""; // Reset file input
  };

  const handleRemoveFile = (indexToRemove: number) => {
    const fileToRemove = displayFiles[indexToRemove];

    const currentRemovedIds = watch("removedFileIdsArray") || [];
    const updatedRemovedIds = [...currentRemovedIds];

    if (
      typeof fileToRemove === "object" &&
      "fileId" in fileToRemove &&
      !(fileToRemove instanceof File)
    ) {
      // This is an existing file, add its ID to removedFileIdsArray if not already there
      if (!updatedRemovedIds.includes(fileToRemove.fileId)) {
        updatedRemovedIds.push(fileToRemove.fileId);
      }
    }
    setValue("removedFileIdsArray", updatedRemovedIds);

    const newDisplayFiles = displayFiles.filter(
      (_, idx) => idx !== indexToRemove,
    );
    setDisplayFiles(newDisplayFiles);
    setValue("projectDocuments", newDisplayFiles);
  };

  return (
    <div className="flex flex-col gap-4">
      <label className="font-semibold mb-2">
        Upload Documents (Image, Doc, Video, etc.)
      </label>
      <button
        type="button"
        className="w-fit px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          fileInputRef.current?.click();
        }}
      >
        Choose Files
      </button>
      <input
        type="file"
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.mp4,.avi,.mov,.mkv"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        multiple
        style={{ display: "none" }}
      />
      {displayFiles.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          <p className="text-sm text-gray-600 mb-2">
            {displayFiles.length} file(s) selected
          </p>
          {displayFiles.map((file, idx) => (
            <div
              key={idx} // Using index as key is okay if list order doesn't change unpredictably or items don't have stable IDs
              className="flex items-center justify-between p-2 bg-gray-50 rounded"
            >
              <span className="font-medium truncate">
                {("fileName" in file && file.fileName) ||
                  ("name" in file && file.name)}
              </span>
              <div>
                <button
                  type="button"
                  className="ml-2 px-2 py-1 bg-primary text-white rounded text-xs hover:bg-red-600 transition"
                  onClick={() => {
                    // Check if the file is a new File object (locally selected)
                    if (file instanceof File) {
                      // Create a temporary URL and trigger download
                      const fileUrl = URL.createObjectURL(file);
                      const link = document.createElement("a");
                      link.href = fileUrl;
                      link.download = file.name; // Use the original file name
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(fileUrl); // Clean up the temporary URL
                    } else {
                      window.open(
                        `${ImageBaseURL}/share/pDocs/${file.fileName}`,
                        "_blank",
                      );
                    }
                  }}
                >
                  Download
                </button>
                <button
                  type="button"
                  className="ml-2 px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemoveFile(idx);
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {displayFiles.length === 0 && (
        <p className="text-sm text-gray-500 italic">No files selected</p>
      )}
    </div>
  );
};
export default function AddProject() {
  const {
    onFinish,
    isModalOpen,
    handleClose,
    onSubmit,
    trigger,
    projectPreview,
    companyProjectId,
    isPending,
    methods,
    projectApiData,
    permission,
    isCoreParameterSelected,
    // isReqModalOpen,
    // setIsReqModalOpen,
  } = useAddProject();

  const [isReqModalOpen, setIsReqModalOpen] = useState(false);

  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([
      { label: "Company Projects", href: "/dashboard/projects" },
      {
        label: companyProjectId
          ? "Update Company Project"
          : "Add Company Project",
        href: "",
      },
      ...(companyProjectId
        ? [
            {
              label: `${
                projectApiData?.data.projectName
                  ? projectApiData.data.projectName
                  : ""
              }`,
              href: `/dashboard/kpi/${companyProjectId}`,
              isHighlight: true,
            },
          ]
        : []),
    ]);
  }, [setBreadcrumbs, companyProjectId, projectApiData?.data.projectName]);

  const steps = [
    <ProjectInfo key="projectInfo" />,
    ...(isCoreParameterSelected
      ? [
          <SubParameter
            key="subParameter"
            setIsReqModalOpen={setIsReqModalOpen}
          />,
        ]
      : []),
    <Employees key="employees" />,
    <UploadDoc key="uploadDoc" />,
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

  const stepNames = [
    "Project Info",
    // "Project Status",
    // "Business Function",
    ...(isCoreParameterSelected ? ["Key Result Area"] : []),
    "Assignees",
    "Upload Document",
  ];

  if (permission && permission.Add === false) {
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
          isUpdate={!!companyProjectId}
        />

        <div className="step-content w-full">{stepContent}</div>

        {isModalOpen && (
          <AddProjectModal
            modalData={{
              ...projectPreview,
              projectStatusId:
                projectPreview?.projectStatusId ??
                methods.getValues("projectStatusId"),
            }}
            isModalOpen={isModalOpen}
            modalClose={handleClose}
            onSubmit={onSubmit}
            isLoading={isPending}
          />
        )}
      </div>
      {/* {isReqModalOpen && ( */}
      <RequestModal
        type="SubParameter"
        isModalOpen={isReqModalOpen}
        modalClose={() => setIsReqModalOpen(false)}
        modalTitle="Request Business Function"
      />
      {/* )} */}
    </FormProvider>
  );
}
