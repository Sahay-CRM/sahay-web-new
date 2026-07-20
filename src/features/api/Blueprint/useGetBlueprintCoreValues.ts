import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

interface CoreValueMasterItem {
  CodeValueId: string;
  coreValue: string;
  actionStatement: string;
  isActive: boolean;
}

type CoreValuesRes = {
  success: boolean;
  status?: number;
  message?: string;
  data: CoreValueMasterItem[];
};

export default function useGetBlueprintCoreValues(companyId?: string) {
  const query = useQuery({
    queryKey: ["get-blueprint-core-values-master", companyId],
    queryFn: async () => {
      const { data: resData } = await Api.post<CoreValuesRes>({
        url: Urls.blueprintCoreValueGetAll(),
        data: {
          search: "",
          isActive: true,
          companyId
        }
      });
      return resData;
    },
  });
  return query;
}
