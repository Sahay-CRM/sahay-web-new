import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

import useAddOrUpdateEmployee from "@/features/api/companyEmployee/useAddEmployee";
import useGetEmployeeById from "@/features/api/companyEmployee/useEmployeeById";
import { imageUploadMutation } from "@/features/api/file";
import { ImageBaseURL } from "@/features/utils/urls.utils";

export default function useAddEmployee() {
  const { id: companyEmployeeId } = useParams();
  const [isModalOpen, setModalOpen] = useState(false);

  const { mutate: addEmployee, isPending } = useAddOrUpdateEmployee();
  const { data: employeeApiData } = useGetEmployeeById(companyEmployeeId || "");
  const { mutate: uploadImage } = imageUploadMutation();

  const navigate = useNavigate();
  const methods = useForm({
    mode: "onChange",
  });
  const {
    formState: { errors },
    handleSubmit,
    trigger,
    reset,
    getValues,
    watch,
    setFocus,
  } = methods;

  useEffect(() => {
    if (employeeApiData?.data) {
      const data = employeeApiData?.data;

      reset({
        employeeId: data.employeeId || " ",
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

  const employeeTypeValue = watch("employeeType");
  const department = watch("department") as { departmentId?: string } | null;
  const showNextStep = employeeTypeValue !== "OWNER";

  const handleClose = () => setModalOpen(false);

  const onFinish = useCallback(async () => {
    const isValid = await trigger();

    if (!isValid) {
      if (errors.employeeName) {
        setFocus("employeeName");
      } else if (errors.employeeEmail) {
        setFocus("employeeEmail");
      } else if (errors.employeeMobile) {
        setFocus("employeeMobile");
      } else if (errors.employeeType) {
        setFocus("employeeType");
      }
      return;
    }
    setModalOpen(true);
  }, [trigger, errors, setFocus, setModalOpen]);

  const onSubmit = handleSubmit(async (data) => {
    let employeeMobile = data.employeeMobile || "";
    if (!employeeMobile.startsWith("+91")) {
      employeeMobile = "+91" + employeeMobile;
    }
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
          fileType: string
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
                "file.png"
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

  return {
    isModalOpen,
    handleClose,
    onFinish,
    onSubmit,
    employeePreview: getValues(),
    companyEmployeeId,
    trigger,
    showNextStep,
    isPending,
    methods,
    departmentApiConfig: department,
    employeeApiData,
  };
}
