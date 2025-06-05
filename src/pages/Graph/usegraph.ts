import useGetHealthScore from "@/features/api/healthDashboard/getHealthScore";

// Make paginationFilter optional and default to an empty object
interface UseGraphProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  paginationFilter?: any;
}

export default function useGraph({
  paginationFilter = {},
}: UseGraphProps = {}) {
  const { data } = useGetHealthScore({
    filter: paginationFilter,
  });

  return {
    data,
  };
}
