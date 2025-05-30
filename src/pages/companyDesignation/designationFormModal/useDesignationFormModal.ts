import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { getALLDepartmentList } from "@/features/api/department";
import {
  addUpdateDesignation,
  getDesignaationDropdown,
} from "@/features/api/designation";

interface UseDesignationFormModalProps {
  modalClose: () => void;
  modalData?: DesignationData;
}

export default function useDesignationFormModal({
  modalClose,
  modalData,
}: UseDesignationFormModalProps) {
  const { mutate: addDesignation } = addUpdateDesignation();
  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
    watch,
    control,
  } = useForm({
    values: modalData,
  });

  const { data: departmentData } = getALLDepartmentList();
  const DepartmentOptions = (departmentData?.data ?? []).map((item) => ({
    label: item.departmentName,
    value: item.departmentId,
  }));
  const { data: designationData } = getDesignaationDropdown();
  const designationOptions = (designationData?.data ?? []).map((item) => ({
    label: item.designationName,
    value: item.designationId,
  }));

  const onSubmit = handleSubmit(async (data) => {
    addDesignation(data, {
      onSuccess: () => {
        handleModalClose();
      },
    });
  });

  const handleModalClose = () => {
    reset();
    modalClose();
  };

  useEffect(() => {
    reset(modalData);
  }, [modalData, reset]);

  return {
    register,
    errors,
    onSubmit,
    watch,
    handleModalClose,
    DepartmentOptions,
    designationOptions,
    control,
  };
}
