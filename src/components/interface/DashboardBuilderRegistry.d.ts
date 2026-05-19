interface RegistryStep {
  step: number;
  key: string;
  label: string;
  selectionType: "single" | "multiple" | "none";
  required: boolean;
  dependsOn: string[];
}

interface RegistryModule {
  moduleKey: string;
  label: string;
  table: string;
  allowedMetrics: string[];
  defaultMetric: string;
  defaultChart: string;
  supportedCharts: string[];
  dateFields: string[];
  defaultDateField: string;
  groupByFields: string[];
  defaultFilters: string[];
  searchable: boolean;
}

interface RegistryMetric {
  module: string;
  label: string;
  aggregation: string;
  fieldHint?: string | null;
  joinHint?: string;
  complexity: "simple" | "relational" | "computed" | "expensive";
  requiredDateField: boolean;
  supportsRealtime?: boolean;
  supportedGroupBy: string[];
  supportedCharts: string[];
  defaultGroupBy?: string;
}

interface RegistryFilter {
  label: string;
  type: "async-search" | "multi-select" | "toggle" | "text" | "date-range";
  sourceTable?: string;
  sourceEnum?: string;
  valueField?: string;
  labelField?: string;
  multiSelect: boolean;
  searchable: boolean;
  dependsOn?: string[];
  availableForModules: string[];
  default?: unknown;
  options?: { label: string; value: unknown }[];
}

interface RegistryDateField {
  label: string;
  fieldType: string;
  availableForModules: string[];
}

interface RegistryGroupBy {
  label: string;
  availableForModules: string[];
  sourceTable?: string;
  sourceEnum?: string;
  labelField?: string;
  requiresChart: string[];
  computed?: boolean;
  granularity?: string;
}

interface RegistryVisualization {
  requiresGroupBy: boolean;
  supportsTimeSeries: boolean;
  maxMetrics: number | null;
  allowedAggregations: string[];
  blockedFor: string[];
  requiredModules?: string[];
  requiresDateField?: boolean;
  requiresStartEndField?: boolean;
}

interface Registry {
  version: string;
  steps: RegistryStep[];
  modules: RegistryModule[];
  metrics: Record<string, RegistryMetric>;
  filters: Record<string, RegistryFilter>;
  dateFields: Record<string, RegistryDateField>;
  groupBy: Record<string, RegistryGroupBy>;
  visualizations: Record<string, RegistryVisualization>;
  dependencies: {
    moduleToFilters: Record<string, string[]>;
    metricToRequiredFilters: Record<string, string[]>;
    metricToDateFieldSupport: Record<string, string[]>;
    chartRequiresGroupBy: string[];
    chartRequiresDateField: string[];
    chartRequiresTimeSeriesGroupBy: Record<string, string[]>;
  };
}

interface WidgetConfig {
  moduleKey: string;
  id?: string;
  metricKey: string;
  filters: Record<string, unknown>;
  dateField?: string;
  groupBy?: string;
  visualization: string;
  widgetName: string;
}

interface DashboardRegistryReport {
  srNo: number;
  id: string;
  employeeId: string;
  companyId: string;
  groupBy: string;
  dateField: string;
  metricKey: string;
  moduleKey: string;
  widgetName: string;
  visualization: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  createDatetime: string;
  updatedDatetime: string;
  filters?: unknown;
  // UI helper fields
  report_name?: string;
  module?: string | (Partial<WidgetConfig> & { [key: string]: unknown });
  metric?: string;
}

interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data: T;
  totalCount?: number;
  totalPage?: number;
  currentPage?: number;
  pageSize?: number;
  hasMore?: boolean;
}

interface PaginatedResponse<T> extends ApiResponse<T> {
  totalCount: number;
  totalPage: number;
  currentPage: number;
  pageSize: number;
  hasMore: boolean;
}
