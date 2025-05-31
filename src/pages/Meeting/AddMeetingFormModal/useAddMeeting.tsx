import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
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
  } = useForm({
    mode: "onChange",
  });

  useEffect(() => {
    if (meetingApiData?.data) {
      const data = meetingApiData?.data;
      reset({
        meetingName: data.meetingName || "",
        meetingDescription: data.meetingDescription || "",
        meetingDateTime: data.meetingDateTime
          ? format(parseISO(data?.meetingDateTime), "yyyy-MM-dd")
          : "",
        meetingStatusId: data.meetingStatus || "",
        meetingTypeId: data.meetingType || undefined,
        employeeId: data.joiners || undefined,
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
      joiners: data?.employeeId?.map((ele) => ele?.employeeId),
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
          />

          <FormInputField
            label="Meeting Description"
            {...register("meetingDescription", {
              required: "Description is required",
            })}
            error={errors.meetingDescription}
          />

          <FormInputField
            id=""
            type="date"
            label="Meeting Date & Time"
            {...register("meetingDateTime", {
              required: "Date & Time is required",
            })}
            error={errors.meetingDateTime}
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
          rules={{ required: "Please select a Task Priority" }}
          render={({ field }) => (
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
      { key: "meetingTypeName", label: "Designation Name", visible: true },
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
          rules={{ required: "Please select a Task Priority" }}
          render={({ field }) => (
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
          rules={{ required: "Please select a Task Priority" }}
          render={({ field }) => (
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

              // permissionKey="--"
            />
          )}
        />
      </div>
    );
  };

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
    // employeeId,
    trigger,
  };
}
