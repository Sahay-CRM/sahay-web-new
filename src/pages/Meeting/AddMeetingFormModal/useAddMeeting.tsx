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
import { useNavigate, useParams } from "react-router-dom";
import { format, parseISO } from "date-fns";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";

export default function useAddEmployee() {
  const { id: companyMeetingId } = useParams();
  const [isModalOpen, setModalOpen] = useState(false);

  const { mutate: addMeeting } = useAddUpdateCompanyMeeting();
  const navigate = useNavigate();
  const { data: meetingApiData } = useGetCompanyMeetingById(
    companyMeetingId || "",
  );

  const {
    register,
    formState: { errors },
    control,
    handleSubmit,
    trigger,
    reset,
    getValues,
    setValue, // <-- add setValue
  } = useForm({
    mode: "onChange",
  });
  // console.log(getValues());

  useEffect(() => {
    if (meetingApiData?.data) {
      const data = meetingApiData.data;
      reset({
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
    }
  }, [meetingApiData, reset]);

  const handleClose = () => setModalOpen(false);

  const onFinish = useCallback(async () => {
    const isValid = await trigger();
    if (isValid) {
      setModalOpen(true);
    }
  }, [trigger]);

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
      onSuccess: () => {
        handleModalClose();
      },
    });
    navigate("/dashboard/meeting");
  });

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

    const [columnToggleOptions, setColumnToggleOptions] = useState([
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
        <div className=" mt-1 flex items-center justify-between">
          {canToggleColumns && (
            <div className="ml-4 ">
              <DropdownSearchMenu
                columns={columnToggleOptions}
                onToggleColumn={onToggleColumn}
              />
            </div>
          )}
        </div>

        <Controller
          name="meetingStatusId"
          control={control}
          rules={{ required: "Please select a meeting status" }}
          render={({ field }) => (
            <>
              <div className="mb-4">
                {errors?.meetingStatusId && (
                  <span className="text-red-600 text-[calc(1em-1px)] tb:text-[calc(1em-2px)] before:content-['*']">
                    {String(errors?.meetingStatusId?.message || "")}
                  </span>
                )}
              </div>
              <TableData
                {...field}
                tableData={meeetingStatusData?.data.map((item, index) => ({
                  ...item,
                  srNo: index + 1,
                }))}
                isActionButton={() => false}
                columns={visibleColumns}
                primaryKey="meetingStatusId"
                paginationDetails={meeetingStatusData}
                setPaginationFilter={setPaginationFilter}
                multiSelect={false}
                selectedValue={field.value}
                handleChange={field.onChange}
                // permissionKey="--"
              />
            </>
          )}
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
    const [columnToggleOptions, setColumnToggleOptions] = useState([
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
        <div className=" mt-1 flex items-center justify-between">
          {canToggleColumns && (
            <div className="ml-4 ">
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
            <>
              <div className="mb-4">
                {errors?.meetingTypeId && (
                  <span className="text-red-600 text-[calc(1em-1px)] tb:text-[calc(1em-2px)] before:content-['*']">
                    {String(errors?.meetingTypeId?.message || "")}
                  </span>
                )}
              </div>
              <TableData
                {...field}
                tableData={meetingTypeData?.data.map((item, index) => ({
                  ...item,
                  srNo: index + 1,
                }))}
                isActionButton={() => false}
                columns={visibleColumns}
                primaryKey="meetingTypeId"
                paginationDetails={meetingTypeData}
                setPaginationFilter={setPaginationFilter}
                multiSelect={false}
                selectedValue={field.value}
                handleChange={field.onChange}
                // permissionKey="--"
              />
            </>
          )}
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
        <div className=" mt-1 flex items-center justify-between">
          {canToggleColumns && (
            <div className="ml-4 ">
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
          render={({ field }) => (
            <>
              <TableData
                {...field}
                tableData={employeedata?.data.map((item, index) => ({
                  ...item,
                  srNo: index + 1,
                }))}
                columns={visibleColumns}
                primaryKey="employeeId"
                paginationDetails={employeedata}
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
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // File upload handler for multiple files
  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploadedFiles((prev) => [...prev, ...files]);

    // Store files in react-hook-form
    setValue("meetingDocuments", [...uploadedFiles, ...files]);

    // Log each upload (replace with actual API call if needed)
    files.forEach((file) => {
      const formData = new FormData();
      formData.append("refId", companyMeetingId || "");
      formData.append("imageType", "MEETING");
      formData.append("isMaster", "0");
      formData.append("file", file);

      // console.log("Uploading file:", {
      //   name: file.name,
      //   type: file.type,
      //   imageType: "MEETING",
      // });
    });
  };

  // Remove a specific file from the list
  const handleRemoveFile = (index: number) => {
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
        onClick={() => fileInputRef.current?.click()}
      >
        Choose Files
      </button>
      <input
        type="file"
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.mp4,.avi,.mov,.mkv"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        name="meetingDocuments"
        multiple
      />
      {uploadedFiles.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          {uploadedFiles.map((file, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span className="font-medium">{file.name}</span>
              <button
                type="button"
                className="ml-2 px-2 py-1 bg-red-500 text-white rounded text-xs"
                onClick={() => handleRemoveFile(idx)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
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
  };
}
