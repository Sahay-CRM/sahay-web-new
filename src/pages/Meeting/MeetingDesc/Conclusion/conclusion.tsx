/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import useConclusion from "./useConclusion";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

type TaskUpdateLocal = {
  oldValues: Record<string, string>;
  newValues: Record<string, string>;
};
type ProjectUpdateLocal = {
  oldValues: Record<string, string>;
  newValues: Record<string, string>;
};
type KpiUpdateLocal = {
  oldValues: Record<string, string | null>;
  newValues: Record<string, string | null>;
  recData?: {
    kpiId: string;
    startDate: string;
    endDate: string;
    data: string;
  }[];
};

// Helper to show old vs new values and highlight changes
function DiffField({
  label,
  oldValue,
  newValue,
}: {
  label: string;
  oldValue: unknown;
  newValue: unknown;
}) {
  const changed = oldValue !== newValue;
  return (
    <div className="flex items-center gap-2 mb-1">
      <span className="font-medium">{label}:</span>
      <span className={changed ? "line-through text-gray-400" : ""}>
        {String(oldValue)}
      </span>
      {changed && (
        <>
          <span className="mx-1 text-gray-400">→</span>
          <span className="font-bold text-green-600">{String(newValue)}</span>
          <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">
            Changed
          </span>
        </>
      )}
    </div>
  );
}

interface ConclusionProps {
  meetingStatus: string;
  meetingResponse: MeetingResFire | null;
}

export default function Conclusion({
  meetingStatus,
  meetingResponse,
}: ConclusionProps) {
  const { handleCloseMeetingWithLog, conclusionData } = useConclusion();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (meetingResponse?.state.lastSwitchTimestamp) {
      const interval = setInterval(() => {
        const now = Date.now();
        setElapsed(now - Number(meetingResponse.state.lastSwitchTimestamp));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [meetingResponse?.state.lastSwitchTimestamp]);

  // Format elapsed ms to mm:ss
  const minutes = String(Math.floor(elapsed / 60000)).padStart(2, "0");
  const seconds = String(Math.floor((elapsed % 60000) / 1000)).padStart(2, "0");
  const formattedTime = `${minutes}:${seconds}`;

  // Get logData from conclusionData (adjust if needed)
  const logData = conclusionData;

  return (
    <div>
      <div className="flex gap-4 items-center justify-between">
        <div className="flex gap-4 items-center">
          <h2 className="text-2xl font-semibold">Conclusion</h2>{" "}
          <div className="text-2xl font-medium text-primary">
            {formattedTime}
          </div>
        </div>

        {meetingStatus === "CONCLUSION" && (
          <Button
            variant="outline"
            className="bg-primary text-white cursor-pointer"
            onClick={handleCloseMeetingWithLog}
          >
            End Meeting
          </Button>
        )}
      </div>

      {/* Task Updates */}
      {logData?.discussion?.taskUpdate &&
        logData.discussion.taskUpdate.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Task Updates</h3>
            {logData.discussion.taskUpdate.map((update, idx: number) => {
              const u = update as unknown as TaskUpdateLocal;
              return (
                <Card key={idx} className="mb-4 p-4">
                  <div className="font-medium mb-2">Task Update</div>
                  {Object.keys(u.oldValues).map((key) => (
                    <DiffField
                      key={key}
                      label={key}
                      oldValue={u.oldValues[key]}
                      newValue={u.newValues[key]}
                    />
                  ))}
                </Card>
              );
            })}
          </div>
        )}

      {/* Project Updates */}
      {logData?.discussion?.projectUpdate &&
        logData.discussion.projectUpdate.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Project Updates</h3>
            {logData.discussion.projectUpdate.map((update, idx: number) => {
              const u = update as unknown as ProjectUpdateLocal;
              return (
                <Card key={idx} className="mb-4 p-4">
                  <div className="font-medium mb-2">Project Update</div>
                  {Object.keys(u.oldValues).map((key) => (
                    <DiffField
                      key={key}
                      label={key}
                      oldValue={u.oldValues[key]}
                      newValue={u.newValues[key]}
                    />
                  ))}
                </Card>
              );
            })}
          </div>
        )}

      {/* KPI Updates */}
      {logData?.discussion?.kpiUpdate &&
        logData.discussion.kpiUpdate.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">KPI Updates</h3>
            {logData.discussion.kpiUpdate.map((update, idx: number) => {
              const u = update as unknown as KpiUpdateLocal;
              return (
                <Card key={idx} className="mb-4 p-4">
                  <div className="font-medium mb-2">KPI Update</div>
                  {Object.keys(u.oldValues).map((key) => (
                    <DiffField
                      key={key}
                      label={key}
                      oldValue={u.oldValues[key]}
                      newValue={u.newValues[key]}
                    />
                  ))}
                  {/* recData Table */}
                  {u.recData && (
                    <div className="mt-4">
                      <div className="font-medium mb-1">Recorded Data</div>
                      <table className="min-w-full text-sm border">
                        <thead>
                          <tr>
                            <th className="border px-2 py-1">KPI ID</th>
                            <th className="border px-2 py-1">Start Date</th>
                            <th className="border px-2 py-1">End Date</th>
                            <th className="border px-2 py-1">Data</th>
                          </tr>
                        </thead>
                        <tbody>
                          {u.recData.map((rec: any, i: number) => (
                            <tr key={i}>
                              <td className="border px-2 py-1">{rec.kpiId}</td>
                              <td className="border px-2 py-1">
                                {rec.startDate}
                              </td>
                              <td className="border px-2 py-1">
                                {rec.endDate}
                              </td>
                              <td className="border px-2 py-1">{rec.data}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
    </div>
  );
}
