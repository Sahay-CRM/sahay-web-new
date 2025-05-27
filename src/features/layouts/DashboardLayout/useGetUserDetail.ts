// import Api from "@/features/utils/api.utils";
// import Urls from "@/features/utils/urls.utils";
// import { useQuery } from "@tanstack/react-query";

// export default function useGetUserDetail(userId: string) {
//   const query = useQuery({
//     queryKey: ["userDetails", userId],
//     queryFn: async () => {
//       const { data: resData } = await Api.post<{ data: UserData }>({
//         url: Urls.getUserById(userId),
//       });
//       return resData.data;
//     },
//     enabled: !!userId,
//   });
//   return query;
// }
