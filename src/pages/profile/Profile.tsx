import { useSelector } from "react-redux";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import userDummy from "../../../public/userDummy.jpg";
import { getUserDetail } from "@/features/selectors/auth.selector";
import { capitalizeFirstLetter } from "@/features/utils/app.utils";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { useEffect, useState } from "react";
import useAddOrUpdateEmployee from "@/features/api/companyEmployee/useAddEmployee";
import FormImage from "@/components/shared/Form/FormImage/FormImage";
import { imageUploadMutation } from "@/features/api/file";
import { Input } from "@/components/ui/input";

export default function Profile() {
  const { setBreadcrumbs } = useBreadcrumbs();
  const { mutate: addEmployee } = useAddOrUpdateEmployee();
  const { mutateAsync: uploadImage } = imageUploadMutation();

  const profileData = useSelector(getUserDetail);

  const [isEdit, setIsEdit] = useState(false);

  const [formData, setFormData] = useState({
    employeeName: "",
    employeeMobile: "",
    employeeEmail: "",
    photoPreview: "", // base64 string
  });

  useEffect(() => {
    setBreadcrumbs([{ label: "User Profile", href: "" }]);
  }, [setBreadcrumbs]);

  useEffect(() => {
    if (profileData) {
      setFormData({
        employeeName: profileData.employeeName || "",
        employeeMobile: profileData.employeeMobile || "",
        employeeEmail: profileData.employeeEmail || "",
        photoPreview: profileData.photo || "",
      });
    }
  }, [profileData]);

  const hideEditProfile =
    profileData?.employeeType === "CONSULTANT" ||
    profileData?.employeeType === "SAHAY TEAMMATE" ||
    profileData?.role === "CONSULTANT" ||
    profileData?.role === "SAHAY TEAMMATE";

  const base64ToFile = (base64: string) => {
    const arr = base64.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], "profile.png", { type: mime });
  };

  const onSave = async () => {
    let mobile = formData.employeeMobile || "";
    if (!mobile.startsWith("+91")) mobile = "+91" + mobile;

    addEmployee(
      {
        employeeId: profileData?.employeeId,
        employeeName: formData.employeeName,
        employeeEmail: formData.employeeEmail,
        employeeMobile: mobile,
      },
      {
        onSuccess: async (res) => {
          // ✅ Get the employeeId from response
          const employeeId =
            res?.data?.employeeId ||
            (Array.isArray(res) ? res[0]?.employeeId : undefined);

          // ✅ Only after addEmployee succeeds, upload image if present
          if (employeeId && formData.photoPreview?.startsWith("data:")) {
            const fd = new FormData();
            fd.append("refId", employeeId);
            fd.append("fileType", "1010");
            fd.append("isMaster", "1");
            fd.append("isUpdate", "1");
            fd.append("file", base64ToFile(formData.photoPreview));

            await uploadImage(fd); // 🔹 Called only after addEmployee success
          }

          // ✅ Reload page after both operations succeed
          window.location.reload();
        },
      },
    );
  };

  return (
    <>
      {/* 🔹 Buttons */}
      <div className="w-full p-4 flex justify-end gap-2">
        {!hideEditProfile && !isEdit && (
          <Button onClick={() => setIsEdit(true)}>Edit Profile</Button>
        )}
        {isEdit && (
          <>
            <Button onClick={onSave}>Save</Button>
            <Button variant="outline" onClick={() => setIsEdit(false)}>
              Cancel
            </Button>
          </>
        )}
      </div>

      <div className="w-full flex">
        {/* 🔹 Image Section */}
        <div className="w-1/3 bg-white flex flex-col items-center p-8">
          <div
            className={`w-56 h-56 overflow-hidden shadow-lg ring-4 ring-white mb-4 mt-8 ${
              isEdit ? "w-80 h-70" : "rounded-full"
            }`}
          >
            {!isEdit ? (
              <img
                src={profileData?.photo || userDummy}
                alt="profile"
                className="w-full h-full object-contain bg-white"
              />
            ) : (
              <FormImage
                label="Upload Profile"
                value={formData.photoPreview}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    photoPreview: val,
                  }))
                }
              />
            )}
          </div>
        </div>

        {/* 🔹 Details */}
        <div className="w-2/3 overflow-y-auto p-8">
          <Card className="w-full border-0 shadow-none">
            <div className="flex flex-col divide-y">
              <ProfileRow
                label="Name"
                isEdit={isEdit}
                value={formData.employeeName}
                onChange={(e) =>
                  setFormData({ ...formData, employeeName: e.target.value })
                }
              />

              <ProfileRow
                label="Mobile No"
                isEdit={isEdit}
                value={formData.employeeMobile}
                onChange={(e) =>
                  setFormData({ ...formData, employeeMobile: e.target.value })
                }
              />

              <ProfileRow
                label="Email"
                isEdit={isEdit}
                value={formData.employeeEmail}
                onChange={(e) =>
                  setFormData({ ...formData, employeeEmail: e.target.value })
                }
              />
              <StaticRow
                label="Employee Type"
                value={
                  profileData?.role ||
                  capitalizeFirstLetter(profileData?.employeeType || "")
                }
              />

              {profileData?.reportingManager && (
                <>
                  <StaticRow
                    label="Reporting Manager"
                    value={profileData.reportingManager.employeeName}
                  />
                  <StaticRow
                    label="Reporting Manager Email"
                    value={profileData.reportingManager.employeeEmail}
                  />
                </>
              )}

              <StaticRow
                label="Company Name"
                value={profileData?.company?.companyName}
              />
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

/* ---------------- ROW COMPONENTS ---------------- */

interface ProfileRowProps {
  label: string;
  isEdit: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function ProfileRow({ label, isEdit, value, onChange }: ProfileRowProps) {
  return (
    <div className="flex justify-between px-6 py-6 bg-white">
      <p className="text-sm text-muted-foreground">{label}</p>
      {isEdit ? (
        <Input
          className="w-2/3 text-right border border-gray-200 rounded px-3 py-2"
          value={value}
          onChange={onChange}
        />
      ) : (
        <p className="font-medium w-2/3 text-right">{value}</p>
      )}
    </div>
  );
}

function StaticRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between px-6 py-6 bg-white">
      <p className="text-sm text-muted-foreground w-1/3">{label}</p>
      <p className="font-medium w-2/3 text-right">{value}</p>
    </div>
  );
}
