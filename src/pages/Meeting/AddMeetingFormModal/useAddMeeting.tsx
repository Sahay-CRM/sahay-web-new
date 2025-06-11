import { useCallback, useEffect, useRef, useState, ChangeEvent } from "react";
import { Controller, useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";
import TableData from "@/components/shared/DataTable/DataTable";
import DropdownSearchMenu from "@/components/shared/DropdownSearchMenu/DropdownSearchMenu";
import { getEmployee } from "@/features/api/companyEmployee";
import {
  useAddUpdateCompanyMeeting,
  useGetCompanyMeetingById,
  useGetCompanyMeetingStatus,
} from "@/features/api/companyMeeting";
import { getMeetingType } from "@/features/api/meetingType";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { format, parseISO } from "date-fns";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import { docUploadMutation } from "@/features/api/file";
import { queryClient } from "@/queryClient";
import { mapPaginationDetails } from "@/lib/mapPaginationDetails";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function useAddEmployee() {
  const { id: companyMeetingId } = useParams();
  const [isModalOpen, setModalOpen] = useState(false);
  const [removedFileIds, setRemovedFileIds] = useState<string[]>([]);

  const { mutate: addMeeting } = useAddUpdateCompanyMeeting();
  const navigate = useNavigate();
  const { data: meetingApiData } = useGetCompanyMeetingById(
    companyMeetingId || "",
  );

  const { mutate: imageUpload } = docUploadMutation();

  const methods = useForm({
    mode: "onChange",
  });

  const {
    register,
    formState: { errors },
    control,
    handleSubmit,
    trigger,
    reset,
    getValues,
    setValue,
  } = methods;

  useEffect(() => {
    if (meetingApiData?.data) {
      const data = meetingApiData.data;
      reset({
        meetingId: companyMeetingId || "",
        meetingName: data.meetingName || "",
        meetingDescription: data.meetingDescription || "",
        meetingDateTime: data.meetingDateTime
          ? format(parseISO(data.meetingDateTime), "yyyy-MM-dd")
          : "",
        meetingStatusId: data.meetingStatus || undefined,
        meetingTypeId: data.meetingType || undefined,
        employeeId:
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data.joiners?.map((ele: any) => ({
            employeeId: ele.employeeId,
          })),
      });

      // Define a type for meeting files
      type MeetingFile = { fileId: string; fileName: string };

      // Set uploadedFiles to existing files if present
      if (Array.isArray(data.files)) {
        setUploadedFiles(
          data.files.map((f: MeetingFile) => ({
            fileId: f.fileId,
            fileName: f.fileName,
          })),
        );
        setValue(
          "meetingDocuments",
          data.files.map((f: MeetingFile) => ({
            fileId: f.fileId,
            fileName: f.fileName,
          })),
        );
      }
    }
  }, [meetingApiData, reset, setValue]);

  const handleClose = () => setModalOpen(false);

  const onFinish = useCallback(async () => {
    const isValid = await trigger();
    if (isValid) {
      setModalOpen(true);
    }
  }, [trigger]);

  const [searchParams] = useSearchParams();

  const onSubmit = handleSubmit(async (data) => {
    const payload = {
      meetingName: data?.meetingName,
      meetingDescription: data?.meetingDescription,
      meetingDateTime: data?.meetingDateTime,
      meetingTypeId: data?.meetingTypeId?.meetingTypeId,
      meetingStatusId: data?.meetingStatusId?.meetingStatusId,
      joiners: data?.employeeId?.map((ele: EmployeeData) => ele?.employeeId),
      companyMeetingId: companyMeetingId || "",
    };

    addMeeting(payload, {
      onSuccess: (response) => {
        const meetingId = Array.isArray(response?.data)
          ? response?.data[0]?.companyMeetingId || companyMeetingId
          : (response?.data as { companyMeetingId?: string })
              ?.companyMeetingId || companyMeetingId;

        // Handle file uploads and removals after meeting update success
        if (typeof meetingId === "string" && meetingId) {
          handleFileOperations(meetingId);
        }

        handleModalClose();
        if (searchParams.get("from") === "task") {
          navigate("/dashboard/tasks/add");
          window.location.reload();
        } else {
          navigate("/dashboard/meeting");
        }
      },
    });
  });

  // Function to handle file uploads and removals
  const handleFileOperations = async (meetingId: string) => {
    // Helper to upload a single file (File or base64 string)
    const uploadMeetingFile = (
      file: File | string,
      fileType: string = "2040",
    ) => {
      const formData = new FormData();
      formData.append("refId", meetingId);
      formData.append("imageType", "MEETING");
      formData.append("isMaster", "0");
      formData.append("fileType", fileType);
      // Only append if file is File or string (base64)
      if (file instanceof File || typeof file === "string") {
        formData.append("files", file);
        imageUpload(formData, {
          onSuccess: () => {
            queryClient.resetQueries({ queryKey: ["get-meeting-list"] });
            queryClient.resetQueries({ queryKey: ["get-meeting-dropdown"] });
            queryClient.resetQueries({ queryKey: ["get-meeting-list-by-id"] });
          },
        });
      }
    };

    // Upload new files (File or base64 string)
    const newFiles = uploadedFiles.filter(
      (file: File | string | { fileId: string; fileName: string }) =>
        file instanceof File ||
        (typeof file === "string" && file.startsWith("data:")),
    ) as (File | string)[];
    newFiles.forEach((file) => {
      // Only pass File or string, skip objects with fileId/fileName
      if (file instanceof File || typeof file === "string") {
        uploadMeetingFile(file);
      }
    });

    // Handle removed file IDs (send in a separate request, no file field)
    if (removedFileIds.length > 0) {
      const formData = new FormData();
      formData.append("refId", meetingId);
      formData.append("imageType", "MEETING");
      formData.append("isMaster", "0");
      // Change here: use comma-separated string instead of JSON array
      formData.append("removedFiles", removedFileIds.join(","));
      imageUpload(formData);
    }
  };

  const handleModalClose = () => {
    reset();
    setModalOpen(false);
  };

  const MeetingInfo = () => {
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
            id=""
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

  const MeetingStatus = () => {
    const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
      currentPage: 1,
      pageSize: 10,
      search: "",
    });

    const { data: meeetingStatusData } = useGetCompanyMeetingStatus({
      filter: paginationFilter,
    });

    const [columnToggleOptions] = useState([
      { key: "srNo", label: "Sr No", visible: true },
      { key: "meetingStatus", label: "Meeting Status", visible: true },
    ]);

    // Filter visible columns
    const visibleColumns = columnToggleOptions.reduce(
      (acc, col) => {
        if (col.visible) acc[col.key] = col.label;
        return acc;
      },
      {} as Record<string, string>,
    );

    return (
      <div>
        <Controller
          name="meetingStatusId"
          control={control}
          rules={{ required: "Please select a meeting status" }}
          render={({ field }) => {
            // Find the selected object if only id is present
            let selectedObj = field.value;
            if (
              selectedObj &&
              typeof selectedObj === "string" &&
              Array.isArray(meeetingStatusData?.data)
            ) {
              selectedObj = meeetingStatusData.data.find(
                (item) => item.meetingStatusId === field.value,
              );
            }
            return (
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
            );
          }}
        />
      </div>
    );
  };

  const MeetingType = () => {
    const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
      currentPage: 1,
      pageSize: 10,
      search: "",
    });

    const { data: meetingTypeData } = getMeetingType({
      filter: paginationFilter,
    });
    const [columnToggleOptions] = useState([
      { key: "srNo", label: "Sr No", visible: true },
      { key: "meetingTypeName", label: "Meeting Type Name", visible: true },
    ]);

    // Filter visible columns
    const visibleColumns = columnToggleOptions.reduce(
      (acc, col) => {
        if (col.visible) acc[col.key] = col.label;
        return acc;
      },
      {} as Record<string, string>,
    );

    return (
      <div>
        <Controller
          name="meetingTypeId"
          control={control}
          rules={{ required: "Please select a meeting type" }}
          render={({ field }) => {
            // Find the selected object if only id is present
            let selectedObj = field.value;
            if (
              selectedObj &&
              typeof selectedObj === "string" &&
              Array.isArray(meetingTypeData?.data)
            ) {
              selectedObj = meetingTypeData.data.find(
                (item) => item.meetingTypeId === field.value,
              );
            }
            return (
              <TableData
                tableData={
                  meetingTypeData?.data?.map((item, index) => ({
                    ...item,
                    srNo:
                      (meetingTypeData.currentPage - 1) *
                        meetingTypeData.pageSize +
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
              />
            );
          }}
        />
      </div>
    );
  };

  const Joiners = () => {
    const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
      currentPage: 1,
      pageSize: 10,
      search: "",
      //   status: currentStatus, // Use currentStatus state
    });

    const { data: employeedata } = getEmployee({
      filter: paginationFilter,
    });
    const [columnToggleOptions, setColumnToggleOptions] = useState([
      { key: "srNo", label: "Sr No", visible: true },
      { key: "employeeName", label: "Joiners", visible: true },
      { key: "employeeMobile", label: "Mobile", visible: true },
    ]);

    // Filter visible columns
    const visibleColumns = columnToggleOptions.reduce(
      (acc, col) => {
        if (col.visible) acc[col.key] = col.label;
        return acc;
      },
      {} as Record<string, string>,
    );

    // Toggle column visibility
    const onToggleColumn = (key: string) => {
      setColumnToggleOptions((prev) =>
        prev.map((col) =>
          col.key === key ? { ...col, visible: !col.visible } : col,
        ),
      );
    };
    // Check if the number of columns is more than 3
    const canToggleColumns = columnToggleOptions.length > 3;

    return (
      <div>
        {" "}
        <div className=" mt-1 flex items-center justify-between">
          {canToggleColumns && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="ml-4 ">
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
        <Controller
          name="employeeId"
          control={control}
          render={({ field }) => (
            <>
              <TableData
                {...field}
                tableData={employeedata?.data.map((item, index) => ({
                  ...item,
                  srNo:
                    (employeedata.currentPage - 1) * employeedata.pageSize +
                    index +
                    1,
                }))}
                columns={visibleColumns}
                primaryKey="employeeId"
                paginationDetails={employeedata as PaginationFilter}
                setPaginationFilter={setPaginationFilter}
                multiSelect={true}
                selectedValue={field.value}
                handleChange={field.onChange}
              />
            </>
          )}
        />
      </div>
    );
  };

  // State to store uploaded files for preview
  const [uploadedFiles, setUploadedFiles] = useState<
    (File | string | { fileId: string; fileName: string })[]
  >([]);

  // State to track removed file IDs

  // File input ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // File upload handler for multiple files
  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploadedFiles((prev) => [...prev, ...files]);

    // Store files in react-hook-form
    setValue("meetingDocuments", [...uploadedFiles, ...files]);
  };

  // Remove a specific file from the list
  const handleRemoveFile = (index: number) => {
    const fileToRemove = uploadedFiles[index];
    let updatedRemovedIds = [...removedFileIds];

    // Type guard: check if fileToRemove is an object with fileId (not File, not string)
    if (
      typeof fileToRemove === "object" &&
      !(fileToRemove instanceof File) &&
      "fileId" in fileToRemove
    ) {
      updatedRemovedIds = [...removedFileIds, fileToRemove.fileId];
      setRemovedFileIds(updatedRemovedIds);
    }

    const newFiles = uploadedFiles.filter((_, idx) => idx !== index);
    setUploadedFiles(newFiles);
    setValue("meetingDocuments", newFiles);
  };

  // UploadDoc step component with file list and remove option, no preview
  const UploadDoc = () => (
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
      {uploadedFiles.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          <p className="text-sm text-gray-600 mb-2">
            {uploadedFiles.length} file(s) selected
          </p>
          {uploadedFiles.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 bg-gray-50 rounded"
            >
              <span className="font-medium truncate">
                {typeof file === "string"
                  ? file.substring(0, 20) + (file.length > 20 ? "..." : "")
                  : "fileName" in file
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
      {uploadedFiles.length === 0 && (
        <p className="text-sm text-gray-500 italic">No files selected</p>
      )}
    </div>
  );

  return {
    isModalOpen,
    handleClose,
    onFinish,
    onSubmit,
    MeetingInfo,
    MeetingStatus,
    MeetingType,
    Joiners,
    meetingPreview: getValues(),
    trigger,
    UploadDoc,
    methods, // Export methods for FormProvider
    companyMeetingId,
  };
}
