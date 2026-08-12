
import { Button } from "@/components/ui/button";
import { 
  LayoutTemplate, 
  Plus, 
  Trash2, 
  Save, 
  Loader2,
  ShieldAlert,
  Search,
  Check,
  X,
  GripVertical,
  AlertTriangle
} from "lucide-react";

import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import ModalData from "@/components/shared/Modal/ModalData";

// Custom hook
import useBlueprint, { UISelectedCoreValue } from "./useBlueprint";

interface SortableCoreValueRowProps {
  cv: UISelectedCoreValue;
  handleRemoveCoreValue: (id: string) => void;
  canDeleteBlueprint: boolean;
  canEditBlueprint: boolean;
}

function SortableCoreValueRow({ cv, handleRemoveCoreValue, canDeleteBlueprint, canEditBlueprint }: SortableCoreValueRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: cv.CodeValueId
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 10 : 1,
    backgroundColor: isDragging ? "#f8fafc" : undefined
  };

  return (
    <tr 
      ref={setNodeRef}
      style={style}
      className={`border-b border-gray-200 hover:bg-slate-50/80 transition-colors ${isDragging ? "shadow-xs" : ""}`}
    >
      <td className="p-3 text-center align-top w-[40px]">
        {canEditBlueprint ? (
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-slate-100 transition-colors inline-flex items-center justify-center"
            title="Drag to reorder"
          >
            <GripVertical className="w-4 h-4" />
          </button>
        ) : (
          <span className="text-gray-300 inline-flex items-center justify-center p-1">
            <GripVertical className="w-4 h-4" />
          </span>
        )}
      </td>
      <td className="p-3 text-left font-semibold text-slate-800 align-top">
        {cv.coreValue}
      </td>
      <td className="p-3 text-left text-gray-700 leading-relaxed font-normal align-top">
        {cv.actionStatement || "-"}
      </td>
      <td className="p-3 text-center align-top w-[60px]">
        {canDeleteBlueprint && (
          <button
            type="button"
            onClick={() => handleRemoveCoreValue(cv.CodeValueId)}
            className="text-gray-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors"
            title="Remove core value"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </td>
    </tr>
  );
}

export default function MenuBlueprint() {
  const {
    hasBlueprintPermission,
    permission,
    isLoading,
    saveBlueprintMutation,
    handleSave,
    coreValuesMasterList,
    selectedCoreValues,
    showCoreValuesSelect,
    setShowCoreValuesSelect,
    coreValueSearchTerm,
    setCoreValueSearchTerm,
    coreValuePopoverRef,
    handleRemoveCoreValue,
    handleToggleCoreValue,
    sensors,
    handleDragEndCoreValues,
    whyChooseUs,
    setWhyChooseUs,
    whyConvenient,
    setWhyConvenient,
    blueprintRes,
    objectiveYears,
    getObjectiveYearLabel,
    handleAddObjectiveYear,
    handleRemoveObjectiveYear,
    objectiveUnits,
    handleObjectiveUnitChange,
    objectiveValues,
    handleObjectiveValueChange,
    subjectiveYears,
    getSubjectiveYearLabel,
    handleAddSubjectiveYear,
    handleRemoveSubjectiveYear,
    subjectives,
    handleAddSubjective,
    handleUpdateSubjectiveKey,
    handleUpdateSubjectiveUnit,
    handleSubjectiveValueChange,
    handleRemoveSubjective,
    deleteConfirmState,
    closeDeleteConfirmModal,
  } = useBlueprint();

  if (!hasBlueprintPermission) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-3">
        <ShieldAlert className="h-12 w-12 text-red-500" />
        <h3 className="text-lg font-bold text-gray-800">Access Denied</h3>
        <p className="text-sm text-gray-500">You do not have permission to access the Blueprint page.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-medium text-gray-500">Loading Blueprint Settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full px-4 sm:px-6 pt-0 pb-20 space-y-4 select-none">
      
      {/* Header Panel (Sticky Top) */}
      <div className="sticky top-0 z-30 flex items-center justify-between gap-3 py-4 bg-white/95 backdrop-blur-md border-b border-gray-200 shrink-0 -mx-4 sm:-mx-6 px-4 sm:px-6 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 text-primary rounded-lg">
            <LayoutTemplate className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">Blueprint</h1>
          </div>
        </div>
        {permission.Edit && (
          <Button 
            className="py-2 w-fit"
            onClick={handleSave}
            disabled={saveBlueprintMutation.isPending}
          >
            {saveBlueprintMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save 
          </Button>
        )}
      </div>

       {/* SECTION 1: Core Values */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Core Values</h2>
          
          {/* Custom Popover Dropdown Container */}
          <div className="relative" ref={coreValuePopoverRef}>
            {permission.Add && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCoreValuesSelect(!showCoreValuesSelect)}
                className="text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Core Value</span>
              </Button>
            )}

            {/* Custom Multi-Select Dropdown Popover */}
            {showCoreValuesSelect && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-3 space-y-3">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search core values..."
                    value={coreValueSearchTerm}
                    onChange={(e) => setCoreValueSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  {coreValueSearchTerm && (
                    <button
                      type="button"
                      onClick={() => setCoreValueSearchTerm("")}
                      className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Core Values Option List */}
                <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                  {coreValuesMasterList.filter((cv) => {
                    const title = cv.coreValue  || "";
                    return title.toLowerCase().includes(coreValueSearchTerm.toLowerCase());
                  }).length === 0 ? (
                    <p className="text-xs text-gray-400 italic py-2 text-center">No core values found</p>
                  ) : (
                    coreValuesMasterList
                      .filter((cv) => {
                        const title = cv.coreValue || "";
                        return title.toLowerCase().includes(coreValueSearchTerm.toLowerCase());
                      })
                      .map((cv) => {
                        const id = String(cv.CodeValueId || "");
                        const isSelected = selectedCoreValues.some(selected => selected.CodeValueId === id);
                        
                        return (
                          <div
                            key={id}
                            onClick={() => handleToggleCoreValue(id)}
                            className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer text-xs transition-colors ${
                              isSelected ? "bg-indigo-50/80 text-indigo-900 font-medium" : "hover:bg-gray-50 text-gray-700"
                            }`}
                          >
                            <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                              isSelected ? "bg-indigo-600 border-indigo-600 text-white" : "border-gray-300 bg-white"
                            }`}>
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold truncate">{cv.coreValue}</p>
                              {cv.actionStatement && (
                                <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">{cv.actionStatement}</p>
                              )}
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Table Format Display List with DnD Kit Reordering */}
        <div className="space-y-2 pt-1">
          {selectedCoreValues.length === 0 ? (
            <div className="border border-dashed border-gray-200 rounded-xl py-6 px-4 text-center">
              <p className="text-sm text-gray-400 italic">No core values selected. Click "+ Add Core Value" button above to select values.</p>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-xl overflow-hidden w-full shadow-xs">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEndCoreValues}
              >
                <table className="w-full border-collapse text-sm bg-white table-fixed">
                  <thead className="bg-slate-100 border-b border-gray-200">
                    <tr>
                      <th className="p-3 text-center font-semibold text-gray-700 h-[40px] w-[40px]"></th>
                      <th className="p-3 text-left font-semibold text-gray-700 h-[40px] w-[200px]">Core Value</th>
                      <th className="p-3 text-left font-semibold text-gray-700 h-[40px]">Action Statement / Definition</th>
                      <th className="p-3 text-center font-semibold text-gray-700 h-[40px] w-[60px]">Action</th>
                    </tr>
                  </thead>
                  <SortableContext
                    items={selectedCoreValues.map(cv => cv.CodeValueId)}
                    strategy={verticalListSortingStrategy}
                  >
                    <tbody>
                      {selectedCoreValues.map((cv) => (
                        <SortableCoreValueRow
                          key={cv.CodeValueId}
                          cv={cv}
                          handleRemoveCoreValue={handleRemoveCoreValue}
                          canDeleteBlueprint={permission.Delete}
                          canEditBlueprint={permission.Edit}
                        />
                      ))}
                    </tbody>
                  </SortableContext>
                </table>
              </DndContext>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: Mission */}
      <div className="space-y-4 pt-6 border-t border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Mission</h2>
        
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Column 1 */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 block">Why we exist ?</label>
              <textarea 
                rows={4}
                className="w-full border border-gray-200 rounded-xl p-3 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none resize-none text-sm text-gray-800 placeholder:text-gray-400 shadow-sm bg-white min-h-[120px] disabled:bg-gray-50/50" 
                placeholder="Explain why customers choose your products or services..." 
                value={whyChooseUs} 
                onChange={(e) => setWhyChooseUs(e.target.value)}
                readOnly={!permission.Edit}
                disabled={!permission.Edit}
              />
            </div>

            {/* Column 2 */}
            <div className="space-y-1.5 flex flex-col">
              <label className="text-sm font-semibold text-gray-700 block">Our USP</label>
              <textarea 
                rows={4}
                className="w-full flex-1 border border-gray-200 rounded-xl p-3 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none resize-none text-sm text-gray-800 placeholder:text-gray-400 shadow-sm bg-white min-h-[120px] disabled:bg-gray-50/50" 
                placeholder="Explain what differentiates us in the market..." 
                value={whyConvenient} 
                onChange={(e) => setWhyConvenient(e.target.value)}
                readOnly={!permission.Edit}
                disabled={!permission.Edit}
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Goal Values */}
      <div className="space-y-6 pt-6 border-t border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Goal Values</h2>

        {/* Objectives */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-800">Objectives</h3>
            {permission.Add && (
              <Button 
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddObjectiveYear}
                className="flex items-center gap-1.5 text-xs text-primary border-primary/20 hover:bg-indigo-50/50 rounded-xl"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Year Column
              </Button>
            )}
          </div>
          {!blueprintRes?.objectives || blueprintRes.objectives.length === 0 ? (
            <div className="border border-dashed border-gray-200 rounded-2xl py-8 px-4 text-center">
              <ShieldAlert className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No objectives loaded for this company.</p>
            </div>
          ) : (
            <div className="flex w-full gap-2 items-stretch">
              {/* Left Fixed Panel: Key & Unit */}
              <div className="w-[400px] shrink-0 min-w-[400px] border border-gray-200 rounded-xl overflow-hidden shadow-xs bg-white">
                <table className="w-full border-collapse text-sm bg-white table-fixed">
                  <thead className="bg-primary">
                    <tr className="h-[45px]">
                      <th className="p-3 text-left font-semibold text-white w-[300px]">Key</th>
                      <th className="p-3 text-center font-semibold text-white w-[100px] border-l border-white/20">Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blueprintRes.objectives.map((obj) => {
                      const title = obj.BlueprintGoalObjective?.title || obj.objectiveTitle || obj.title || "";
                      return (
                        <tr 
                          key={obj.companyBlueprintGoalId}
                          className="border-b border-gray-200 hover:bg-slate-50/80 transition-colors h-[58px]"
                        >
                          <td className="p-3 text-left font-semibold text-slate-800 truncate w-[300px]">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="truncate block cursor-default">{title}</span>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs bg-slate-900 text-white text-xs px-3 py-1.5 rounded-md shadow-md z-50">
                                  {title}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </td>
                          <td className="p-2 text-center w-[100px] border-l border-gray-100">
                            <input 
                              type="text" 
                              className="w-full h-[36px] text-center border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none rounded-md text-xs font-semibold text-gray-700 bg-slate-50/50 focus:bg-white transition-all shadow-sm mx-auto block disabled:bg-gray-50/50" 
                              placeholder="₹ / %" 
                              value={objectiveUnits[obj.companyBlueprintGoalId] || ""} 
                              onChange={(e) => handleObjectiveUnitChange(obj.companyBlueprintGoalId, e.target.value)}
                              readOnly={!permission.Edit}
                              disabled={!permission.Edit}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Right Scrollable Panel: Year Columns */}
              <div className="flex-1 min-w-0 overflow-x-auto border border-gray-200 rounded-xl shadow-xs bg-white pb-1">
                <table className="border-collapse text-sm bg-white table-fixed w-full min-w-max">
                  <thead className="bg-primary">
                    <tr className="h-[45px]">
                      {objectiveYears.map(yr => (
                        <th key={yr} className="p-3 text-center font-semibold text-white h-[45px] relative group w-[110px] min-w-[110px] max-w-[110px]">
                          <div className="flex items-center justify-center gap-1.5">
                            <span>{getObjectiveYearLabel(yr)}</span>
                            {permission.Delete && (
                              <button
                                type="button"
                                onClick={() => handleRemoveObjectiveYear(yr)}
                                className="text-white/60 hover:text-white rounded-full p-0.5 hover:bg-white/10 transition-colors"
                                title="Delete year column"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </th>
                      ))}
                      <th className="p-0 bg-primary h-[45px] w-auto"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {blueprintRes.objectives.map((obj) => (
                      <tr 
                        key={obj.companyBlueprintGoalId}
                        className="border-b border-gray-200 hover:bg-slate-50/80 transition-colors h-[58px] bg-white"
                      >
                        {objectiveYears.map(yr => {
                          const rawObjVal = objectiveValues[obj.companyBlueprintGoalId]?.[yr];
                          const displayObjVal = rawObjVal === "null" || rawObjVal === null || rawObjVal === undefined ? "" : rawObjVal;
                          return (
                            <td key={yr} className="p-2 text-center w-[110px] min-w-[110px] max-w-[110px]">
                              <input 
                                type="text"
                                className="w-[80px] h-[40px] text-center border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none rounded-md text-sm font-semibold text-gray-800 bg-white transition-all shadow-sm mx-auto block disabled:bg-gray-50/50"
                                placeholder="-"
                                value={displayObjVal}
                                onChange={(e) => handleObjectiveValueChange(obj.companyBlueprintGoalId, yr, e.target.value)}
                                readOnly={!permission.Edit}
                                disabled={!permission.Edit}
                              />
                            </td>
                          );
                        })}
                        <td className="p-0 border-b border-gray-200 bg-white w-auto"></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Subjectives */}
        <div className="space-y-4 pt-4 pb-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h3 className="text-base font-semibold text-gray-800">Subjectives</h3>
              {permission.Add && (
                <Button 
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddSubjective}
                  className="flex items-center gap-1.5 text-xs text-primary border-primary/20 hover:bg-indigo-50/50 rounded-xl"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Row
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {permission.Add && (
                <Button 
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddSubjectiveYear}
                  className="flex items-center gap-1.5 text-xs text-primary border-primary/20 hover:bg-indigo-50/50 rounded-xl"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Year Column
                </Button>
              )}
            </div>
          </div>
          <div className="flex w-full gap-2 items-stretch">
            {/* Left Fixed Panel: Key & Unit */}
            <div className="w-[400px] shrink-0 min-w-[400px] border border-gray-200 rounded-xl overflow-hidden shadow-xs bg-white">
              <table className="w-full border-collapse text-sm bg-white table-fixed">
                <thead className="bg-primary">
                  <tr className="h-[45px]">
                    <th className="p-3 text-left font-semibold text-white w-[300px]">Key</th>
                    <th className="p-3 text-center font-semibold text-white w-[100px] border-l border-white/20">Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {subjectives.length === 0 ? (
                    <tr className="h-[58px]">
                      <td colSpan={2} className="p-3 text-center text-gray-400 italic text-xs">
                        No subjectives
                      </td>
                    </tr>
                  ) : (
                    subjectives.map((row) => (
                      <tr 
                        key={row.id}
                        className="border-b border-gray-200 hover:bg-slate-50/80 transition-colors h-[58px]"
                      >
                        <td className="p-2 text-left w-[300px]">
                          <input 
                            type="text"
                            className="w-full h-[36px] px-2.5 border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none rounded-md text-xs font-semibold text-gray-800 bg-white transition-all shadow-sm block disabled:bg-gray-50/50"
                            placeholder="Enter Key..."
                            value={row.key}
                            onChange={(e) => handleUpdateSubjectiveKey(row.id!, e.target.value)}
                            readOnly={!permission.Edit}
                            disabled={!permission.Edit}
                          />
                        </td>
                        <td className="p-2 text-center w-[100px] border-l border-gray-100">
                          <input 
                            type="text" 
                            className="w-full h-[36px] text-center border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none rounded-md text-xs font-semibold text-gray-700 bg-slate-50/50 focus:bg-white transition-all shadow-sm mx-auto block disabled:bg-gray-50/50" 
                            placeholder="₹ / %" 
                            value={row.unit || ""} 
                            onChange={(e) => handleUpdateSubjectiveUnit(row.id!, e.target.value)}
                            readOnly={!permission.Edit}
                            disabled={!permission.Edit}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Right Scrollable Panel: Year Columns & Action */}
            <div className="flex-1 min-w-0 overflow-x-auto border border-gray-200 rounded-xl shadow-xs bg-white pb-1">
              <table className="border-collapse text-sm bg-white table-fixed w-full min-w-max">
                <thead className="bg-primary">
                  <tr className="h-[45px]">
                    {subjectiveYears.map(yr => (
                      <th key={yr} className="p-3 text-center font-semibold text-white h-[45px] relative group w-[110px] min-w-[110px] max-w-[110px]">
                        <div className="flex items-center justify-center gap-1.5">
                          <span>{getSubjectiveYearLabel(yr)}</span>
                          {permission.Delete && (
                            <button
                              type="button"
                              onClick={() => handleRemoveSubjectiveYear(yr)}
                              className="text-white/60 hover:text-white rounded-full p-0.5 hover:bg-white/10 transition-colors"
                              title="Delete year column"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </th>
                    ))}
                    <th className="p-3 text-center font-semibold text-white w-[70px] min-w-[70px] max-w-[70px] h-[45px]">Action</th>
                    <th className="p-0 bg-primary h-[45px] w-auto"></th>
                  </tr>
                </thead>
                <tbody>
                  {subjectives.length === 0 ? (
                    <tr className="h-[58px]">
                      <td colSpan={subjectiveYears.length + 2} className="p-6 text-center text-gray-400 italic text-xs">
                        Click "+ Add Row" above to define subjectives.
                      </td>
                    </tr>
                  ) : (
                    subjectives.map((row) => (
                      <tr 
                        key={row.id}
                        className="border-b border-gray-200 hover:bg-slate-50/50 transition-colors h-[58px]"
                      >
                        {subjectiveYears.map(yr => {
                          const rawSubVal = row.values?.[yr];
                          const displaySubVal = rawSubVal === "null" || rawSubVal === null || rawSubVal === undefined ? "" : rawSubVal;
                          return (
                            <td key={yr} className="p-2 text-center w-[110px] min-w-[110px] max-w-[110px]">
                              <input 
                                type="text" 
                                className="w-[80px] h-[40px] text-center border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none rounded-md text-sm font-semibold text-gray-800 bg-white transition-all shadow-sm mx-auto block disabled:bg-gray-50/50"
                                placeholder="-"
                                value={displaySubVal}
                                onChange={(e) => handleSubjectiveValueChange(row.id!, yr, e.target.value)}
                                readOnly={!permission.Edit}
                                disabled={!permission.Edit}
                              />
                            </td>
                          );
                        })}
                        <td className="p-2 text-center w-[70px] min-w-[70px] max-w-[70px]">
                          {permission.Delete && (
                            <button 
                              onClick={() => handleRemoveSubjective(row.id!)}
                              className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          )}
                        </td>
                        <td className="p-0 border-b border-gray-200 bg-white w-auto"></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal using project's ModalData component */}
      <ModalData
        isModalOpen={deleteConfirmState.isOpen}
        modalTitle={deleteConfirmState.title || "Confirm Delete"}
        modalClose={closeDeleteConfirmModal}
        containerClass="min-w-[340px] max-w-[440px] min-h-0"
        buttons={[
          {
            btnText: "Cancel",
            buttonCss: "py-1.5 px-5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50",
            btnClick: closeDeleteConfirmModal,
          },
          {
            btnText: "Delete",
            buttonCss: "py-1.5 px-5 bg-red-600 border border-red-600 text-white font-semibold hover:bg-red-700",
            btnClick: () => {
              deleteConfirmState.onConfirm();
              closeDeleteConfirmModal();
            },
          },
        ]}
      >
        <div className="flex items-start gap-3 py-2">
          <div className="p-2.5 bg-red-100 text-red-600 rounded-full shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm text-gray-700 leading-relaxed font-medium">
              {deleteConfirmState.description}
            </p>
          </div>
        </div>
      </ModalData>

    </div>
  );
}
