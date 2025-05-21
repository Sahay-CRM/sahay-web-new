import { Card } from "@/components/ui/card";
import { useAuth } from "@/features/auth/useAuth";
import { baseUrl } from "@/features/utils/urls.utils";
import { useEffect, useState } from "react";

export default function Profile() {
  const { user } = useAuth();
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

  useEffect(() => {
    if (!user) return;

    setUserDetails({
      photo:
        user.role === "COMPANYADMIN" ||
        user.role === "EMPLOYEE" ||
        user.role === "CONSULTANT"
          ? null
          : (user.photo ?? null), // convert undefined to null
      userName:
        user.role === "COMPANYADMIN" || user.role === "EMPLOYEE"
          ? (user.employeeName ?? "")
          : user.role === "CONSULTANT"
            ? (user.consultantName ?? "")
            : (user.adminUserName ?? ""),
      userMobile:
        user.role === "COMPANYADMIN" || user.role === "EMPLOYEE"
          ? (user.employeeMobile ?? "")
          : user.role === "CONSULTANT"
            ? (user.consultantMobile ?? "")
            : (user.adminUserMobile ?? ""),
      userEmail:
        user.role === "COMPANYADMIN" || user.role === "EMPLOYEE"
          ? (user.employeeEmail ?? "")
          : user.role === "CONSULTANT"
            ? (user.consultantEmail ?? "")
            : (user.adminUserEmail ?? ""),
      role: user.role ?? "",
    });
  }, [user]);

  const details = userDetails
    ? [
        { label: "Name", value: userDetails.userName },
        { label: "Position", value: userDetails.role.toLowerCase() },
        { label: "Mobile No", value: userDetails.userMobile },
        { label: "Email", value: userDetails.userEmail },
        { label: "Followers", value: "64" },
        { label: "Following", value: "326" },
      ]
    : [];

  return (
    <div className="w-full h-full flex">
      {/* Left Side - Image + Name */}
      <div className="w-1/3 bg-white h-auto text-primary flex flex-col items-center p-8">
        <div className="w-56 h-56 rounded-full overflow-hidden shadow-lg ring-4 ring-white mb-4 mt-8">
          {userDetails?.photo ? (
            <img
              src={`${baseUrl}/share/profilePics/${user?.photo}`}
              alt="Profile"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center text-5xl font-bold text-primary">
              {userDetails?.userName?.[0] || "U"}
            </div>
          )}
        </div>
        <p className="text-2xl font-semibold text-primary">
          {userDetails?.userName}
        </p>
      </div>

      {/* Right Side - Detail Card */}
      <div className="w-2/3 overflow-y-auto p-8">
        <Card className="w-full border-0 shadow-none">
          <div className="flex flex-col divide-y">
            {details.map((item, index) => (
              <div
                key={index}
                className={`flex justify-between px-6 py-6 ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-100"
                }`}
              >
                <p className="text-sm text-muted-foreground w-1/3">
                  {item.label}
                </p>
                <p className="font-medium w-2/3 text-right">{item.value}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
