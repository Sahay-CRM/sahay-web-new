// import Api from "@/features/utils/api.utils";
// import Urls from "@/features/utils/urls.utils";
// import { useQuery } from "@tanstack/react-query";

// export default function useGetKpiVisualizeData(data) {
//   const query = useQuery({
//     queryKey: ["get-kpi-visualize-data", data],
//     queryFn: async () => {
//       const response = await Api.post<{ data: FrequencyData[] }>({
//         url: Urls.getKpiVisualize(),
//         data: data,
//       });
//       return response.data;
//     },
//     enabled: !!data,
//     staleTime: 0,
//   });

//   return query;
// }
