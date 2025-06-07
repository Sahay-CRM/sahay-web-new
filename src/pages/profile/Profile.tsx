import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { Card } from "@/components/ui/card";
import { baseUrl } from "@/features/utils/urls.utils";
import userDummy from "@/assets/userDummy.jpg";
import { Button } from "@/components/ui/button";
import useGetEmployeeById from "@/features/api/companyEmployee/useEmployeeById";

import { getUserId } from "@/features/selectors/auth.selector";

export default function Profile() {
  const userId = useSelector(getUserId);
  const navigate = useNavigate();

  const { data: profileData } = useGetEmployeeById(userId);

  const details = profileData?.data
    ? [
        { label: "Name", value: profileData?.data?.employeeName },
        { label: "Position", value: "Admin" },
        { label: "Mobile No", value: profileData?.data?.employeeMobile },
        { label: "Email", value: profileData?.data?.employeeEmail },
        {
          label: "Reporting Manager",
          value: profileData?.data?.reportingManager.employeeName,
        },
        {
          label: "Reporting Manager Email",
          value: profileData?.data?.reportingManager.employeeEmail,
        },
        {
          label: "Company Name",
          value: profileData?.data?.company.companyName,
        },
      ]
    : [];

  return (
    <>
      <div className="w-full flex justify-end mt-4">
        <Button
          onClick={() => {
            navigate(
              `/dashboard/employees/edit/${profileData?.data?.employeeId}`,
            );
          }}
        >
          Edit Profile
        </Button>
      </div>
      <div className="w-full h-full flex">
        {/* Left Side - Image + Name */}
        <div className="w-1/3 bg-white h-auto text-primary flex flex-col items-center p-8">
          <div className="w-56 h-56 rounded-full overflow-hidden shadow-lg ring-4 ring-white mb-4 mt-8">
            {profileData?.data?.photo ? (
              <img
                src={`${baseUrl}/share/profilePics/${profileData?.data?.photo}`}
                alt="Profile"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <img
                src={userDummy}
                alt="Profile"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            )}
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
