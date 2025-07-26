import { Button } from "@/components/ui/button";
import useConclusion from "./useConclusion";
import { useEffect, useState } from "react";
import { SpinnerIcon } from "@/components/shared/Icons";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { updateDetailMeetingMutation } from "@/features/api/companyMeeting";

interface ConclusionProps {
  meetingStatus: string;
  meetingResponse: MeetingResFire | null;
  detailMeetingId?: string;
}

export default function Conclusion({
  meetingStatus,
  meetingResponse,
  detailMeetingId,
}: ConclusionProps) {
  const { mutate: updateDetailMeeting } = updateDetailMeetingMutation();

  const {
    conclusionData,
    isPending,
    isLoading,
    hasChanges,
    setSelectedAgenda,
    selectedAgenda,
    endMeet,
    meetingId,
  } = useConclusion();
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

  const handleCloseMeetingWithLog = () => {
    const [minutes, seconds] = formattedTime.split(":").map(Number);
    const totalSeconds = minutes * 60 + seconds;

    if (meetingId && detailMeetingId) {
      updateDetailMeeting(
        {
          meetingId: meetingId,
          detailMeetingId: detailMeetingId,
          conclusionTime: String(totalSeconds), // Make sure API accepts it as string
        },
        {
          onSuccess: () => {
            endMeet(meetingId);
          },
        },
      );
    }
  };

  const formatTime = (timeInSeconds: number | string): string => {
    const totalSeconds = Math.floor(Number(timeInSeconds));
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const selectedItem = conclusionData?.agenda?.[selectedAgenda];

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "delayed":
        return <AlertTriangle className="w-4 h-4" />;
      case "in progress":
        return <Clock className="w-4 h-4" />;
      case "blasted":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "delayed":
        return "text-red-600 bg-red-100";
      case "in progress":
        return "text-yellow-600 bg-yellow-100";
      case "blasted":
        return "text-purple-600 bg-purple-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const renderStatusChange = (oldStatus: string, newStatus: string) => {
    if (oldStatus === newStatus) {
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(newStatus)}`}
        >
          {getStatusIcon(newStatus)}
          {newStatus}
        </span>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(oldStatus)}`}
        >
          {getStatusIcon(oldStatus)}
          {oldStatus}
        </span>
        <span className="text-gray-400">→</span>
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(newStatus)}`}
        >
          {getStatusIcon(newStatus)}
          {newStatus}
        </span>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const planned = Number(selectedItem?.plannedTime ?? 0);
  const actual = Number(selectedItem?.actualTime ?? 0);
  const isOverTime = actual > planned;

  // Calculate totals
  // const totalPlannedTime =
  //   conclusionData?.reduce(
  //     (sum, item) => sum + Number(item.plannedTime || 0),
  //     0
  //   ) || 0;

  // const totalActualTime =
  //   conclusionData?.reduce(
  //     (sum, item) => sum + Number(item.actualTime || 0),
  //     0
  //   ) || 0;

  const isTotalOverTime =
    Number(conclusionData?.agendaActual) >
    Number(conclusionData?.agendaPlanned);

  return (
    <div>
      {isLoading ? (
        <div className="flex justify-center items-center h-20">
          <div className="animate-spin">
            <SpinnerIcon />
          </div>
        </div>
      ) : (
        <div>
          <div className="flex gap-4 items-center justify-between">
            <div className="flex gap-4 items-center w-80">
              <h2 className="text-2xl font-semibold">Conclusion</h2>{" "}
              <div className="text-2xl font-medium text-primary">
                {formattedTime}
              </div>
            </div>
            <div className="min-w-2/4 w-full">
              <div className="flex gap-4 items-center">
                <div className="flex items-center gap-2 border px-3 py-1 rounded-lg">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="font-medium"> Agenda Planned:</span>
                  <span className="font-bold">
                    {formatTime(Number(conclusionData?.agendaPlanned))}
                  </span>
                </div>
                <div className="flex items-center gap-2 border px-3 py-1 rounded-lg">
                  <Clock className="w-4 h-4 text-green-600" />
                  <span className="font-medium">Agenda Actual:</span>
                  <span className="font-bold">
                    {formatTime(Number(conclusionData?.agendaActual))}
                  </span>
                </div>
                <div className="flex items-center gap-2 border px-3 py-1 rounded-lg">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="font-medium"> Discussion Planned:</span>
                  <span className="font-bold">
                    {formatTime(Number(conclusionData?.agendaTotalPlanned))}
                  </span>
                </div>
                <div className="flex items-center gap-2 border px-3 py-1 rounded-lg">
                  <Clock className="w-4 h-4 text-green-600" />
                  <span className="font-medium">Discussion Actual:</span>
                  <span className="font-bold">
                    {formatTime(Number(conclusionData?.agendaTotalActual))}
                  </span>
                </div>
                {isTotalOverTime && (
                  <div className="flex items-center gap-2 bg-red-50 px-3 py-1 rounded-lg">
                    <Clock className="w-4 h-4 text-red-600" />
                    <span className="font-medium">Total Overtime:</span>
                    <span className="font-bold">
                      {formatTime(
                        Number(conclusionData?.agendaActual) -
                          Number(conclusionData?.agendaPlanned),
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {meetingStatus === "CONCLUSION" && (
              <Button
                variant="outline"
                className="bg-primary text-white cursor-pointer"
                onClick={handleCloseMeetingWithLog}
                disabled={isPending}
              >
                End Meeting
              </Button>
            )}
          </div>

          <div className="flex gap-4 justify-between overflow-hidden mt-5 h-[calc(100vh-210px)] border rounded shadow-lg p-3">
            <div className="w-sm pr-2 border-r border-gray-200 h-[calc(100vh-220px)] overflow-x-scroll">
              <h3 className="font-semibold text-gray-800 mb-4">Agenda Items</h3>
              <div className="space-y-2">
                {conclusionData?.agenda.map((item, index) => (
                  <button
                    key={item.detailMeetingAgendaIssueId}
                    onClick={() => setSelectedAgenda(index)}
                    className={`w-full text-left p-4 rounded-lg transition-all ${
                      selectedAgenda === index
                        ? "bg-blue-100 border-2 border-blue-300 shadow-md"
                        : "bg-white border border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.name}</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span>
                          Planned:{" "}
                          <b className="text-black">
                            {formatTime(item.plannedTime)}
                          </b>
                        </span>
                        <span>
                          Actual:{" "}
                          <b className="text-black">
                            {formatTime(item.actualTime)}
                          </b>
                        </span>
                      </div>

                      <div className="mt-1 capitalize">
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded-full ${
                            item.agendaType === "issue"
                              ? "bg-gray-100 text-black"
                              : "bg-gray-100 text-black"
                          }`}
                        >
                          {item.agendaType}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 px-6 h-[calc(100vh-230px)] overflow-x-scroll">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {selectedItem?.name}
                    </h2>
                  </div>
                </div>

                <div
                  className={`grid ${isOverTime ? "grid-cols-3" : "grid-cols-2"} gap-4 mb-6`}
                >
                  <div className="bg-gray-200 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-black mb-2">
                      <Clock className="w-5 h-5" />
                      <span className="font-semibold">Planned Time</span>
                    </div>
                    <p className="text-2xl font-bold text-black">
                      {formatTime(selectedItem?.plannedTime ?? 0)} min
                    </p>
                  </div>
                  <div className="bg-primary p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-white mb-2">
                      <Clock className="w-5 h-5" />
                      <span className="font-semibold">Actual Time</span>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {formatTime(selectedItem?.actualTime ?? 0)} min
                    </p>
                  </div>
                  {isOverTime && (
                    <div className="bg-red-200/50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-red-500 mb-2">
                        <Clock className="w-5 h-5" />
                        <span className="font-semibold">Over Time</span>
                      </div>
                      <div className="text-2xl font-bold text-red-700">
                        {(() => {
                          const diff = Math.round(actual - planned);
                          const minutes = Math.floor(diff / 60);
                          const seconds = diff % 60;

                          // Format as 2-digit mm:ss
                          const formatted = `${minutes.toString().padStart(2, "0")}:${seconds
                            .toString()
                            .padStart(2, "0")} min`;

                          return (
                            <p className="text-2xl text-red-600 mt-1">
                              {formatted}
                            </p>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Updates Sections */}
              <div className="space-y-6">
                {/* Task Updates */}
                {selectedItem &&
                  selectedItem?.discussion.taskUpdate.length > 0 && (
                    <div className="bg-white border rounded-lg p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <CheckCircle className="w-6 h-6 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-800">
                          Tasks Updates
                        </h3>
                        <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
                          {selectedItem?.discussion.taskUpdate.length} updates
                        </span>
                      </div>
                      <div className="space-y-4">
                        {selectedItem?.discussion.taskUpdate.map(
                          (task, idx) => (
                            <div
                              key={idx}
                              className="bg-gray-100 p-4 rounded-lg"
                            >
                              <h4 className="font-medium text-gray-800 mb-2">
                                Task Name : {task.newValues.taskName}
                              </h4>
                              {(task.oldValues.taskStatus ||
                                task.newValues.taskStatus) && (
                                <p className="text-sm text-gray-700">
                                  <span className="text-red-500">
                                    {task.oldValues.taskStatus || "N/A"}
                                  </span>
                                  ➜
                                  <span className="text-green-600">
                                    {task.newValues.taskStatus || "N/A"}
                                  </span>
                                </p>
                              )}
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                {selectedItem &&
                  selectedItem?.discussion.projectUpdate.length > 0 && (
                    <div className="bg-white border rounded-lg p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Users className="w-6 h-6 text-green-600" />
                        <h3 className="text-lg font-semibold text-gray-800">
                          Projects Updates
                        </h3>
                        <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full">
                          {selectedItem?.discussion.projectUpdate.length}{" "}
                          updates
                        </span>
                      </div>
                      <div className="space-y-4">
                        {selectedItem?.discussion.projectUpdate.map(
                          (project, idx) => (
                            <div
                              key={idx}
                              className="bg-gray-100 p-4 rounded-lg"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h4 className="font-medium text-gray-800">
                                    Project Name :{" "}
                                    {project.newValues.projectName}
                                  </h4>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {project.newValues.projectDescription}
                                  </p>
                                </div>
                              </div>
                              {project.oldValues.projectStatus ||
                                (project.newValues.projectStatus && (
                                  <div className="mb-3">
                                    {renderStatusChange(
                                      project.oldValues.projectStatus,
                                      project.newValues.projectStatus,
                                    )}
                                  </div>
                                ))}

                              <div className="flex flex-wrap gap-2 mb-2">
                                {project.newValues.subParameters
                                  ?.split(",")
                                  .map((param, paramIdx) => (
                                    <span
                                      key={paramIdx}
                                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                                    >
                                      {param.trim()}
                                    </span>
                                  ))}
                              </div>
                              {project.newValues.projectEmployees && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Users className="w-4 h-4" />
                                  <span>
                                    Team: {project.newValues.projectEmployees}
                                  </span>
                                </div>
                              )}
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                {selectedItem &&
                  selectedItem?.discussion.kpiUpdate.length > 0 && (
                    <div className="bg-white border rounded-lg p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-6 h-6 text-purple-600" />
                        <h3 className="text-lg font-semibold text-gray-800">
                          KPIs Updates
                        </h3>
                        <span className="bg-purple-100 text-purple-800 text-sm px-2 py-1 rounded-full">
                          {selectedItem?.discussion.kpiUpdate.length} updates
                        </span>
                      </div>
                      <div className="space-y-4">
                        {selectedItem?.discussion.kpiUpdate.map((kpi, idx) => (
                          <div key={idx} className="bg-gray-100 p-4 rounded-lg">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-medium text-gray-800">
                                  KPI Name : {kpi.newValues.kpiName}
                                </h4>
                                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                  {kpi.newValues.kpiFrequency && (
                                    <span>
                                      Frequency: {kpi.newValues.kpiFrequency}
                                    </span>
                                  )}
                                  {kpi.newValues.value1 && (
                                    <span>
                                      Target: {kpi.newValues.value1}
                                      {kpi.newValues.kpiUnit}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {kpi.newValues.tag && (
                                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                                  {kpi.newValues.tag}
                                </span>
                              )}
                            </div>

                            {kpi.recData && kpi.recData.length > 0 && (
                              <div className="mt-3">
                                <h5 className="text-sm font-medium text-gray-700 mb-2">
                                  Recent Data:
                                </h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {kpi.recData.map((data, dataIdx) => (
                                    <div
                                      key={dataIdx}
                                      className="bg-white p-2 rounded border"
                                    >
                                      <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">
                                          {formatDate(data.startDate)}
                                        </span>
                                        <span className="font-semibold text-lg text-purple-600">
                                          {data.data}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* No Updates Message */}
                {!hasChanges(selectedItem) && (
                  <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <div className="text-gray-400 mb-2">
                      <Target className="w-12 h-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-600 mb-2">
                      No Updates Recorded
                    </h3>
                    <p className="text-gray-500">
                      This agenda item was discussed but no specific updates
                      were recorded.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
