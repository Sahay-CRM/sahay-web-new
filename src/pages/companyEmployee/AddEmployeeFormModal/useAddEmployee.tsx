import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

import { Card } from "@/components/ui/card";
import FormSelect from "@/components/shared/Form/FormSelect";
import useAddOrUpdateEmployee from "@/features/api/companyEmployee/useAddEmployee";
import { getDepartmentList } from "@/features/api/department";
import TableData from "@/components/shared/DataTable/DataTable";
import DropdownSearchMenu from "@/components/shared/DropdownSearchMenu/DropdownSearchMenu";
import { getEmployee } from "@/features/api/companyEmployee";
import useGetEmployeeById from "@/features/api/companyEmployee/useEmployeeById";
import useGetDesignation from "@/features/api/designation/useGetDesignation";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import FormImage from "@/components/shared/Form/FormImage/FormImage";
import { imageUploadMutation } from "@/features/api/file";
import { ImageBaseURL } from "@/features/utils/urls.utils";

export default function useAddEmployee() {
  const { id: companyEmployeeId } = useParams();
  const [isModalOpen, setModalOpen] = useState(false);

  const { mutate: addEmployee } = useAddOrUpdateEmployee();
  const { data: employeeApiData } = useGetEmployeeById(companyEmployeeId || "");
  const { mutate: uploadImage } = imageUploadMutation();

  const navigate = useNavigate();
  const {
    register,
    formState: { errors },
    control,
    handleSubmit,
    trigger,
    reset,
    getValues,
    watch,
    setValue,
  } = useForm({
    mode: "onChange",
  });
  useEffect(() => {
    if (employeeApiData?.data) {
      const data = employeeApiData?.data;

      reset({
        employeeName: data.employeeName || "",
        employeeEmail: data.employeeEmail || "",
        employeeMobile: data.employeeMobile
          ? data.employeeMobile.startsWith("+91")
            ? data.employeeMobile.slice(3)
            : data.employeeMobile
          : "",
        employeeType: data.employeeType || "",
        department:
          typeof data.department === "object" && data.department !== null
            ? data.department
            : data.departmentId
              ? { departmentId: data.departmentId }
              : undefined,
        designation:
          typeof data.designation === "object" && data.designation !== null
            ? data.designation
            : data.designationId
              ? { designationId: data.designationId }
              : null,
        employee: data.reportingManager || data.reportingManagerId,
        photo: data?.photo
          ? `${ImageBaseURL}/share/profilePics/${data.photo}`
          : "",
      });
    }
  }, [employeeApiData, reset]);

  // Watch employeeType field

  const employeeTypeValue = watch("employeeType");
  const department = watch("department") as { departmentId?: string } | null;
  const showNextStep = employeeTypeValue !== "OWNER";

  const handleClose = () => setModalOpen(false);

  const onFinish = useCallback(async () => {
    const isValid = await trigger();
    if (isValid) {
      setModalOpen(true);
    }
  }, [trigger]);

  const onSubmit = handleSubmit(async (data) => {
    // Ensure employeeMobile starts with +91, but don't add if already present
    let employeeMobile = data.employeeMobile || "";
    if (!employeeMobile.startsWith("+91")) {
      employeeMobile = "+91" + employeeMobile;
    }

    // You may need to get companyId from route params, context, or form data
    // Here, we try to get it from department or a similar source; adjust as needed
    const companyId =
      data.department?.companyId ||
      data.companyId ||
      (employeeApiData?.data?.companyId ?? "");
    const payload = companyEmployeeId
      ? {
          employeeId: companyEmployeeId,
          companyId: companyId,
          departmentId: data.department?.departmentId || data.departmentId,
          designationId: data.designation?.designationId || data.designationId,
          reportingManagerId: data?.employee?.employeeId,
          employeeName: data.employeeName,
          employeeEmail: data.employeeEmail,
          employeeMobile: employeeMobile,
          employeeType: data.employeeType,
        }
      : {
          companyId: companyId,
          departmentId: data.department?.departmentId || data.departmentId,
          designationId: data.designation?.designationId || data.designationId,
          reportingManagerId: data?.employee?.employeeId,
          employeeName: data.employeeName,
          employeeEmail: data.employeeEmail,
          employeeMobile: employeeMobile,
          employeeType: data.employeeType,
        };

    addEmployee(payload, {
      onSuccess: async (res) => {
        // --- Image upload logic (type 1010) ---
        const getEmployeeId = () => {
          if (companyEmployeeId) return companyEmployeeId;
          if (res && typeof res === "object") {
            if (Array.isArray(res) && res.length > 0 && res[0]?.employeeId) {
              return res[0].employeeId;
            }
            // Fix: get employeeId from res.data if present
            if (res.data && res.data.employeeId) return res.data.employeeId;
          }
          return undefined;
        };
        const employeeId = getEmployeeId();
        const uploadIfPresent = async (
          file: File | string | null | undefined,
          fileType: string,
        ) => {
          // Only upload if file is a new File or a data URL (not a URL string)
          if (
            file &&
            ((typeof file === "string" && file.startsWith("data:")) ||
              (typeof File !== "undefined" && file instanceof File))
          ) {
            const formData = new FormData();
            formData.append("refId", employeeId || "");
            formData.append("fileType", fileType);
            formData.append("isMaster", "1");
            formData.append("isUpdate", "1");
            if (typeof file === "string" && file.startsWith("data:")) {
              const arr = file.split(",");
              const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
              const bstr = atob(arr[1]);
              let n = bstr.length;
              const u8arr = new Uint8Array(n);
              while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
              }
              formData.append(
                "file",
                new Blob([u8arr], { type: mime }),
                "file.png",
              );
            } else {
              formData.append("file", file as File);
            }

            await uploadImage(formData);
          }
        };
        await uploadIfPresent(data.photo, "1010");
        handleModalClose();
        navigate("/dashboard/company-employee");
        // window.location.reload();
      },
    });
  });

  const handleModalClose = () => {
    reset();
    setModalOpen(false);
  };

  const EmployeeStatus = () => {
    const [countryCode, setCountryCode] = useState<string>("+91");
    const employeeTypeOptions = [
      { value: "EMPLOYEE", label: "EMPLOYEE" },
      { value: "OWNER", label: "OWNER" },
    ];
    return (
      <div className="flex gap-5">
        {/* Photo Upload Card */}
        <Card className="flex items-start w-1/3 px-4 py-4">
          <FormImage
            value={watch("photo") ?? ""}
            onChange={(val: unknown) => setValue("photo", val)}
            label="Upload Profile"
          />
        </Card>
        <Card className="col-span-2 px-4 py-4 grid grid-cols-2 gap-4 w-2/3">
          <FormInputField
            label="Employee Name"
            {...register("employeeName", { required: "Name is required" })}
            error={errors.employeeName}
          />
          <FormInputField
            label="Email"
            {...register("employeeEmail", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter valid email",
              },
            })}
            error={errors.employeeEmail}
          />
          <FormInputField
            id="employeeMobile"
            label="Mobile Number"
            {...register("employeeMobile", {
              required: "Please enter your mobile number",
            })}
            error={errors.employeeMobile}
            placeholder="Enter mobile number"
            options={[{ value: "+91", label: "+91" }]}
            selectedCodeValue={countryCode || "+91"}
            onCountryCodeChange={setCountryCode}
            className="text-lg"
          />
          <Controller
            control={control}
            name="employeeType"
            rules={{ required: "Employee Type is required" }}
            render={({ field }) => (
              <FormSelect
                label="Employee Type"
                value={field.value}
                onChange={field.onChange}
                options={employeeTypeOptions}
                error={errors.employeeType}
              />
            )}
          />
        </Card>
      </div>
    );
  };

  const DepartmentSelect = () => {
    const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
      currentPage: 1,
      pageSize: 10,
      search: "",
    });

    const { data: departmentData } = getDepartmentList({
      filter: paginationFilter,
    });
    const [columnToggleOptions, setColumnToggleOptions] = useState([
      { key: "srNo", label: "Sr No", visible: true },
      { key: "departmentName", label: "Department Name", visible: true },
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
          name="department"
          control={control}
          rules={{ required: "Please select a Department" }}
          render={({ field }) => (
            <>
              <div className="mb-4">
                {errors?.departmentId && (
                  <span className="text-red-600 text-[calc(1em-1px)] tb:text-[calc(1em-2px)] before:content-['*']">
                    {String(errors?.departmentId?.message || "")}
                  </span>
                )}
              </div>
              <TableData
                {...field}
                tableData={departmentData?.data.map((item, index) => ({
                  ...item,
                  srNo: index + 1,
                }))}
                isActionButton={() => false}
                columns={visibleColumns}
                primaryKey="departmentId"
                paginationDetails={departmentData}
                setPaginationFilter={setPaginationFilter}
                multiSelect={false}
                selectedValue={field.value}
                handleChange={field.onChange}
                onCheckbox={() => true}
                // permissionKey="--"
              />
            </>
          )}
        />
      </div>
    );
  };

  const Designation = () => {
    const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
      currentPage: 1,
      pageSize: 10,
      search: "",
    });

    const { data: designationData } = useGetDesignation({
      filter: {
        ...paginationFilter,
        departmentId: department?.departmentId || "",
      },
    });
    const [columnToggleOptions, setColumnToggleOptions] = useState([
      { key: "srNo", label: "Sr No", visible: true },
      { key: "designationName", label: "Designation Name", visible: true },
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
          name="designation"
          control={control}
          rules={{ required: "Please select a Designation" }}
          render={({ field }) => (
            <>
              <div className="mb-4">
                {errors?.designationId && (
                  <span className="text-red-600 text-[calc(1em-1px)] tb:text-[calc(1em-2px)] before:content-['*']">
                    {String(errors?.designationId?.message || "")}
                  </span>
                )}
              </div>
              <TableData
                {...field}
                tableData={designationData?.data.map((item, index) => ({
                  ...item,
                  srNo: index + 1,
                }))}
                isActionButton={() => false}
                columns={visibleColumns}
                primaryKey="designationId"
                paginationDetails={designationData as PaginationFilter}
                setPaginationFilter={setPaginationFilter}
                onCheckbox={() => true}
                multiSelect={false}
                selectedValue={field.value}
                handleChange={field.onChange}
              />
            </>
          )}
        />
      </div>
    );
  };
  const ReportingManage = () => {
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
      { key: "employeeName", label: "Reporting Manager", visible: true },
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
          name="employee"
          control={control}
          rules={{ required: "Please select a report manager" }}
          render={({ field }) => (
            <>
              <TableData
                {...field}
                tableData={employeedata?.data.map((item, index) => ({
                  ...item,
                  srNo: index + 1,
                }))}
                isActionButton={() => false}
                columns={visibleColumns}
                primaryKey="employeeId"
                paginationDetails={employeedata as PaginationFilter}
                setPaginationFilter={setPaginationFilter}
                selectedValue={field.value}
                onCheckbox={() => true}
                handleChange={(val) => {
                  // Only allow a single value or undefined
                  if (!val || (Array.isArray(val) && val.length === 0)) {
                    field.onChange(undefined);
                  } else if (Array.isArray(val)) {
                    field.onChange(val[0]);
                  } else {
                    field.onChange(val);
                  }
                }}
                // permissionKey="--"
              />
            </>
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
    EmployeeStatus,
    DepartmentSelect,
    Designation,
    ReportingManage,
    employeePreview: getValues(),
    companyEmployeeId,
    trigger,
    showNextStep,
  };
}
