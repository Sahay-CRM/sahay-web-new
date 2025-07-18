import { SpinnerIcon } from "@/components/shared/Icons";
import Timer from "../Timer";
import useDesc from "./useDesc";
import { Button } from "@/components/ui/button";

interface DescProps {
  meetingResponse?: MeetingResFire | null;
  meetingStatus: string;
  detailMeetingId: string | undefined;
}

export default function Desc({
  meetingStatus,
  meetingResponse,
  detailMeetingId,
}: DescProps) {
  const {
    totalData,
    currentIndex,
    allItems,
    handleCloseMeetingWithLog,
    handleNextWithLog,
    handlePreviousWithLog,
    handleJump,
    isLoading,
  } = useDesc({ meetingResponse, detailMeetingId });

  const getCurrentItem = () => {
    const issueLength = allItems?.length ?? 0;
    if (currentIndex < issueLength) {
      return allItems?.[currentIndex];
    }
  };

  const currentItem = getCurrentItem() as MeetingAgenda;

  console.log(currentIndex);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-20">
        <div className="animate-spin">
          <SpinnerIcon />
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="flex flex-wrap items-center gap-4 rounded-xl bg-white px-2 py-2 shadow mb-6">
        <Timer
          plannedTime={Number(currentItem?.plannedTime)}
          actualTime={Number(
            meetingResponse?.timers.objectives?.[
              currentItem.detailMeetingAgendaIssueId ?? 0
            ].actualTime,
          )}
          lastSwitchTimestamp={Number(
            meetingResponse?.state.lastSwitchTimestamp,
          )}
          isEditMode={false}
          meetingStart={true}
        />
        <div>
          <span className="text-lg font-bold min-w-[120px] text-primary">
            {(allItems && allItems[currentIndex]?.name) || "-"}
          </span>
          <span className="text-md text-black ml-3 text-center">
            {currentIndex + 1} / {totalData}
          </span>
        </div>

        <Button
          variant="outline"
          onClick={handlePreviousWithLog}
          disabled={currentIndex === 0}
          className="mx-1"
        >
          Previous
        </Button>

        <Button
          variant="outline"
          onClick={handleNextWithLog}
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
            onChange={(e) => handleJump(Number(e.target.value))}
            className="border-b border-black px-2 py-1 focus:outline-none focus:ring-0"
          >
            {allItems &&
              allItems.map((item, index) => (
                <option key={index} value={index}>
                  {item.name}
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
