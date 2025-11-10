import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import userDummy from "../../../public/user1.png";
import { getUserDetail } from "@/features/selectors/auth.selector";
import { capitalizeFirstLetter } from "@/features/utils/app.utils";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { useEffect } from "react";

export default function Profile() {
  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([{ label: "User Profile", href: "" }]);
  }, [setBreadcrumbs]);
  const navigate = useNavigate();

  const profileData = useSelector(getUserDetail);

  // Hide Edit Profile button for CONSULTANT or SAHAY TEAMMATE
  const hideEditProfile =
    profileData?.employeeType === "CONSULTANT" ||
    profileData?.employeeType === "SAHAY TEAMMATE" ||
    profileData?.role === "CONSULTANT" ||
    profileData?.role === "SAHAY TEAMMATE";

  const details = profileData
    ? [
        { label: "Name", value: profileData?.employeeName },
        { label: "Position", value: "Admin" },
        {
          label: "Employee Type",
          value:
            profileData?.role ||
            capitalizeFirstLetter(profileData?.employeeType || ""),
        },
        { label: "Mobile No", value: profileData?.employeeMobile },
        { label: "Email", value: profileData?.employeeEmail },
        // Only show Reporting Manager fields if present
        ...(profileData?.reportingManager
          ? [
              {
                label: "Reporting Manager",
                value: profileData?.reportingManager?.employeeName,
              },
              {
                label: "Reporting Manager Email",
                value: profileData?.reportingManager?.employeeEmail,
              },
            ]
          : []),
        {
          label: "Company Name",
          value: profileData?.company?.companyName,
        },
      ]
    : [];

  return (
    <>
      <div className="w-full flex justify-end mt-4">
        {!hideEditProfile && (
          <Button
            onClick={() => {
              navigate(`/dashboard/employees/edit/${profileData?.employeeId}`);
            }}
          >
            Edit Profile
          </Button>
        )}
      </div>
      <div className="w-full h-full flex">
        {/* Left Side - Image + Name */}
        <div className="w-1/3 bg-white h-auto relative text-primary flex flex-col items-center p-8">
          <div className="w-56 h-56 rounded-full overflow-hidden shadow-lg ring-4 ring-white mb-4 mt-8">
            <img
              src={profileData?.photo ? profileData?.photo : userDummy}
              alt="profile"
              className="w-full rounded-full object-contain bg-black"
            />
          </div>
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
    </>
  );
}
