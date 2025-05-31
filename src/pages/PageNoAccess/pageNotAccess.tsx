import { ExclamationRoundIcon } from "@/components/shared/Icons";

export default function PageNotAccess() {
  return (
    <div className="h-full flex flex-col justify-center items-center text-center space-y-4 px-4">
      <div className="flex justify-center mb-5">
        <span className="block w-40 text-red-600">
          <ExclamationRoundIcon />
        </span>
      </div>
      <h2 className="text-2xl font-semibold">Unauthorized Access</h2>
      <p className="text-muted-foreground">
        You don't have permission to view this page.
      </p>
    </div>
  );
}
