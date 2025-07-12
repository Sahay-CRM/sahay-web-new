import { Button } from "@/components/ui/button";
import AddMeetingModal from "./addMeetingModal"; // Renamed import
import useAddMeeting from "./useAddMeeting"; // Renamed import
import { FormProvider, useFormContext, Controller } from "react-hook-form"; // Added useFormContext, Controller
import useStepForm from "@/components/shared/StepProgress/useStepForm";
import StepProgress from "@/components/shared/StepProgress/stepProgress";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { useEffect, useState, useRef, ChangeEvent } from "react"; // Added useState, useRef, ChangeEvent

// Imports for components used within step components
import { Card } from "@/components/ui/card";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import TableData from "@/components/shared/DataTable/DataTable";
import DropdownSearchMenu from "@/components/shared/DropdownSearchMenu/DropdownSearchMenu";
import SearchInput from "@/components/shared/SearchInput";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { getEmployee } from "@/features/api/companyEmployee";
import { useGetCompanyMeetingStatus } from "@/features/api/companyMeeting";
import { getMeetingType } from "@/features/api/meetingType";
import { mapPaginationDetails } from "@/lib/mapPaginationDetails";

// --- MeetingInfo Component Definition ---
const MeetingInfo = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();
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
        <FormInputField
          id="meetingDateTime"
          type="date"
          label="Meeting Date & Time"
          {...register("meetingDateTime", {
            required: "Date & Time is required",
          })}
          error={errors.meetingDateTime}
          isMandatory
        />
      </Card>
    </div>
  );
};

// --- MeetingStatus Component Definition ---
const MeetingStatus = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 25,
    search: "",
  });

  const { data: meeetingStatusData } = useGetCompanyMeetingStatus({
    filter: paginationFilter,
  });

  const [columnToggleOptions] = useState([
    { key: "srNo", label: "Sr No", visible: true },
    { key: "meetingStatus", label: "Meeting Status", visible: true },
  ]);

  const visibleColumns = columnToggleOptions.reduce(
    (acc, col) => {
      if (col.visible) acc[col.key] = col.label;
      return acc;
    },
    {} as Record<string, string>,
  );

  return (
    <div>
      <div className="mb-2">
        <SearchInput
          placeholder="Search Status..."
          searchValue={paginationFilter?.search || ""}
          setPaginationFilter={setPaginationFilter}
          className="w-80"
        />
      </div>
      {errors.meetingStatusId && (
        <p className="text-red-500 text-sm mb-2">
          {typeof errors.meetingStatusId?.message === "string"
            ? errors.meetingStatusId.message
            : ""}
        </p>
      )}
      <Controller
        name="meetingStatusId"
        control={control}
        rules={{ required: "Please select a meeting status" }}
        render={({ field }) => (
          <TableData
            tableData={
              meeetingStatusData?.data?.map((item, index) => ({
                ...item,
                srNo:
                  (meeetingStatusData.currentPage - 1) *
                    meeetingStatusData.pageSize +
                  index +
                  1,
              })) || []
            }
            columns={visibleColumns}
            primaryKey="meetingStatusId"
            multiSelect={false}
            onCheckbox={() => true}
            selectedValue={field.value}
            handleChange={field.onChange}
            paginationDetails={mapPaginationDetails(meeetingStatusData)}
            setPaginationFilter={setPaginationFilter}
            isActionButton={() => false}
          />
        )}
      />
    </div>
  );
};

// --- MeetingType Component Definition ---
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

  const { data: meetingTypeData } = getMeetingType({
    filter: paginationFilter,
  });
  const [columnToggleOptions] = useState([
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

  return (
    <div>
      <div className="mb-2">
        <SearchInput
          placeholder="Search Type..."
          searchValue={paginationFilter?.search || ""}
          setPaginationFilter={setPaginationFilter}
          className="w-80"
        />
      </div>
      {errors.meetingTypeId && (
        <p className="text-red-500 text-sm mb-2">
          {typeof errors.meetingTypeId?.message === "string"
            ? errors.meetingTypeId.message
            : ""}
        </p>
      )}
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
          />
        )}
      />
    </div>
  );
};

// --- Joiners Component Definition ---
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

  const { data: employeedata } = getEmployee({
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
      <div className="mt-1 mb-2 flex items-center justify-between">
        <div>
          <SearchInput
            placeholder="Search Joiners..."
            searchValue={paginationFilter?.search || ""}
            setPaginationFilter={setPaginationFilter}
            className="w-80"
          />
        </div>
        {canToggleColumns && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="ml-4">
                  <DropdownSearchMenu
                    columns={columnToggleOptions}
                    onToggleColumn={onToggleColumn}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs text-white">Toggle Visible Columns</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      {errors.employeeId && (
        <p className="text-red-500 text-sm mb-2">
          {typeof errors.employeeId?.message === "string"
            ? errors.employeeId.message
            : ""}
        </p>
      )}
      <Controller
        name="employeeId" // This should be an array of selected employee objects
        control={control}
        // rules={{ required: "Please select at least one joiner" }} // Optional: add validation
        render={({ field }) => (
          <TableData
            tableData={employeedata?.data.map((item, index) => ({
              ...item,
              srNo:
                (employeedata.currentPage - 1) * employeedata.pageSize +
                index +
                1,
            }))}
            columns={visibleColumns}
            primaryKey="employeeId" // Key used to identify unique rows
            paginationDetails={mapPaginationDetails(employeedata)}
            setPaginationFilter={setPaginationFilter}
            multiSelect={true}
            selectedValue={field.value || []} // Ensure field.value is an array
            handleChange={(selectedItems) => field.onChange(selectedItems)} // Pass array of selected items
            isActionButton={() => false}
            onCheckbox={() => true}
          />
        )}
      />
    </div>
  );
};

// --- UploadDoc Component Definition ---
const UploadDoc = () => {
  const { watch, setValue } = useFormContext();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Local state for UI representation of files, synced with form state
  const [displayFiles, setDisplayFiles] = useState<
    (File | string | { fileId: string; fileName: string })[]
  >([]);

  // Watch form state for initial files and updates
  const formFiles = watch("meetingDocuments");

  useEffect(() => {
    // Sync local displayFiles with formFiles when formFiles changes (e.g., on reset)
    if (formFiles) {
      setDisplayFiles(formFiles);
    }
  }, [formFiles]);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const currentFormFiles = watch("meetingDocuments") || [];
    const newFormFiles = [...currentFormFiles, ...files];
    setValue("meetingDocuments", newFormFiles);
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
    // Update the meetingDocuments in the form state by filtering out the removed file
    // This is important if the removed file was a new `File` object not yet having a `fileId`
    // More directly, after updating displayFiles:
    setValue("meetingDocuments", newDisplayFiles);
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
                {typeof file === "string"
                  ? file.substring(0, 30) + (file.length > 30 ? "..." : "")
                  : "fileName" in file && !(file instanceof File) // Check it's not a File object
                    ? file.fileName
                    : (file as File).name}
              </span>
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
          ))}
        </div>
      )}
      {displayFiles.length === 0 && (
        <p className="text-sm text-gray-500 italic">No files selected</p>
      )}
    </div>
  );
};

// Renamed main component
const AddMeeting = () => {
  const {
    onFinish,
    isModalOpen,
    handleClose,
    onSubmit,
    trigger,
    meetingPreview,
    methods, // This is the methods object from useForm in useAddMeeting
    companyMeetingId,
    isPending,
    meetingApiData,
  } = useAddMeeting();

  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([
      { label: "Company Meeting", href: "/dashboard/meeting" },
      { label: companyMeetingId ? "Update Meeting" : "Add Meeting", href: "" },
      ...(companyMeetingId
        ? [
            {
              label: `${
                meetingApiData?.data?.meetingName
                  ? meetingApiData?.data?.meetingName
                  : ""
              }`,
              href: `/dashboard/kpi/${companyMeetingId}`,
            },
          ]
        : []),
    ]);
  }, [companyMeetingId, meetingApiData?.data?.meetingName, setBreadcrumbs]);

  const steps = [
    <MeetingInfo key="meetingInfo" />,
    <MeetingStatus key="meetingStatus" />,
    <MeetingType key="meetingType" />,
    <Joiners key="joiners" />,
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
    "Meeting Info",
    "Meeting Status",
    "Meeting Type",
    "Joiners",
    "Upload Document",
  ];

  return (
    <FormProvider {...methods}>
      <div>
        <StepProgress
          currentStep={currentStep}
          stepNames={stepNames}
          totalSteps={totalSteps}
          header={companyMeetingId ? meetingApiData?.data?.meetingName : null}
        />

        <div className="flex justify-end gap-5 mb-5 ">
          <Button
            onClick={back}
            disabled={isFirstStep || isPending}
            className="w-fit"
            type="button"
          >
            Previous
          </Button>
          <Button
            onClick={isLastStep ? onFinish : next}
            className="w-fit"
            disabled={isPending}
            isLoading={isPending}
            type="button"
          >
            {isLastStep ? "Finish" : "Next"}
          </Button>
          {companyMeetingId && !isLastStep && (
            <Button onClick={onFinish} className="w-fit">
              Submit
            </Button>
          )}
        </div>

        <div className="step-content w-full">{stepContent}</div>

        {isModalOpen && (
          <AddMeetingModal
            modalData={meetingPreview as MeetingData} // Ensure correct type for modalData
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

export default AddMeeting;
