import useGetHoliday from "@/features/api/Holiday/useGetHoliday";
import { getUserPermission } from "@/features/selectors/auth.selector";
import { useState } from "react";
import { useSelector } from "react-redux";

export default function useCompHolidays() {
  const permission = useSelector(getUserPermission).COMPANY_PROFILE;
  const [isSearch, setIsSearch] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("0");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<HolidaysDataProps | null>(null);

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
    { value: "0", label: "All" },
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

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
  };
}
