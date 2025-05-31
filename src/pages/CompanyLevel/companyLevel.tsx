import useCompanyLevel from "./useCompanyLevel";
import { FormProvider, useForm } from "react-hook-form";

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
    companyLevelAssign, // <-- add this
  } = useCompanyLevel();

  // Find the default levelId for the selected core parameter
  const defaultLevelId = companyLevelAssign?.data?.find(
    (item: CompanyLevelJunction) =>
      item.coreParameterId === selectedCoreParameters,
  )?.currentLevelId;

  return (
    <FormProvider {...methods}>
      <div className="w-full px-2 overflow-x-auto sm:px-4 py-4">
        <h1 className="font-semibold capitalize text-xl text-black mb-4">
          Company Level Assign
        </h1>
        <div className="flex justify-end">
          <button
            type="button"
            className="mt-4 mb-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Update"}
          </button>
        </div>

        <div className="flex gap-10">
          <div className="w-1/2 mt-2">
            <div>
              <h2 className="font-semibold mb-2">Select Core Parameter</h2>
              {coreParaOptions && coreParaOptions.length > 0 && (
                <div className="bg-white w-full">
                  <ul className="border rounded-lg overflow-hidden">
                    {coreParaOptions.map((option) => (
                      <li
                        key={option.value}
                        className={`flex items-center border-b last:border-0 py-1.5 px-1.5 pl-4 ${
                          selectedCoreParameters === option.value
                            ? "bg-blue-600 text-white"
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
                        if (
                          (selectedLevel === "" &&
                            defaultLevelId === level.levelId) ||
                          selectedLevel === level.levelId
                        ) {
                          // If no selection, default is blue. If selected, selected is blue.
                          liClass += " bg-blue-600 text-white";
                        } else if (
                          selectedLevel !== "" &&
                          defaultLevelId === level.levelId
                        ) {
                          // If user has selected a different level, default becomes gray.
                          liClass += " bg-gray-300 text-black";
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
