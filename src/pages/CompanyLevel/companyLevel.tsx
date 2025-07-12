import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import useCompanyLevel from "./useCompanyLevel";
import { FormProvider, useForm } from "react-hook-form";
import { useEffect } from "react";
import PageNotAccess from "../PageNoAccess";

export default function CompanyLevelAssign() {
  const methods = useForm();

  const {
    coreParaOptions,
    handleCorePara,
    selectedCoreParameters,
    handleSave,
    setSubParaAssignments,
    isSaving,
    allLevel,
    selectedLevel,
    handleLevelSelect,
    permission,
    companyLevelAssign,
    handleCancel,
    hasUnsavedChanges,
  } = useCompanyLevel();

  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([{ label: "Company Level", href: "" }]);
  }, [setBreadcrumbs]);

  // Find the default levelId for the selected Business Function
  const defaultLevelId = companyLevelAssign?.data?.find(
    (item: CompanyLevelJunction) =>
      item.coreParameterId === selectedCoreParameters,
  )?.currentLevelId;

  if (permission && permission.View === false) {
    return <PageNotAccess />;
  }

  return (
    <FormProvider {...methods}>
      <div className="w-full px-2 overflow-x-auto sm:px-4 py-4">
        <div className="flex justify-between h-[65px] overflow-hidden">
          <h1 className="font-semibold capitalize text-xl text-black mb-4">
            Company Level Assign
          </h1>
          <div className="flex justify-end">
            {hasUnsavedChanges && (
              <>
                {(permission.Add || permission.Edit) && (
                  <button
                    type="button"
                    className="mt-4 mb-2 px-4 py-1 bg-primary text-white rounded hover:bg-primary-dark disabled:bg-primary/50 disabled:cursor-not-allowed"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Update"}
                  </button>
                )}
                {(permission.Add || permission.Edit) && (
                  <button
                    type="button"
                    className="mt-4 mb-2 ml-2 px-4 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-500/50 disabled:cursor-not-allowed"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex gap-10">
          <div className="w-1/2 mt-2">
            <div>
              <h2 className="font-semibold mb-2">Select Business Function</h2>
              {coreParaOptions && coreParaOptions.length > 0 && (
                <div className="bg-white w-full">
                  <ul className="border rounded-lg overflow-hidden">
                    {coreParaOptions.map((option) => (
                      <li
                        key={option.value}
                        className={`flex items-center border-b last:border-0 py-1.5 px-1.5 pl-4 ${
                          selectedCoreParameters === option.value
                            ? "bg-primary text-white"
                            : ""
                        } cursor-pointer`}
                        onClick={() => {
                          handleCorePara(option.value);
                          setSubParaAssignments({});
                        }}
                      >
                        {option.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="w-1/2 mt-2">
            {selectedCoreParameters && (
              <div className="mt-4">
                <h2 className="font-semibold mb-2">Select Level</h2>
                {allLevel?.data && allLevel.data.length > 0 && (
                  <div className="bg-white w-full">
                    <ul className="border rounded-lg overflow-hidden">
                      {allLevel.data.map((level) => {
                        // Determine style for each level
                        let liClass =
                          "flex items-center border-b last:border-0 py-1.5 px-1.5 pl-4 cursor-pointer";

                        // Apply style for the original default from the database if it's NOT the currently selected one
                        if (
                          defaultLevelId === level.levelId &&
                          selectedLevel !== level.levelId
                        ) {
                          liClass += " bg-gray-500 text-white";
                        }

                        // Always apply style for the currently selected level by the user (this overrides if it's also the default)
                        if (selectedLevel === level.levelId) {
                          liClass += " bg-primary text-white";
                        }

                        return (
                          <li
                            key={level.levelId}
                            className={liClass}
                            onClick={() => {
                              if (level.levelId) {
                                handleLevelSelect(level.levelId);
                              }
                            }}
                          >
                            {level.levelName}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </FormProvider>
  );
}
