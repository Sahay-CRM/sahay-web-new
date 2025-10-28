import { Button } from "@/components/ui/button";
import useHolidays from "./useCompHolidays";
import AddHolidaysForm from "./AddHolidayFormModal";
import PageNotAccess from "../PageNoAccess";
import { Calendar, Edit, SearchIcon, Trash2 } from "lucide-react";
import { formatUTCDateToLocal } from "@/features/utils/app.utils";
import { Input } from "@/components/ui/input";
import FormSelect from "@/components/shared/Form/FormSelect";

export default function HoliDays() {
  const {
    setIsSearch,
    isSearch,
    handleAdd,
    modalData,
    isModalOpen,
    handleClose,
    permission,
    holidayData,
    handleEdit,
    monthOptions,
    selectedMonth,
    setSelectedMonth,
    handleDelete,
  } = useHolidays();

  const sortedHolidays = holidayData?.sort((a, b) => {
    const dateA = new Date(a.holidayDate!).getTime();
    const dateB = new Date(b.holidayDate!).getTime();
    return dateA - dateB; // Ascending order
  });

  if (permission && permission.View === false) {
    return <PageNotAccess />;
  }

  return (
    <div>
      <div className="flex gap-2 justify-between border-b-2 p-4">
        <div className={`relative h-10 w-full max-w-sm`}>
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">
            <SearchIcon className="w-4 h-4" />
          </span>
          <Input
            type="text"
            placeholder="Search..."
            value={isSearch}
            onChange={(e) => setIsSearch(e.target.value)}
            className={`pl-8 pr-2 w-96 h-10 py-2 text-sm`}
          />
        </div>
        <div className="flex gap-4">
          <FormSelect
            value={selectedMonth}
            onChange={(val) => setSelectedMonth(val as string)}
            options={monthOptions}
            placeholder="Select Month"
            triggerClassName="h-10 w-40 mb-0 py-4"
          />
          {permission.Add && (
            <div>
              <Button className="py-2 px-4" onClick={handleAdd}>
                Add Holiday
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 p-4 h-[calc(100vh-200px)] overflow-scroll">
        <div>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {sortedHolidays?.map((item, index) => (
              <div key={index} className="relative group">
                <div className="px-4 py-2 w-full border rounded-md shadow-sm">
                  <span className="p-0">{item.holidayName}</span>
                  <p className="p-0 text-sm flex items-center gap-1 text-gray-600">
                    <Calendar className="h-3 w-3" />{" "}
                    {formatUTCDateToLocal(item.holidayDate!)}
                  </p>
                </div>

                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-primary transition"
                    onClick={() => handleEdit(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-primary transition"
                    onClick={() => handleDelete(item.holidayId!)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {isModalOpen && (
        <AddHolidaysForm
          isModalOpen={isModalOpen}
          modalClose={handleClose}
          modalData={modalData!}
        />
      )}
    </div>
  );
}
