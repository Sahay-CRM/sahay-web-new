import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

import useGetEmployeeById from "@/features/api/companyEmployee/useEmployeeById";
import { ImageBaseURL } from "@/features/utils/urls.utils";
import { Card } from "@/components/ui/card";
import FormImage from "@/components/shared/Form/FormImage/FormImage";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import FormSelect from "@/components/shared/Form/FormSelect";
import { getDepartmentList } from "@/features/api/department";
import TableData from "@/components/shared/DataTable/DataTable";
import DropdownSearchMenu from "@/components/shared/DropdownSearchMenu/DropdownSearchMenu";
import SearchInput from "@/components/shared/SearchInput";
import useGetDesignation from "@/features/api/designation/useGetDesignation";
import DesignationAddFormModal from "@/pages/companyDesignation/designationFormModal/designationAddFormModal";
import { Button } from "@/components/ui/button";
import { getEmployee } from "@/features/api/companyEmployee";
import useAddOrUpdateEmployee from "@/features/api/companyEmployee/useAddEmployee";
import { imageUploadMutation } from "@/features/api/file";

export default function useAddEmployee() {
  const { id: companyEmployeeId } = useParams();
  const navigate = useNavigate();

  const [isModalOpen, setModalOpen] = useState(false);
  const [upEmdData, setUpEmpData] = useState<AddEmployeeDetailsById>({
    employeeId: "",
    employeeName: "",
    employeeEmail: "",
    employeeMobile: "",
    employeeType: "",
    photo: "",
  });

  const { data: employeeData } = useGetEmployeeById(companyEmployeeId!);
  const { mutate: addEmployee, isPending } = useAddOrUpdateEmployee();
  const { mutate: uploadImage } = imageUploadMutation();

  const {
    register,
    control,
    watch,
    formState: { errors },
    handleSubmit,
    trigger,
    reset,
    setValue,
    getValues,
  } = useForm<AddEmployeeDetailsById>({
    // mode: "onBlur",
    values: upEmdData!,
  });

  const showNextStep = watch("employeeType") !== "OWNER";
  const departmentId = watch("department")?.departmentId;

  useEffect(() => {
    if (employeeData?.data) {
      const data = employeeData?.data;

      const fetchedEmData = {
        employeeId: data.employeeId || " ",
        employeeName: data.employeeName || "",
        employeeEmail: data.employeeEmail || "",
        employeeMobile: data.employeeMobile
          ? data.employeeMobile.startsWith("+91")
            ? data.employeeMobile.slice(3)
            : data.employeeMobile
          : "",
        employeeType: data.employeeType || "",
        department: data.department,
        designation: data.designation,
        employee: data.reportingManager || data.reportingManagerId,
        photo: data?.photo
          ? `${ImageBaseURL}/share/profilePics/${data.photo}`
          : "",
      };
      const currentValues = getValues();
      const isFormEmpty =
        !currentValues.employeeName && !currentValues.employeeType;

      if (isFormEmpty) {
        setUpEmpData(fetchedEmData);
      }
    }
  }, [employeeData, getValues]);

  const onSubmit = handleSubmit(async (data) => {
    let employeeMobile = data.employeeMobile || "";
    if (!employeeMobile.startsWith("+91")) {
      employeeMobile = "+91" + employeeMobile;
    }

    const payload = companyEmployeeId
      ? {
          employeeId: companyEmployeeId,
          companyId: employeeData?.data.companyId,
          departmentId: data.department?.departmentId || data.departmentId,
          designationId: data.designation?.designationId || data.designationId,
          reportingManagerId: data?.employee?.employeeId,
          employeeName: data.employeeName,
          employeeEmail: data.employeeEmail,
          employeeMobile: employeeMobile,
          employeeType: data.employeeType,
        }
      : {
          companyId: employeeData?.data.companyId,
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
        const getEmployeeId = () => {
          if (companyEmployeeId) return companyEmployeeId;
          if (res && typeof res === "object") {
            if (Array.isArray(res) && res.length > 0 && res[0]?.employeeId) {
              return res[0].employeeId;
            }
            if (res.data && res.data.employeeId) return res.data.employeeId;
          }
          return undefined;
        };
        const employeeId = getEmployeeId();
        const uploadIfPresent = async (
          file: File | string | null | undefined,
          fileType: string,
        ) => {
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
      },
    });
  });

  const handleModalClose = () => {
    reset();
    setModalOpen(false);
  };

  const onFinish = useCallback(async () => {
    const isValid = await trigger();
    if (isValid) {
      setModalOpen(true);
    }
  }, [trigger]);

  const handleClose = () => setModalOpen(false);

  const EmployeeStatus = () => {
    const [countryCode, setCountryCode] = useState<string>("+91");

    const employeeTypeOptions = [
      { value: "EMPLOYEE", label: "EMPLOYEE" },
      { value: "OWNER", label: "OWNER" },
    ];

    return (
      <div className="flex gap-5">
        <Card className="flex items-start w-1/3 px-4 py-4">
          <FormImage
            value={watch("photo") ?? ""}
            onChange={(val) => setValue("photo", val)}
            label="Upload Profile"
          />
        </Card>
        <Card className="col-span-2 px-4 py-4 grid grid-cols-2 w-2/3">
          <div>
            <FormInputField
              isMandatory
              label="Employee Name"
              placeholder="Enter Employee Name"
              {...register("employeeName", { required: "Name is required" })}
              error={errors.employeeName}
              onFocus={(e) => e.target.select()}
              className="mt-0"
            />
          </div>
          <div>
            <FormInputField
              label="Email"
              placeholder="Enter Email"
              {...register("employeeEmail", {
                // required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter valid email",
                },
              })}
              error={errors.employeeEmail}
              onFocus={(e) => e.target.select()}
            />
          </div>
          <div>
            <FormInputField
              isMandatory
              id="employeeMobile"
              label="Mobile Number"
              {...register("employeeMobile", {
                required: "Please enter your mobile number",
                minLength: {
                  value: 10,
                  message: "Mobile number must be at least 10 digits",
                },
                pattern: {
                  value: /^[6-9]\d{9}$/,
                  message: "Please enter a valid 10-digit mobile number",
                },
              })}
              error={errors.employeeMobile}
              placeholder="Enter mobile number"
              options={[{ value: "+91", label: "+91" }]}
              selectedCodeValue={countryCode || "+91"}
              onCountryCodeChange={setCountryCode}
              className="text-lg py-5"
            />
          </div>
          <div>
            <Controller
              control={control}
              name="employeeType"
              rules={{ required: "Employee Type is required" }}
              render={({ field }) => (
                <FormSelect
                  isMandatory
                  label="Employee Type"
                  value={field.value}
                  onChange={field.onChange}
                  options={employeeTypeOptions}
                  error={errors.employeeType}
                />
              )}
            />
          </div>
        </Card>
      </div>
    );
  };

  const DepartmentSelect = () => {
    const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
      currentPage: 1,
      pageSize: 25,
      search: "",
    });

    const { data: departmentData, isLoading } = getDepartmentList({
      filter: paginationFilter,
    });
    const [columnToggleOptions, setColumnToggleOptions] = useState([
      { key: "srNo", label: "Sr No", visible: true },
      { key: "departmentName", label: "Department Name", visible: true },
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
        <div className="mt-1 mb-4 flex items-start justify-between">
          <div className="flex items-center gap-2 mb-2">
            <SearchInput
              placeholder="Search..."
              searchValue={paginationFilter?.search || ""}
              setPaginationFilter={setPaginationFilter}
              className="w-80"
              error={errors.department}
            />
          </div>

          {canToggleColumns && (
            <div className="ml-4">
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
            <TableData
              {...field}
              tableData={departmentData?.data.map((item, index) => ({
                ...item,
                srNo:
                  (departmentData.currentPage - 1) * departmentData.pageSize +
                  index +
                  1,
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
              isLoading={isLoading}
              showActionsColumn={false}
            />
          )}
        />
      </div>
    );
  };

  const Designation = () => {
    const [addDesignationModal, setAddDesignationModal] = useState(false);
    const [modalData, setModalData] = useState<DesignationData>(
      {} as DesignationData,
    );

    const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
      currentPage: 1,
      pageSize: 25,
      search: "",
    });

    const { data: designationData, isLoading } = useGetDesignation({
      filter: {
        ...paginationFilter,
        departmentId: departmentId,
      },
      enable: !!departmentId,
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

    const closeDeleteModal = (): void => {
      setModalData({
        designationId: "",
        designationName: "",
        parentId: null,
        companyId: "",
        departmentId: "",
        departmentName: "",
        companyName: "",
      });
      setAddDesignationModal(false);
    };

    const handleAdd = () => {
      setModalData({
        designationId: "",
        designationName: "",
        parentId: null,
        companyId: "",
        departmentId: departmentId!,
        departmentName: "",
        companyName: "",
      });
      setAddDesignationModal(true);
    };

    return (
      <div>
        <div className="mt-1 mb-4 flex items-start justify-between">
          <div className="flex items-center gap-2 mb-2">
            <SearchInput
              placeholder="Search..."
              searchValue={paginationFilter?.search || ""}
              setPaginationFilter={setPaginationFilter}
              className="w-80"
              error={errors.designation}
            />

            <Button className="py-2 w-fit" onClick={handleAdd}>
              Add Designation
            </Button>
          </div>

          {/* Right side: Toggle */}
          {canToggleColumns && (
            <div className="ml-4">
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
              <TableData
                {...field}
                tableData={designationData?.data.map((item, index) => ({
                  ...item,
                  srNo:
                    (designationData.currentPage - 1) *
                      designationData.pageSize +
                    index +
                    1,
                }))}
                isActionButton={() => false}
                columns={visibleColumns}
                primaryKey="designationId"
                paginationDetails={designationData as PaginationFilter}
                setPaginationFilter={setPaginationFilter}
                selectedValue={field.value}
                handleChange={field.onChange}
                isLoading={isLoading}
                showActionsColumn={false}
                onCheckbox={() => true}
                multiSelect={false}
              />
            </>
          )}
        />

        {addDesignationModal && (
          <DesignationAddFormModal
            isModalOpen={addDesignationModal}
            modalClose={closeDeleteModal}
            modalData={modalData}
          />
        )}
      </div>
    );
  };

  const ReportingManage = () => {
    const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
      currentPage: 1,
      pageSize: 25,
      search: "",
    });

    const { data: allEmpData, isLoading } = getEmployee({
      filter: paginationFilter,
    });
    const [columnToggleOptions, setColumnToggleOptions] = useState([
      { key: "srNo", label: "Sr No", visible: true },
      { key: "employeeName", label: "Reporting Manager", visible: true },
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
        <div className="mt-1 mb-4 flex items-start justify-between">
          <div className="flex items-center gap-2 mb-2">
            <SearchInput
              placeholder="Search..."
              searchValue={paginationFilter?.search || ""}
              setPaginationFilter={setPaginationFilter}
              className="w-80"
              error={errors.employee}
            />
          </div>

          {/* Right side: Toggle */}
          {canToggleColumns && (
            <div className="ml-4">
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
            <TableData
              {...field}
              tableData={allEmpData?.data.map((item, index) => ({
                ...item,
                srNo:
                  (allEmpData.currentPage - 1) * allEmpData.pageSize +
                  index +
                  1,
              }))}
              isActionButton={() => false}
              columns={visibleColumns}
              primaryKey="employeeId"
              paginationDetails={allEmpData as PaginationFilter}
              setPaginationFilter={setPaginationFilter}
              selectedValue={field.value}
              onCheckbox={() => true}
              handleChange={(val) => {
                if (!val || (Array.isArray(val) && val.length === 0)) {
                  field.onChange(undefined);
                } else if (Array.isArray(val)) {
                  field.onChange(val[0]);
                } else {
                  field.onChange(val);
                }
              }}
              isLoading={isLoading}
              showActionsColumn={false}
            />
          )}
        />
      </div>
    );
  };

  return {
    companyEmployeeId,
    employeeData,
    showNextStep,
    EmployeeStatus,
    DepartmentSelect,
    Designation,
    ReportingManage,
    isPending,
    onFinish,
    trigger,
    isModalOpen,
    employeePreview: getValues(),
    handleClose,
    onSubmit,
  };
}
