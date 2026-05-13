import React from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { OrganizationChartContent } from "./OrganizationChartContent";

const OrganizationChart: React.FC = () => (
  <ReactFlowProvider>
    <OrganizationChartContent />
  </ReactFlowProvider>
);

export default OrganizationChart;
