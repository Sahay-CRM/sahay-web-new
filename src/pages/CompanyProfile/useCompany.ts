import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import {
  addCompanyMutation,
  useGetCityDropdown,
  useGetCompanyId,
  useGetCountryDropdown,
  useGetIndustryDropdown,
  useGetStateDropdown,
} from "@/features/api/CompanyProfile";
import { getUserPermission } from "@/features/selectors/auth.selector";
import { useForm } from "react-hook-form";
import { ImageBaseURL } from "@/features/utils/urls.utils";
import { imageUploadMutation } from "@/features/api/file";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import {
  deleteHolidayMutation,
  getholidayDropdown,
} from "@/features/api/Holiday";

export default function useCompany() {
  const permission = useSelector(getUserPermission).COMPANY_PROFILE;

  const [isIndSearch, setIsIndSearch] = useState("");
  const [isCountrySearch, setIsCountrySearch] = useState("");
  const [isStateSearch, setIsStateSearch] = useState("");
  const [isCitySearch, setIsCitySearch] = useState("");

  const [middlePercent, setMiddlePercent] = useState<number | null>(null);
  const { setBreadcrumbs } = useBreadcrumbs();
  useEffect(() => {
    setBreadcrumbs([{ label: "Company Profile", href: "" }]);
  }, [setBreadcrumbs]);

  const { mutate: addCompany } = addCompanyMutation();
  const { mutate: uploadImage } = imageUploadMutation();
  const { data: companyData } = useGetCompanyId();
  const { data: industryList } = useGetIndustryDropdown({
    filter: {
      search: isIndSearch.length >= 3 ? isIndSearch : undefined,
    },
    enable: isIndSearch.length >= 3,
  });
  const { data: countryList } = useGetCountryDropdown({
    filter: {
      search: isCountrySearch.length >= 3 ? isCountrySearch : undefined,
    },
    enable: isCountrySearch.length >= 3,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isLogoCropOpen, setIsLogoCropOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<HolidaysDataProps | null>(null);
  const { data: holidayData } = getholidayDropdown({
    filter: {},
  });

  const { mutate: deleteHoli } = deleteHolidayMutation();
  const handleAdd = () => {
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setModalData(null);
  };

  const handleEdit = (data: HolidaysDataProps) => {
    setIsModalOpen(true);
    setModalData(data);
  };
  const handleDelete = (id: string) => {
    deleteHoli(id);
  };

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
    watch,
    reset,
  } = useForm<SimpleCompanyDetails>();

  useEffect(() => {
    if (companyData) {
      const rawSkipDays = companyData.kpiSkipDays as
        | string
        | string[]
        | undefined;

      const skipDaysValue = Array.isArray(rawSkipDays)
        ? rawSkipDays
        : rawSkipDays
          ? rawSkipDays.split(",")
          : [];

      reset({
        companyId: companyData.companyId,
        companyName: companyData.companyName,
        annualTurnOver: companyData.annualTurnOver,
        businessStartDate: companyData.businessStartDate?.split("T")[0],
        companyAddress: companyData.companyAddress,
        companyAdminEmail: companyData.companyAdminEmail,
        companyAdminName: companyData.companyAdminName,
        companyAdminMobile: companyData.companyAdminMobile,
        companyBillingName: companyData.companyBillingName,
        companyGst: companyData.companyGst,
        companyMobile: companyData.companyMobile?.replace("+91", ""),
        companyWebsite: companyData.companyWebsite,
        accountPOC: companyData.accountPOC,
        accountsPocEmail: companyData.accountsPocEmail,
        pancardNumber: companyData.pancardNumber,
        industryId: companyData.Industry?.industryId,
        cityId: companyData.cityId,
        stateId: companyData.stateId,
        validationKey: companyData.validationKey,
        countryId: companyData.countryId,
        engagementTypeId: companyData.engagementTypeId,
        accountPocMobile: companyData.companyMobile?.replace("+91", ""),
        gstCertificate: companyData?.gstCertificate
          ? `${ImageBaseURL}/share/company/gst/${companyData.gstCertificate}`
          : "",

        logo: companyData?.logo
          ? `${ImageBaseURL}/share/company/logo/${companyData.logo}`
          : "",
        pan: companyData?.pancard
          ? `${ImageBaseURL}/share/company/pancard/${companyData.pancard}`
          : "",
        kpiSkipDays: skipDaysValue,
      });
    }
  }, [companyData, reset]);

  const watchedCountryId = watch("countryId");
  const watchedStateId = watch("stateId");

  const { data: stateList } = useGetStateDropdown({
    filter: {
      countryId: watchedCountryId,
      search: isStateSearch.length >= 3 ? isStateSearch : undefined,
    },
    enable: isStateSearch.length >= 3 && !watchedCountryId,
  });
  const { data: cityList } = useGetCityDropdown({
    filter: {
      stateId: watchedStateId,
      search: isCitySearch.length >= 3 ? isCitySearch : undefined,
    },
    enable: isCitySearch.length >= 3 && !watchedStateId,
  });

  const industryOptions = (industryList?.data ?? []).map((item) => ({
    label: item.industryName,
    value: item.industryId,
  }));

  const countryOptions = (countryList?.data ?? []).map((item) => ({
    label: item.countryName,
    value: item.countryId,
  }));

  const stateOptions = (stateList?.data ?? []).map((item) => ({
    label: item.stateName,
    value: item.stateId,
  }));
  const cityOptions = (cityList?.data ?? []).map((item) => ({
    label: item.cityName,
    value: item.cityId,
  }));

  const skipDaysOption = [
    { label: "Sun", value: "0" },
    { label: "Mon", value: "1" },
    { label: "Tue", value: "2" },
    { label: "Wed", value: "3" },
    { label: "Thu", value: "4" },
    { label: "Fri", value: "5" },
    { label: "Sat", value: "6" },
  ];

  // const formatOptions = [
  //   { value: "compact", label: "International (1K, 1M)" },
  //   { value: "indian", label: "Indian System (1L, 1Cr)" },
  // ];

  // Handle logo upload
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const openLogoCrop = () => {
    setIsLogoCropOpen(true);
  };

  const closeLogoCrop = () => {
    setIsLogoCropOpen(false);
  };

  const applyCroppedLogo = (dataUrl: string) => {
    setLogoPreview(dataUrl);
    setValue("logo", dataUrl);
  };

  // Handle form submission
  const onSubmit = (data: SimpleCompanyDetails) => {
    const payload = {
      companyId: data.companyId,
      companyName: data?.companyName,
      annualTurnOver: data?.annualTurnOver,
      businessStartDate: data?.businessStartDate,
      companyAddress: data?.companyAddress,
      companyAdminEmail: data?.companyAdminEmail,
      companyAdminMobile: data.companyAdminMobile?.startsWith("+91")
        ? data.companyAdminMobile
        : `+91${data.companyAdminMobile}`,
      companyMobile: data.accountPocMobile?.startsWith("+91")
        ? data.accountPocMobile
        : `+91${data.accountPocMobile}`,
      companyAdminName: data?.companyAdminName,
      companyBillingName: data?.companyBillingName,
      companyGst: data?.companyGst,
      companyWebsite: data?.companyWebsite,
      accountPOC: data?.accountPOC,
      accountsPocEmail: data?.accountsPocEmail,
      pancardNumber: data?.pancardNumber,
      cityId: data?.cityId,
      industryId: data?.industryId,
      engagementTypeId: data?.engagementTypeId,
      sahayTeamMates: data?.sahayTeamMates,
      consultants: data?.consultants,
      superAdmin: data?.superAdmin,
      kpiSkipDays: data.kpiSkipDays,
      validationKey: data.validationKey,
    };

    addCompany(payload, {
      onSuccess: (res) => {
        type AdminUserRes = { adminUserId?: string };
        const adminUserId =
          Array.isArray(res) &&
          res.length > 0 &&
          (res[0] as AdminUserRes).adminUserId
            ? (res[0] as AdminUserRes).adminUserId
            : data.companyId;

        const uploadIfPresent = (
          file: File | string | null | undefined,
          fileType: string,
        ) => {
          if (
            file &&
            ((typeof file === "string" && file.startsWith("data:")) ||
              (typeof File !== "undefined" && file instanceof File))
          ) {
            const formData = new FormData();
            formData.append("refId", adminUserId || "");
            formData.append("fileType", fileType);
            formData.append("isMaster", "1");
            formData.append("isUpdate", "1");
            if (typeof file === "string" && file.startsWith("data:")) {
              const arr = file.split(",");
              const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
              const bstr = atob(arr[1]);
              let n = bstr.length;
              const u8arr = new Uint8Array(n);
              while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
              }
              formData.append(
                "file",
                new Blob([u8arr], { type: mime }),
                "file.png",
              );
            } else {
              formData.append("file", file as File);
            }
            uploadImage(formData, {
              onSuccess: () => {
                window.location.reload();
              },
            });
          }
        };

        uploadIfPresent(data.logo, "2000");
        uploadIfPresent(data.pan, "2020");
        uploadIfPresent(data.gstCertificate, "2030");
      },
    });
    setIsEditing(false);
  };

  // Handle cancel edit
  const handleCancel = () => {
    reset();
    setLogoPreview(null);
    setIsEditing(false);
  };

  return {
    companyData,
    isEditing,
    logoPreview,
    errors,
    handleSubmit,
    register,
    handleLogoUpload,
    openLogoCrop,
    closeLogoCrop,
    applyCroppedLogo,
    onSubmit,
    control,
    setValue,
    watch,
    handleCancel,
    setIsEditing,
    setIsIndSearch,
    industryOptions,
    countryOptions,
    setIsCountrySearch,
    setIsCitySearch,
    setIsStateSearch,
    stateOptions,
    cityOptions,
    watchedCountryId,
    watchedStateId,
    permission,
    isLogoCropOpen,
    skipDaysOption,
    holidayData,
    handleEdit,
    isModalOpen,
    handleAdd,
    modalData,
    handleDelete,
    handleClose,
    middlePercent,
    setMiddlePercent,
    // formatOptions,
  };
}
