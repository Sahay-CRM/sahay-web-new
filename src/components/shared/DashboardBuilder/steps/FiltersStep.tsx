import {
  useGetAllTaskStatus,
  useAllTaskType,
} from "@/features/api/companyTask";
import DropdownSearchMenu from "@/components/shared/DropdownSearchMenu/DropdownSearchMenu";

interface FiltersStepProps {
  registry: Registry;
  config: WidgetConfig;
  currentModule?: RegistryModule;
  onUpdate: (updates: Partial<WidgetConfig>) => void;
}

const FiltersStep: React.FC<FiltersStepProps> = ({
  registry,
  config,
  onUpdate,
}) => {
  // Fetch Task Statuses
  const { data: taskStatusRes } = useGetAllTaskStatus({ filter: {} });
  // Fetch Task Types
  const { data: taskTypeRes } = useAllTaskType({ filter: {} });

  const taskStatusOptions = (taskStatusRes?.data || []).map(
    (status: TaskStatusAllRes) => ({
      label: status.taskStatus,
      value: status.taskStatusId,
    }),
  );

  const taskTypeOptions = (taskTypeRes?.data || []).map(
    (type: TaskTypeData) => ({
      label: type.taskTypeName,
      value: type.taskTypeId || "",
    }),
  );

  // Get filter definitions for the current module
  const moduleFilters =
    registry.dependencies.moduleToFilters[config.moduleKey] || [];

  const handleFilterChange = (filterKey: string, value: string[] | string) => {
    onUpdate({
      filters: {
        ...config.filters,
        [filterKey]: value,
      },
    });
  };

  const renderFilter = (filterKey: string) => {
    const filterDef = registry.filters[filterKey];
    if (!filterDef) return null;

    let options: { label: string; value: string; count?: number }[] = [];

    // Map registry filter keys to API data or static options
    if (filterKey === "taskStatusId") {
      options = taskStatusOptions as { label: string; value: string }[];
    } else if (filterKey === "taskTypeId") {
      options = taskTypeOptions as { label: string; value: string }[];
    } else if (filterDef.options) {
      options = filterDef.options.map((opt) => ({
        label: opt.label,
        value: String(opt.value),
      }));
    }

    // Only render if we have options available
    if (options.length === 0) return null;

    return (
      <div key={filterKey} className="space-y-2">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
          {filterDef.label}
        </label>
        <DropdownSearchMenu
          label={filterDef.label}
          options={options}
          selected={(config.filters[filterKey] as string[]) || []}
          onChange={(selected) => handleFilterChange(filterKey, selected)}
          multiSelect={filterDef.multiSelect}
        />
      </div>
    );
  };

  return (
    <div className="max-w-4xl py-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {moduleFilters.map(renderFilter)}
      </div>

      {moduleFilters.length === 0 && (
        <div className="py-12 text-center border-2 border-dashed border-gray-100 rounded-3xl">
          <p className="text-sm text-gray-400 italic">
            No specific filters defined for this module.
          </p>
        </div>
      )}
    </div>
  );
};

export default FiltersStep;
