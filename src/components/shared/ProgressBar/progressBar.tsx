import React from "react";

interface ProgressBarProps {
  total: number;
  completed: number;
  showPercentage?: boolean;
  height?: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  total,
  completed,
  showPercentage = true,
  height = 20,
}) => {
  const completedPercentage = total > 0 ? (completed / total) * 100 : 0;
  const safeCompletedPercentage = Math.min(completedPercentage, 100);

  return (
    <div className="w-full space-y-3">
      <div
        className="relative w-full bg-gray-200 rounded-full overflow-hidden"
        style={{ height: `${height}px` }}
      >
        {/* Gradient Fill */}
        <div
          className="absolute top-0 left-0 h-full transition-all duration-500 ease-out rounded-full bg-gradient-to-r from-green-300 via-green-600 to-green-700"
          style={{ width: `${safeCompletedPercentage}%` }}
        />

        {showPercentage && (
          <>
            {completed !== total ? (
              <>
                {/* {safeCompletedPercentage > 20 && ( */}
                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-medium text-black">
                  {completed}
                </div>
                {/* )} */}
                {/* Total number on the right */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-600">
                  {total}
                </div>
              </>
            ) : (
              // Show only one number when completed === total
              <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                {total} of {completed} Items Completed
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProgressBar;
