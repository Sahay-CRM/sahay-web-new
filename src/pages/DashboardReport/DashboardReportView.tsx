import React, { useEffect } from "react";
import { useGetDashboardRegistryData } from "@/features/api/DashboardRegistry/useGetDashboardRegistryData";

const DashboardReportView: React.FC = () => {
  const { data, isLoading, error } = useGetDashboardRegistryData();

  useEffect(() => {}, [data, error]);

  return (
    <div className="p-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
          {isLoading ? (
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          ) : error ? (
            <div className="text-red-500 font-bold text-xl">!</div>
          ) : (
            <div className="text-green-500 font-bold text-xl">✓</div>
          )}
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900">
            {isLoading
              ? "Fetching API Data"
              : error
                ? "Error Loading Data"
                : "Data Received"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Check the browser console (F12) to see the registry data logs.
          </p>
        </div>
        <div className="mt-4 px-4 py-2 bg-gray-50 rounded-lg border border-gray-100">
          <code className="text-xs text-blue-600 font-mono">
            POST /company/registry/data
          </code>
        </div>
      </div>
    </div>
  );
};

export default DashboardReportView;
