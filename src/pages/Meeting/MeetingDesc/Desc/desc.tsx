import useDesc from "./useDesc";
import { Button } from "@/components/ui/button";

export default function Desc({ meetingStatus }: { meetingStatus: string }) {
  const {
    issueData,
    objectiveData,
    totalData,
    currentIndex,
    setCurrentIndex,
    allItems,
    handleCloseMeetingWithLog,
  } = useDesc();

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, totalData - 1));
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const getCurrentItem = () => {
    const issueLength = issueData?.data?.length ?? 0;
    if (currentIndex < issueLength) {
      return issueData?.data?.[currentIndex];
    } else {
      return objectiveData?.data?.[currentIndex - issueLength];
    }
  };

  const currentItem = getCurrentItem();

  return (
    <div className="">
      <div className="flex flex-wrap items-center gap-4 rounded-xl bg-white px-2 py-2 shadow mb-6">
        <div>
          <span className="text-lg font-bold min-w-[120px] text-primary">
            {allItems[currentIndex]?.label || "-"}
          </span>
          <span className="text-md text-black ml-3 text-center">
            {currentIndex + 1} / {totalData}
          </span>
        </div>

        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="mx-1"
        >
          Previous
        </Button>

        <Button
          variant="outline"
          onClick={handleNext}
          disabled={currentIndex === totalData - 1}
          className="mx-1"
        >
          Next
        </Button>

        <div className="flex items-center mx-2">
          <label htmlFor="jump-to" className="text-sm mr-2">
            Jump To:
          </label>
          <select
            id="jump-to"
            value={currentIndex}
            onChange={(e) => setCurrentIndex(Number(e.target.value))}
            className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {allItems.map((item) => (
              <option key={item.index} value={item.index}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {meetingStatus === "DISCUSSION" && (
          <Button
            variant="destructive"
            className="ml-auto"
            onClick={handleCloseMeetingWithLog}
          >
            End Meeting
          </Button>
        )}
      </div>

      <div className="w-full p-4 border rounded-xl shadow bg-white text-center">
        {currentItem ? (
          <pre>{JSON.stringify(currentItem, null, 2)}</pre>
        ) : (
          <p>No data available</p>
        )}
      </div>
    </div>
  );
}
