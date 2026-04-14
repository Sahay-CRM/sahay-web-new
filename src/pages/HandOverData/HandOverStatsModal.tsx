import React from "react";
import ModalData from "@/components/shared/Modal/ModalData";
import { useGetHandoverStats } from "@/features/api/HandOver";
import { Loader2 } from "lucide-react";

interface HandOverStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

const HandOverStatsModal: React.FC<HandOverStatsModalProps> = ({
  isOpen,
  onClose,
  userId,
  userName,
}) => {
  const { data: statsRes, isLoading } = useGetHandoverStats({
    userId,
    enabled: isOpen && !!userId,
  });

  const stats = statsRes?.data;

  const statsList = [
    { label: "Total Impact Count", value: stats?.total, isHeader: true },
    { label: "Owned Tasks", value: stats?.tasks },
    { label: "Assigned Tasks", value: stats?.assignedTasks },
    { label: "Owned Projects", value: stats?.projects },
    { label: "Assigned Projects", value: stats?.assignedProjects },
    { label: "Owned Meetings", value: stats?.meetings },
    { label: "Assigned Meetings", value: stats?.assignedMeetings },
    { label: "To-dos", value: stats?.todos },
    { label: "Change Requests", value: stats?.requests },
    { label: "Subordinates", value: stats?.subordinates },
  ];

  return (
    <ModalData
      isModalOpen={isOpen}
      modalClose={onClose}
      modalTitle={`Handover Statistics for ${userName}`}
      containerClass="min-w-[400px] max-w-[500px]"
      buttons={[
        {
          btnText: "Close",
          btnClick: onClose,
          buttonCss: "bg-gray-200 text-black border-gray-300 hover:bg-gray-300",
        },
      ]}
    >
      <div className="py-2">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-gray-500">Fetching statistics...</p>
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 gap-3">
            {statsList.map((stat, index) => (
              <div
                key={index}
                className={`flex justify-between items-center p-3 rounded-lg ${
                  stat.isHeader
                    ? "bg-primary/10 border border-primary/20 mb-2"
                    : "bg-gray-50 border border-gray-100"
                }`}
              >
                <span
                  className={`text-sm ${stat.isHeader ? "font-bold text-primary" : "text-gray-600 font-medium"}`}
                >
                  {stat.label}
                </span>
                <span
                  className={`text-base font-semibold ${stat.isHeader ? "text-primary" : "text-gray-900"}`}
                >
                  {stat.value ?? 0}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            No statistics available for this user.
          </div>
        )}
      </div>
    </ModalData>
  );
};

export default HandOverStatsModal;
