import { useCallback, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import TableData from "@/components/shared/DataTable/DataTable";
import DropdownSearchMenu from "@/components/shared/DropdownSearchMenu/DropdownSearchMenu";
import { getEmployee } from "@/features/api/companyEmployee";
import { useAddUpdateCompanyMeeting } from "@/features/api/companyMeeting";
import {
  useGetCompanyProject,
  useGetCorparameter,
} from "@/features/api/companyProject";

export default function useAddEmployee() {
  const [isModalOpen, setModalOpen] = useState(false);

  const { mutate: addMeeting } = useAddUpdateCompanyMeeting();

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
    // values: employeeApiData, // If you have employee data to prefill
  });

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
      joiners: data?.joiners,
    };
    // console.log(payload.meetingStatusId);
    // console.log(payload);
    addMeeting(payload, {
      onSuccess: () => {
        handleModalClose();
      },
    });
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
            label="Project Name"
            {...register("projectName", { required: "Name is required" })}
            error={errors.projectName}
          />

          <FormInputField
            label="Project Description"
            {...register("projectDescription", {
              required: "Description is required",
            })}
            error={errors.projectDescription}
          />

          <FormInputField
            id=""
            type="datetime-local"
            label="Project Deadline"
            {...register("projectDeadline", {
              required: "Date & Time is required",
            })}
            error={errors.projectDeadline}
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

    const { data: projectlistdata } = useGetCompanyProject({
      filter: paginationFilter,
    });

    const [columnToggleOptions, setColumnToggleOptions] = useState([
      { key: "srNo", label: "Sr No", visible: true },
      { key: "projectStatus", label: "Meeting Status", visible: true },
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
          name="projectStatusId"
          control={control}
          rules={{ required: "Please select a Task Priority" }}
          render={({ field }) => (
            <TableData
              {...field}
              tableData={projectlistdata?.data.map((item, index) => ({
                ...item,
                srNo: index + 1,
                projectStatus: item.projectStatus?.projectStatus || "N/A",
              }))}
              isActionButton={false}
              columns={visibleColumns}
              primaryKey="projectStatusId"
              paginationDetails={projectlistdata}
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

    const { data: mcoreparameter } = useGetCorparameter({
      filter: paginationFilter,
    });
    const [columnToggleOptions, setColumnToggleOptions] = useState([
      { key: "srNo", label: "Sr No", visible: true },
      { key: "coreParameterName", label: "Core Parameter", visible: true },
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
          name="coreParameterId"
          control={control}
          rules={{ required: "Please select a Task Priority" }}
          render={({ field }) => (
            <TableData
              {...field}
              tableData={mcoreparameter?.data.map((item, index) => ({
                ...item,
                srNo: index + 1,
              }))}
              isActionButton={false}
              columns={visibleColumns}
              primaryKey="coreParameterId"
              paginationDetails={mcoreparameter}
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
