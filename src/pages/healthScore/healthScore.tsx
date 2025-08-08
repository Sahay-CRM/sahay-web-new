import { FormProvider, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import useHealthScore from "./useHealthScore";
import ScoreDataTable from "@/components/shared/DataTable/HealthScore/ScoreDataTable";
import FormSelect from "@/components/shared/Form/FormSelect";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { useEffect } from "react";
import PageNotAccess from "../PageNoAccess";

export default function HealthScoreList() {
  const {
    formMethods,
    isEditing,
    handleEditToggle,
    handleCancel,
    scores,
    setScores,
    coreParams,
    coreParameterId,
    healthScoreList,
    permission,
    companyLevel,
    levelId,
  } = useHealthScore();

  const { control } = formMethods;

  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([{ label: "Health Score", href: "" }]);
  }, [setBreadcrumbs]);

  const isCoreSelected = !!coreParameterId;

  if (permission && permission.View === false) {
    return <PageNotAccess />;
  }

  return (
    <FormProvider {...formMethods}>
      <div className="w-full px-2 overflow-x-auto sm:px-4 py-6">
        <div className="flex mb-5 justify-between items-center">
          <h1 className="font-semibold capitalize text-xl text-black">
            Health Score
          </h1>
          <div className="flex items-center space-x-5 tb:space-x-7">
            {(permission.Add || permission.Edit) && (
              <Button className="py-2 w-fit" onClick={handleEditToggle}>
                {isEditing ? "Submit" : "Edit"}
              </Button>
            )}

            {isEditing && (
              <Button
                variant="outline"
                className="py-2 w-fit"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-10">
          <Controller
            control={control}
            name="coreParameterId"
            render={({ field }) => (
              <FormSelect
                {...field}
                label="Business Function"
                options={
                  coreParams?.data.map((param) => ({
                    label: param.coreParameterName,
                    value: param.coreParameterId, // 👈 corrected value for fetch
                  })) ?? []
                }
                placeholder="Select Business Function"
              />
            )}
          />
          {isCoreSelected && (
            <div className="mb-4">
              <Controller
                control={control}
                name="levelId"
                render={({ field }) => (
                  <FormSelect
                    {...field}
                    label="Level"
                    options={
                      companyLevel?.data?.map((level: CompanyLevelRes) => ({
                        label: level.levelName,
                        value: level.levelId,
                      })) ?? []
                    }
                    placeholder="Select Level"
                  />
                )}
              />
            </div>
          )}
        </div>

        {/* Score Table or No Data */}
        {isCoreSelected && levelId && healthScoreList ? (
          healthScoreList?.length == 0 ? (
            <div className="text-center text-muted-foreground mt-8">
              No data found
            </div>
          ) : (
            <ScoreDataTable
              data={scores}
              onChange={setScores}
              disabled={!isEditing}
              mode="percent"
              showSwitch={false}
            />
          )
        ) : (
          <div className="text-center text-muted-foreground mt-8">
            Please select a Business Function to view scores
          </div>
        )}
      </div>
    </FormProvider>
  );
}
