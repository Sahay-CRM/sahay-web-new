// import Api from "@/features/utils/api.utils";
// import Urls from "@/features/utils/urls.utils";
// import { queryClient } from "@/queryClient";
// import { useMutation } from "@tanstack/react-query";
// import { AxiosError } from "axios";
// import { toast } from "sonner";

// type DatePaging = BaseResponse<CompanyProjectDataProps>;

// export default function useAddUpdateCompanyProject() {
//   const addUpdateCompanyProjectMutation = useMutation({
//     mutationKey: ["add-or-update-project-list"],
//     mutationFn: async (data: CompanyProjectDataProps) => {
//       const isUpdate = Boolean(data.projectId);
//       const payload = {
//         projectName: data?.projectName || "",
//         projectDescription: data?.projectDescription || "",
//         projectDeadline: data?.projectDeadline || "",
//         projectStatusId: data?.projectStatusId?.projectStatusId || "",
//         subParameterIds:
//           data?.subParameterId?.map((ele) => ele?.subParameterId) || "",
//         otherProjectEmployees:
//           data?.employeeId?.map((ele) => ele?.employeeId) || "",
//       };
//       const config = {
//         url: isUpdate
//           ? Urls.updateCompanyProject(data.projectId!)
//           : Urls.addCompanyProject(),
//         data: payload,
//       };

//       const { data: resData } = isUpdate
//         ? await Api.put<DatePaging>(config)
//         : await Api.post<DatePaging>(config);

//       return resData;
//     },
//     onSuccess: (res) => {
//       toast.success(res.message || "Operation successful");
//       queryClient.resetQueries({ queryKey: ["get-project-list"] });
//       queryClient.resetQueries({ queryKey: ["get-project-by-id"] });
//     },
//     onError: (error: AxiosError<{ message?: string }>) => {
//       toast.error(error.response?.data?.message);
//     },
//   });
//   return addUpdateCompanyProjectMutation;
// }

import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

type DatePaging = BaseResponse<CompanyProjectDataProps>;

// Utility to clean undefined, null, empty string, and empty array values
interface CleanPayloadInput {
  [key: string]: unknown;
}

interface CleanPayloadOutput {
  [key: string]: unknown;
}

const cleanPayload = (obj: CleanPayloadInput): CleanPayloadOutput =>
  Object.fromEntries(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.entries(obj).filter(([_, v]) => {
      if (Array.isArray(v)) return v.length > 0;
      return v !== undefined && v !== null && v !== "";
    }),
  );

export default function useAddUpdateCompanyProject() {
  const addUpdateCompanyProjectMutation = useMutation({
    mutationKey: ["add-or-update-project-list"],
    mutationFn: async (data: CompanyProjectDataProps) => {
      const isUpdate = Boolean(data.projectId);

      // Build the raw payload
      const rawPayload = {
        projectName: data?.projectName,
        projectDescription: data?.projectDescription,
        projectDeadline: data?.projectDeadline,
        projectStatusId: data?.projectStatusId,
        subParameterIds: data?.subParameterId?.map(
          (ele) => ele?.subParameterId,
        ),
        otherProjectEmployees: data?.employeeId,
      };

      // Clean the payload
      const payload = cleanPayload(rawPayload);

      // Determine API config
      const config = {
        url: isUpdate
          ? Urls.updateCompanyProject(data.projectId!)
          : Urls.addCompanyProject(),
        data: payload,
      };

      // Send request
      const { data: resData } = isUpdate
        ? await Api.put<DatePaging>(config)
        : await Api.post<DatePaging>(config);

      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Operation successful");
      queryClient.resetQueries({ queryKey: ["get-project-list"] });
      queryClient.resetQueries({ queryKey: ["get-project-by-id"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Something went wrong");
    },
  });

  return addUpdateCompanyProjectMutation;
}
