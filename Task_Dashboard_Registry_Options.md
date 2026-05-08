# Task Module Dashboard Configuration Summary

Based on the [dashboard-builder-registry.json](file://sakha1/Share/dashboard-builder-registry.json), here is a detailed breakdown of the options and capabilities available for the **Task Module** in the Sahay CRM dashboard.

## 1. Metrics (KPIs)
You can track the following 12 metrics for tasks:

| Metric ID | Label | Description/Aggregation |
|-----------|-------|-------------------------|
| `TOTAL_TASKS` | Total Tasks | Total count of tasks. |
| `ACTIVE_TASKS` | Active Tasks | Count of currently active tasks. |
| `COMPLETED_TASKS` | Completed Tasks | Count of finished tasks (Relational). |
| `FAILED_TASKS` | Failed Tasks | Count of tasks marked as failed. |
| `IN_PROGRESS_TASKS`| In-Progress Tasks | Tasks currently being worked on. |
| `OVERDUE_TASKS` | Overdue Tasks | Tasks past their deadline. |
| `TASK_COMPLETION_RATE`| Completion Rate (%) | Percentage of tasks completed. |
| `OVERDUE_RATE` | Overdue Rate (%) | Percentage of tasks that are overdue. |
| `AVG_CLOSURE_TIME_DAYS`| Avg Closure Time | Average days taken to close a task. |
| `TASKS_BY_STATUS` | Tasks by Status | Distribution across different statuses. |
| `TASKS_BY_TYPE` | Tasks by Type | Distribution by task category/type. |
| `TASKS_BY_EMPLOYEE` | Tasks by Employee | Tasks assigned to specific users. |

## 2. Visualization Options (Charts)
The Task module supports almost all visualization types:
- **Quick Glance**: `card`, `gauge`
- **Comparisons**: `bar`, `stacked-bar`, `pie`, `donut`
- **Trends**: `line`, `area`
- **Detailed Views**: `table`, `gantt` (Project Timeline), `calendar`
- **Pipelines**: `funnel`

## 3. Filters & Segmentation
You can refine task data using these filters:
- **Core Filters**: `companyId` (Multi-select), `isDeleted` (Toggle)
- **Task Specific**: `taskStatusId` (Multi-select), `taskTypeId` (Multi-select)
- **Ownership**: `employeeId` (Async Search)

## 4. Grouping (Dimensions)
Data can be grouped by:
- `taskStatusId` (Status)
- `taskTypeId` (Type)
- `employeeId` (Assigned To)
- `companyId` (Organization)
- `createdMonth` (Time-based grouping)

## 5. Date Field Support
You can base your time-filters on any of these dates:
- `createdDatetime` (Default)
- `taskDeadline`
- `taskStartDate`
- `taskActualEndDate`
- `updatedDatetime`

## 6. Technical Specifications (API)
- **Table Source**: `company_task_master`
- **Query Endpoint**: `/api/dashboard/query/task`
- **Filter Options**: `/api/dashboard/filter-options/task`
- **Real-time Support**: Available for simple metrics (Total, Active, In-Progress).

## 7. Business Rules & Logic
- **Gantt Charts**: Specifically allowed for Tasks. Requires a `dateField` (Start/Deadline).
- **Refresh Rates**: Simple metrics support real-time/1M/5M intervals. Computed metrics (like Completion Rate) are capped to **On-Demand** refresh for performance.
- **Dependency**: The `employeeId` filter requires a `companyId` to be selected first.

---
*Created based on registry version 1.0.0.*
