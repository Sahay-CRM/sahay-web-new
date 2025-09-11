import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { getALLDepartmentList } from "@/features/api/department";
import {
  addUpdateDesignation,
  getDesignationDropdown,
} from "@/features/api/designation";

interface UseDesignationFormModalProps {
  modalClose: () => void;
  modalData?: DesignationData;
}

export default function useDesignationFormModal({
  modalClose,
  modalData,
}: UseDesignationFormModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    control,
  } = useForm({
    values: modalData,
  });

  const departmentId = watch("departmentId");

  const { DepartmentOptions } = useDesignationFormModalOptions();
  const { designationOptions } = useDesignationDropdownOptions(departmentId);
  const { handleSubmit: submitDesignation, isLoading } =
    useDesignationFormSubmit(modalClose);

  const onSubmit = handleSubmit((data) => {
    submitDesignation(data);
  });

  useEffect(() => {
    reset(modalData);
  }, [modalData, reset]);

  return {
    register,
    errors,
    onSubmit,
    DepartmentOptions,
    designationOptions,
    control,
    isLoading,
  };
}

// Export as default and named for compatibility
export function useDesignationFormModalOptions() {
  const [isDepartmentSearch, setIsDepartmentSearch] = useState("");

  const { data: departmentData } = getALLDepartmentList({
    filter: {
      search: isDepartmentSearch.length >= 3 ? isDepartmentSearch : undefined,
    },
    enable: isDepartmentSearch.length >= 3,
  });
  const DepartmentOptions = [
    ...(
      (departmentData?.data ?? []) as Array<{
        departmentName: string;
        departmentId: string;
      }>
    ).map((item) => ({
      label: item.departmentName,
      value: item.departmentId,
    })),
  ];
  return { DepartmentOptions, setIsDepartmentSearch };
}

export function useDesignationDropdownOptions(departmentId?: string) {
  const [isParentDesSearch, setIsParentDesSearch] = useState("");

  const { data: designationData } = getDesignationDropdown({
    filter: {
      departmentId: departmentId || "",
      search: isParentDesSearch.length >= 3 ? isParentDesSearch : undefined,
    },
    enable: isParentDesSearch.length >= 3,
  });
  const designationOptions = [
    ...(
      (designationData?.data ?? []) as Array<{
        designationName: string;
        designationId: string;
      }>
    ).map((item) => ({
      label: item.designationName,
      value: item.designationId,
    })),
  ];
  return { designationOptions, setIsParentDesSearch };
}

export function useDesignationFormSubmit(modalClose: () => void) {
  const { mutate: addDesignation, isPending: isLoading } =
    addUpdateDesignation();
  const handleSubmit = (
    data: DesignationData & { isParentDesignation?: boolean },
  ) => {
    const submitData = {
      ...data,
      parentId: data.isParentDesignation ? data.parentId : null,
    };
    addDesignation(submitData, {
      onSuccess: () => {
        modalClose();
      },
    });
  };
  return { handleSubmit, isLoading };
}
