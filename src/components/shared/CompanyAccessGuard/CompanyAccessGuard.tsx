import React, { ReactNode } from "react";
import { useSelector } from "react-redux";
import { getCompaniesList } from "@/features/selectors/company.selector";
import { Button } from "@/components/ui/button";

interface CompanyAccessGuardProps {
  companyId?: string | null;
  isLoading?: boolean;
  children: ReactNode;
}

const CompanyAccessGuard: React.FC<CompanyAccessGuardProps> = ({
  companyId,
  isLoading,
  children,
}) => {
  const companiesList = useSelector(getCompaniesList);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-white min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700" />
      </div>
    );
  }

  if (!companyId) {
    return <>{children}</>;
  }

  const currentCompany = companiesList?.find((c) => c.isCurrentCompany);
  const isAuthorized = companyId === currentCompany?.companyId;

  if (!isAuthorized) {
    const hasMultipleCompanies = (companiesList?.length ?? 0) > 1;

    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 bg-white w-full py-10 rounded-md shadow-sm border border-gray-100 m-4 min-h-[400px]">
        <div className="text-xl font-semibold text-gray-800">
          {hasMultipleCompanies
            ? "This item is not in this company. Please switch company."
            : "You do not have permission to view this item."}
        </div>
        {hasMultipleCompanies && (
          <Button
            onClick={() =>
              document.getElementById("switch-company-btn")?.click()
            }
          >
            Switch Company
          </Button>
        )}
      </div>
    );
  }

  return <>{children}</>;
};

export default CompanyAccessGuard;
