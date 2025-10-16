import { deleteHolidayMutation } from "@/features/api/Holiday";
import useGetHoliday from "@/features/api/Holiday/useGetHoliday";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { getUserPermission } from "@/features/selectors/auth.selector";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function useCompHolidays() {
  const permission = useSelector(getUserPermission).COMPANY_PROFILE;
  const [isSearch, setIsSearch] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("12");
  const { setBreadcrumbs } = useBreadcrumbs();
  useEffect(() => {
    setBreadcrumbs([{ label: "Company Holiday", href: "" }]);
  }, [setBreadcrumbs]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<HolidaysDataProps | null>(null);

  const { mutate: deleteHoli } = deleteHolidayMutation();
  const { data: holidayData } = useGetHoliday({
    filter: {
      search: isSearch,
      monthFlag: Number(selectedMonth),
    },
    enable: isSearch.length > 2 || !!selectedMonth,
  });

  const handleAdd = () => {
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setModalData(null);
  };

  const handleEdit = (data: HolidaysDataProps) => {
    setIsModalOpen(true);
    setModalData(data);
  };

  const monthOptions = [
    { value: "12", label: "All" },
    { value: "0", label: "January" },
    { value: "1", label: "February" },
    { value: "2", label: "March" },
    { value: "3", label: "April" },
    { value: "4", label: "May" },
    { value: "5", label: "June" },
    { value: "6", label: "July" },
    { value: "7", label: "August" },
    { value: "8", label: "September" },
    { value: "9", label: "October" },
    { value: "10", label: "November" },
    { value: "11", label: "December" },
  ];

  const handleDelete = (id: string) => {
    deleteHoli(id);
  };

  return {
    setIsSearch,
    isSearch,
    handleAdd,
    modalData,
    isModalOpen,
    handleClose,
    permission,
    holidayData,
    handleEdit,
    setSelectedMonth,
    monthOptions,
    selectedMonth,
    handleDelete,
  };
}
