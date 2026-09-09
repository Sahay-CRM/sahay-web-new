import {
  Edit2,
  Save,
  X,
  Upload,
  Building,
  Calendar,
  Edit,
  Trash2,
  Plus,
} from "lucide-react";
import useCompany from "./useCompany";
import { Button } from "@/components/ui/button";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import { Controller, useFieldArray } from "react-hook-form";
import SearchDropdown from "@/components/shared/Form/SearchDropdown";
import {
  formatIndianNumber,
  formatUTCDateToLocal,
  formatTo12HourLower,
  generateTimeOptions,
} from "@/features/utils/app.utils";
import FormFile, { 
  FilePreview,
} from "@/components/shared/Form/FormFile/FormFile";
import PageNotAccess from "../PageNoAccess";
import ImageCropModal from "@/components/shared/Modal/ImageCropModal";
import { ImageBaseURL } from "@/features/utils/urls.utils";
import FormSelect from "@/components/shared/Form/FormSelect";
import AddHolidaysForm from "../CompanyHoliday/AddHolidayFormModal";
// import { FormLabel } from "@/components/ui/form";

const toMinutes = (timeStr?: string | null): number | null => {
  if (!timeStr) return null;
  const parts = timeStr.split(":");
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
};

export default function CompanyProfile() {
  const {
    companyData,
    isEditing,
    logoPreview,
    errors,
    handleSubmit,
    register,
    openLogoCrop,
    closeLogoCrop,
    applyCroppedLogo,
    onSubmit,
    setValue,
    control,
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
    modalData,
    handleClose,
    handleDelete,
    // formatOptions,
    handleAdd,
    trigger,
  } = useCompany();

  const timeOptions = generateTimeOptions();

  const { fields, append, remove, insert } = useFieldArray({
    control,
    name: "shifts",
  });

  const watchedStartTime = watch("companyStartTime");
  const watchedEndTime = watch("companyEndTime");
  const watchedShifts = (watch("shifts") as CompanyShift[]) || [];

  const companyStartTimeOptions = timeOptions.filter((option) => {
    if (!watchedEndTime) return true;
    const endMin = toMinutes(watchedEndTime);
    const optionMin = toMinutes(option.value);
    return endMin !== null && optionMin !== null && optionMin < endMin;
  });

  const companyEndTimeOptions = timeOptions.filter((option) => {
    if (!watchedStartTime) return true;
    const startMin = toMinutes(watchedStartTime);
    const optionMin = toMinutes(option.value);
    return startMin !== null && optionMin !== null && optionMin > startMin;
  });

  const getStartTimeOptionsForShift = (index: number) => {
    const shiftEndTime = watch(`shifts.${index}.endTime`);
    
    return timeOptions.filter((option) => {
      const optionMin = toMinutes(option.value);
      if (optionMin === null) return true;

      if (shiftEndTime) {
        const endMin = toMinutes(shiftEndTime);
        if (endMin !== null && optionMin >= endMin) return false;
      }

      if (watchedStartTime) {
        const companyStartMin = toMinutes(watchedStartTime);
        if (companyStartMin !== null && optionMin < companyStartMin) return false;
      }

      if (watchedEndTime) {
        const companyEndMin = toMinutes(watchedEndTime);
        if (companyEndMin !== null && optionMin > companyEndMin) return false;
      }

      return true;
    });
  };

  const getEndTimeOptionsForShift = (index: number) => {
    const shiftStartTime = watch(`shifts.${index}.startTime`);

    return timeOptions.filter((option) => {
      const optionMin = toMinutes(option.value);
      if (optionMin === null) return true;

      if (shiftStartTime) {
        const startMin = toMinutes(shiftStartTime);
        if (startMin !== null && optionMin <= startMin) return false;
      }

      if (watchedStartTime) {
        const companyStartMin = toMinutes(watchedStartTime);
        if (companyStartMin !== null && optionMin < companyStartMin) return false;
      }

      if (watchedEndTime) {
        const companyEndMin = toMinutes(watchedEndTime);
        if (companyEndMin !== null && optionMin > companyEndMin) return false;
      }

      return true;
    });
  };

  if (!companyData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading company profile...</p>
        </div>
      </div>
    );
  }

  if (permission && permission.View === false) {
    return <PageNotAccess />;
  }
  return (
    <div className="bg-gray-50 py-4">
      <div className="mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center text-center sm:text-left space-y-4 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full text-white font-bold text-2xl shadow-lg overflow-hidden">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Company Logo"
                      className="w-full h-full object-cover"
                    />
                  ) : companyData.logo ? (
                    <img
                      src={`${ImageBaseURL}/share/company/logo/${companyData.logo}`}
                      alt="Company Logo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                      <Building className="w-8 h-8 sm:w-10 sm:h-10" />
                    </div>
                  )}
                </div>

                {isEditing && (
                  <button
                    type="button"
                    onClick={openLogoCrop}
                    className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-blue-700 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="sm:mx-4">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                  {companyData.companyName}
                </h1>
                <p className="text-gray-600 mt-1">
                  {companyData.Industry?.industryName} • {companyData.cityName}
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center flex-wrap gap-2 mt-3 text-sm text-gray-700">
                  <span className="flex items-center gap-1 shrink-0">
                    <span className="font-semibold">Admin:</span>{" "}
                    {companyData.companyAdminName}
                  </span>
                  <span className="hidden sm:inline text-gray-300">|</span>
                  <span className="flex items-center gap-1 break-all">
                    📧 {companyData.companyAdminEmail}
                  </span>
                  <span className="hidden sm:inline text-gray-300">|</span>
                  <span className="flex items-center gap-1 shrink-0">
                    📱 {companyData.companyAdminMobile}
                  </span>
                </div>
              </div>
            </div>

            {permission.Edit && (
              <div className="w-full md:w-auto mt-4 md:mt-0">
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="w-full md:w-auto flex items-center justify-center gap-2 bg-primary text-white rounded-lg hover:bg-primary transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </Button>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={handleCancel}
                      className="flex-1 sm:w-auto flex items-center justify-center gap-2 bg-gray-500 text-white px-4 py-2.5 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </Button>
                    <Button
                      onClick={handleSubmit(onSubmit)}
                      className="flex-1 sm:w-auto flex items-center justify-center gap-2 bg-primary text-white rounded-lg hover:bg-primary transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 py-4 px-4 sm:px-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Company Information
              </h2>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-1/2">
                    {isEditing ? (
                      <FormInputField
                        label="Company Name"
                        placeholder="Enter an Meeting Name"
                        {...register("companyName", {
                          required: "Company Name is required",
                        })}
                        error={errors.companyName}
                        isMandatory
                        className="m-0"
                      />
                    ) : (
                      <>
                        <label className="block text-sm font-medium text-gray-700">
                          Company Name
                        </label>
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                          {companyData.companyName}
                        </p>
                      </>
                    )}
                  </div>
                  <div className="w-full sm:w-1/2">
                    {isEditing ? (
                      <FormInputField
                        label="Billing Name"
                        placeholder="Enter Company Billing Name"
                        {...register("companyBillingName", {
                          required: "Please enter billing name",
                        })}
                        error={errors.companyBillingName}
                        isMandatory
                        className="m-0"
                      />
                    ) : (
                      <>
                        <label className="block text-sm font-medium text-gray-700">
                          Billing Name
                        </label>
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                          {companyData.companyBillingName}
                        </p>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-1/2">
                    {isEditing ? (
                      <FormInputField
                        label="Website"
                        placeholder="www.example.com"
                        {...register("companyWebsite")}
                        error={errors.companyWebsite}
                        className="m-0"
                      />
                    ) : (
                      <>
                        <label className="block text-sm font-medium text-gray-700">
                          Website
                        </label>
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                          {companyData.companyWebsite}
                        </p>
                      </>
                    )}
                  </div>
                  <div className="w-full sm:w-1/2">
                    {isEditing ? (
                      <Controller
                        control={control}
                        name="industryId"
                        rules={{ required: "Select an industry" }}
                        render={({ field }) => (
                          <SearchDropdown
                            {...field}
                            label="Industry"
                            placeholder="Select Industry "
                            options={industryOptions}
                            error={errors.industryId}
                            isMandatory={true}
                            selectedValues={field.value ? [field.value] : []}
                            onSelect={(value) => {
                              field.onChange(value.value);
                              setValue("industryId", value.value);
                            }}
                            className="mb-0"
                            labelClass="mb-2"
                            onSearchChange={setIsIndSearch}
                          />
                        )}
                      />
                    ) : (
                      <>
                        <label className="block text-sm font-medium text-gray-700">
                          Industry Name
                        </label>
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                          {companyData.Industry?.industryName}
                        </p>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-1/2">
                    {isEditing ? (
                      <Controller
                        name="annualTurnOver"
                        control={control}
                        rules={{ required: "Please enter turnover" }}
                        render={({ field }) => (
                          <FormInputField
                            type="text"
                            label="Annual Turnover"
                            value={formatIndianNumber(field.value)}
                            onChange={(e) => {
                              const rawValue = e.target.value.replace(/,/g, "");
                              field.onChange(rawValue);
                            }}
                            error={errors.annualTurnOver}
                          />
                        )}
                      />
                    ) : (
                      <>
                        <label className="block text-sm font-medium text-gray-700">
                          Annual Turnover
                        </label>
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                          {formatIndianNumber(companyData.annualTurnOver)}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 py-4 px-4 sm:px-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Contact Information
              </h2>
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  <div className="">
                    {isEditing ? (
                      <FormInputField
                        label="Account's POC Name"
                        {...register("accountPOC", {
                          required: "Please enter Account's POC Name",
                        })}
                        error={errors.accountPOC}
                        className="m-0"
                      />
                    ) : (
                      <>
                        <label className="block text-sm font-medium text-gray-700">
                          Account's POC Name
                        </label>
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                          {companyData.accountPOC}
                        </p>
                      </>
                    )}
                  </div>
                  <div className="">
                    {isEditing ? (
                      <FormInputField
                        label="Account's POC Mobile"
                        {...register("accountPocMobile", {
                          required: "Please Enter Account's POC Mobile",
                          pattern: {
                            value: /^[6-9]\d{9}$/,
                            message: "Enter valid mobile number",
                          },
                        })}
                        selectedCodeValue={"+91"}
                        error={errors.accountPocMobile}
                        className="text-lg py-4 m-0"
                      />
                    ) : (
                      <>
                        {companyData.companyMobile && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Account's POC Mobile
                            </label>
                            <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                              {companyData.companyMobile}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div className="">
                    {isEditing ? (
                      <FormInputField
                        label="Account's POC Email"
                        {...register("accountsPocEmail", {
                          required: "Please Enter Account's POC email",
                          pattern: {
                            value: /^\S+@\S+\.\S+$/,
                            message: "Enter valid email",
                          },
                        })}
                        error={errors.accountsPocEmail}
                        className="m-0"
                      />
                    ) : (
                      <>
                        <label className="block text-sm font-medium text-gray-700">
                          Account's POC Email
                        </label>
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg break-all">
                          {companyData.accountsPocEmail}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-1/3">
                    {isEditing ? (
                      <Controller
                        name="countryId"
                        control={control}
                        rules={{ required: "Select a country" }}
                        render={({ field }) => (
                          <SearchDropdown
                            {...field}
                            label="Country"
                            selectedValues={field.value ? [field.value] : []}
                            onSelect={(value) => {
                              field.onChange(value.value);
                              setValue("countryId", value.value);
                            }}
                            options={countryOptions}
                            placeholder="Select Country"
                            error={errors.countryId}
                            isMandatory
                            className="mb-2"
                            onSearchChange={setIsCountrySearch}
                          />
                        )}
                      />
                    ) : (
                      <>
                        <label className="block text-sm font-medium text-gray-700">
                          Country Name
                        </label>
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                          {companyData.countryName}
                        </p>
                      </>
                    )}
                  </div>
                  <div className="w-full sm:w-1/3">
                    {isEditing ? (
                      <Controller
                        name="stateId"
                        control={control}
                        rules={{ required: "Select a state" }}
                        render={({ field }) => (
                          <SearchDropdown
                            {...field}
                            label="State"
                            options={stateOptions}
                            placeholder="Select State"
                            error={errors.stateId}
                            isMandatory
                            disabled={!watchedCountryId}
                            selectedValues={field.value ? [field.value] : []}
                            onSelect={(value) => {
                              field.onChange(value.value);
                              setValue("stateId", value.value);
                            }}
                            className="mb-2"
                            onSearchChange={setIsStateSearch}
                          />
                        )}
                      />
                    ) : (
                      <>
                        <label className="block text-sm font-medium text-gray-700">
                          State Name
                        </label>
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                          {companyData.stateName}
                        </p>
                      </>
                    )}
                  </div>
                  <div className="w-full sm:w-1/3">
                    {isEditing ? (
                      <Controller
                        control={control}
                        name="cityId"
                        rules={{ required: "Select a city" }}
                        render={({ field }) => (
                          <SearchDropdown
                            {...field}
                            label="City"
                            options={cityOptions}
                            error={errors.cityId}
                            placeholder="Select City"
                            disabled={!watchedStateId}
                            isMandatory={true}
                            selectedValues={field.value ? [field.value] : []}
                            onSelect={(value) => {
                              field.onChange(value.value);
                              setValue("cityId", value.value);
                            }}
                            className="mb-2"
                            onSearchChange={setIsCitySearch}
                          />
                        )}
                      />
                    ) : (
                      <>
                        <label className="block text-sm font-medium text-gray-700">
                          City Name
                        </label>
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                          {companyData.cityName}
                        </p>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-1/2">
                    {isEditing ? (
                      <Controller
                        name="companyStartTime"
                        control={control}
                        rules={{
                          validate: (val, formValues) => {
                            const endVal = formValues?.companyEndTime;
                            if (!val && endVal) {
                              return "Start time is required";
                            }
                            if (!val) return true;
                            const startMin = toMinutes(val);
                            const endMin = toMinutes(endVal);
                            if (startMin !== null && endMin !== null) {
                              if (startMin === endMin) {
                                return "Start time cannot be equal to End time";
                              }
                              if (startMin > endMin) {
                                return "Start time must be before End time";
                              }
                            }
                            return true;
                          },
                        }}
                        render={({ field }) => (
                          <SearchDropdown
                            options={companyStartTimeOptions}
                            selectedValues={field.value ? [field.value] : []}
                            onSelect={(val) => {
                              field.onChange(val.value);
                              setTimeout(() => {
                                if (watchedEndTime) {
                                  trigger("companyEndTime");
                                }
                              }, 0);
                            }}
                            label="Company Start Time"
                            placeholder="Select Start Time"
                            error={errors.companyStartTime}
                            isSearchable={false}
                            className="[&_span.text-red-600]:whitespace-nowrap"
                          />
                        )}
                      />
                    ) : (
                      <>
                        <label className="block text-sm font-medium text-gray-700">
                          Company Start Time
                        </label>
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                          {formatTo12HourLower(companyData.companyStartTime)}
                        </p>
                      </>
                    )}
                  </div>
                  <div className="w-full sm:w-1/2">
                    {isEditing ? (
                      <Controller
                        name="companyEndTime"
                        control={control}
                        rules={{
                          validate: (val, formValues) => {
                            const startVal = formValues?.companyStartTime;
                            if (!val && startVal) {
                              return "End time is required";
                            }
                            if (!val) return true;
                            const startMin = toMinutes(startVal);
                            const endMin = toMinutes(val);
                            if (startMin !== null && endMin !== null) {
                              if (startMin === endMin) {
                                return "End time cannot be equal to Start time";
                              }
                              if (startMin > endMin) {
                                return "End time must be after Start time";
                              }
                            }
                            return true;
                          },
                        }}
                        render={({ field }) => (
                          <SearchDropdown
                            options={companyEndTimeOptions}
                            selectedValues={field.value ? [field.value] : []}
                            onSelect={(val) => {
                              field.onChange(val.value);
                              setTimeout(() => {
                                if (watchedStartTime) {
                                  trigger("companyStartTime");
                                }
                              }, 0);
                            }}
                            label="Company End Time"
                            placeholder="Select End Time"
                            error={errors.companyEndTime}
                            isSearchable={false}
                            className="[&_span.text-red-600]:whitespace-nowrap"
                          />
                        )}
                      />
                    ) : (
                      <>
                        <label className="block text-sm font-medium text-gray-700">
                          Company End Time
                        </label>
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                          {formatTo12HourLower(companyData.companyEndTime)}
                        </p>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Address
                  </label>

                  {isEditing ? (
                    <textarea
                      {...register("companyAddress", {
                        required: "Company address is required",
                      })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-1 rounded-lg break-words">
                      {companyData.companyAddress}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 py-4 px-4 sm:px-8 md:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Legal Information
              </h2>
              <div className="flex flex-col lg:flex-row gap-8 h-auto">
                {/* PAN Card Section */}
                <div className="w-full lg:w-1/2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Pancard Number
                    </label>
                    {isEditing ? (
                      <FormInputField
                        label=""
                        {...register("pancardNumber")}
                        error={errors.pancardNumber}
                      />
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                        {watch("pancardNumber") || "Not provided"}
                      </p>
                    )}
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PAN Card
                    </label>

                    {isEditing ? (
                      <FormFile
                        label=""
                        value={watch("pancard") ?? ""}
                        fileName={watch("pancardFileName")}
                        onChange={(val, fileName) => {
                          setValue("pancard", val);
                          setValue("pancardFileName", fileName);
                        }}
                        error={errors.pancard}
                        acceptedFormats=".jpg,.jpeg,.png,.webp,.pdf"
                      />
                    ) : (
                      <div className="bg-gray-50 rounded-lg border p-1 border-gray-200 flex items-center justify-center min-h-[200px] w-full">
                        <FilePreview
                          value={watch("pancard") ?? ""}
                          fileName={watch("pancardFileName")}
                          className="w-full max-w-[400px] h-auto aspect-video"
                          placeholder="No Pan Card uploaded"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* GST Section */}
                <div className="w-full lg:w-1/2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Company GST No
                    </label>
                    {isEditing ? (
                      <FormInputField
                        label=""
                        {...register("companyGst")}
                        error={errors.companyGst}
                      />
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                        {watch("companyGst") || "Not provided"}
                      </p>
                    )}
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      GST Certificate
                    </label>
                    {isEditing ? (
                      <FormFile
                        label=""
                        value={watch("gstCertificate") ?? ""}
                        fileName={watch("gstCertificateFileName")}
                        onChange={(val, fileName) => {
                          setValue("gstCertificate", val);
                          setValue("gstCertificateFileName", fileName);
                        }}
                        error={errors.gstCertificate}
                        acceptedFormats=".jpg,.jpeg,.png,.webp,.pdf"
                      />
                    ) : (
                      <div className="bg-gray-50 rounded-lg border p-1 border-gray-200 flex items-center justify-center min-h-[200px] w-full">
                        <FilePreview
                          value={watch("gstCertificate") ?? ""}
                          fileName={watch("gstCertificateFileName")}
                          className="w-full max-w-[400px] h-auto aspect-video"
                          placeholder="No GST certificate uploaded"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 py-4 px-4 sm:px-8 md:col-span-2">
              {/* Header */}
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  KPI Validation
                </h2>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-6 sm:gap-12">
                  {/* 0% Red */}
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded bg-red-100 border border-red-500" />
                    <span className="text-xs mt-1 text-gray-700 font-medium">
                      0%
                    </span>
                  </div>
                  {/* 100% Green */}
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded bg-green-100 border border-green-500" />
                    <span className="text-xs mt-1 text-gray-700 font-medium">
                      100%
                    </span>
                  </div>
                  {/* Middle % Yellow */}
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded bg-yellow-200 border border-yellow-500" />

                    {!isEditing ? (
                      <span className="text-xs mt-1 text-gray-700 font-medium">
                        {watch("validationKey") ?? "--"}%
                      </span>
                    ) : (
                      <Controller
                        control={control}
                        name="validationKey"
                        render={({ field }) => {
                          const numericValue =
                            field.value && !isNaN(Number(field.value))
                              ? Number(field.value)
                              : "";

                          return (
                            <input
                              type="number"
                              min={0}
                              max={99}
                              placeholder="0"
                              value={numericValue}
                              onChange={(e) => {
                                let value = e.target.value.replace(/\D/g, "");
                                if (value.length > 2) value = value.slice(0, 2);
                                field.onChange(value === "" ? null : value);
                              }}
                              className="w-12 mt-1 border border-gray-300 rounded py-0.5 text-center text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                            />
                          );
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 py-4 px-4 sm:px-8">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-2 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Company Shifts
                  </h2>
                  {(watchedStartTime || companyData?.companyStartTime) && (watchedEndTime || companyData?.companyEndTime) && (
                    <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200">
                      ({formatTo12HourLower(watchedStartTime || companyData?.companyStartTime)} - {formatTo12HourLower(watchedEndTime || companyData?.companyEndTime)})
                    </span>
                  )}
                </div>
              </div>

              {!isEditing ? (
                // View Mode
                <div className="space-y-3">
                  {watchedShifts && watchedShifts.length > 0 ? (
                    watchedShifts.map((shift, index) => {
                      const hr = Math.floor((shift.breakDuration || 0) / 60);
                      const min = (shift.breakDuration || 0) % 60;
                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="bg-primary/10 text-primary p-2 rounded-lg shrink-0">
                              <Building className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {(formatTo12HourLower(shift.startTime) || shift.startTime)} - {(formatTo12HourLower(shift.endTime) || shift.endTime)}
                              </p>
                              <p className="text-sm text-gray-500">
                                Break: {hr} hr {min} min
                              </p>
                            </div>
                          </div>
                          {shift.isDefault && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-sm font-semibold bg-green-100 text-green-800 shrink-0">
                              Default
                            </span>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 text-gray-400 text-sm">
                      No shifts defined. Click Edit Profile to add shifts.
                    </div>
                  )}
                </div>
              ) : (
                // Edit Mode
                <div className="space-y-3">
                  {fields.map((field, index) => {
                    const shiftErrors = errors.shifts as Array<{ startTime?: { message?: string }; endTime?: { message?: string } }> | undefined;
                    return (
                      <div key={field.id} className="flex flex-row flex-wrap sm:flex-nowrap items-start gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                        {/* Start Time */}
                        <div className="w-36 shrink-0">
                          <label className="block text-sm font-medium text-gray-700 mb-1">start</label>
                          <Controller
                            control={control}
                            name={`shifts.${index}.startTime` as const}
                            rules={{
                              validate: (val, formValues) => {
                                const currentShift = formValues?.shifts?.[index];
                                const endVal = currentShift?.endTime;
                                if (!val && endVal) {
                                  return "Start time is required";
                                }
                                if (!val) return true;
                                const valMin = toMinutes(val);
                                if (valMin === null) return true;

                                // Company operating hours check
                                const compStart = formValues?.companyStartTime;
                                const compEnd = formValues?.companyEndTime;
                                if (compStart) {
                                  const compStartMin = toMinutes(compStart);
                                  if (compStartMin !== null && valMin < compStartMin) {
                                    return "Must be after company start time";
                                  }
                                }
                                if (compEnd) {
                                  const compEndMin = toMinutes(compEnd);
                                  if (compEndMin !== null && valMin > compEndMin) {
                                    return "Must be before company end time";
                                  }
                                }

                                // Shift End Time check
                                if (endVal) {
                                  const endMin = toMinutes(endVal);
                                  if (endMin !== null) {
                                    if (valMin === endMin) {
                                      return "Start time cannot be equal to End time";
                                    }
                                    if (valMin > endMin) {
                                      return "Start time must be before End time";
                                    }
                                  }
                                  const isDuplicate = formValues?.shifts?.some(
                                    (s: CompanyShift, i: number) =>
                                      i !== index && s?.startTime === val && s?.endTime === endVal
                                  );
                                  if (isDuplicate) {
                                    return "Duplicate shift timing not allowed";
                                  }
                                }
                                return true;
                              },
                            }}
                            render={({ field: selectField }) => (
                              <SearchDropdown
                                options={getStartTimeOptionsForShift(index)}
                                selectedValues={selectField.value ? [selectField.value] : []}
                                onSelect={(val) => {
                                  selectField.onChange(val.value);
                                  setTimeout(() => {
                                    const endVal = watch(`shifts.${index}.endTime`);
                                    if (endVal) {
                                      trigger(`shifts.${index}.endTime`);
                                    }
                                  }, 0);
                                }}
                                placeholder="Select"
                                isSearchable={false}
                                isCrossShow={false}
                                error={shiftErrors?.[index]?.startTime}
                                className="[&_span.text-red-600]:whitespace-nowrap"
                              />
                            )}
                          />
                        </div>

                        {/* "to" separator */}
                        <div className="flex flex-col shrink-0">
                          <span className="block text-sm font-medium text-transparent select-none mb-1">.</span>
                          <span className="text-gray-400 text-sm font-medium h-10 flex items-center">to</span>
                        </div>

                        {/* End Time */}
                        <div className="w-36 shrink-0">
                          <label className="block text-sm font-medium text-gray-700 mb-1">end</label>
                          <Controller
                            control={control}
                            name={`shifts.${index}.endTime` as const}
                            rules={{
                              validate: (val, formValues) => {
                                const currentShift = formValues?.shifts?.[index];
                                const startVal = currentShift?.startTime;
                                if (!val && startVal) {
                                  return "End time is required";
                                }
                                if (!val) return true;
                                const valMin = toMinutes(val);
                                if (valMin === null) return true;

                                // Company operating hours check
                                const compStart = formValues?.companyStartTime;
                                const compEnd = formValues?.companyEndTime;
                                if (compStart) {
                                  const compStartMin = toMinutes(compStart);
                                  if (compStartMin !== null && valMin < compStartMin) {
                                    return "Must be after company start time";
                                  }
                                }
                                if (compEnd) {
                                  const compEndMin = toMinutes(compEnd);
                                  if (compEndMin !== null && valMin > compEndMin) {
                                    return "Must be before company end time";
                                  }
                                }

                                // Shift Start Time check
                                if (startVal) {
                                  const startMin = toMinutes(startVal);
                                  if (startMin !== null) {
                                    if (valMin === startMin) {
                                      return "End time cannot be equal to Start time";
                                    }
                                    if (startMin > valMin) {
                                      return "End time must be after Start time";
                                    }
                                  }
                                  const isDuplicate = formValues?.shifts?.some(
                                    (s: CompanyShift, i: number) =>
                                      i !== index && s?.startTime === startVal && s?.endTime === val
                                  );
                                  if (isDuplicate) {
                                    return "Duplicate shift timing not allowed";
                                  }
                                }
                                return true;
                              },
                            }}
                            render={({ field: selectField }) => (
                              <SearchDropdown
                                options={getEndTimeOptionsForShift(index)}
                                selectedValues={selectField.value ? [selectField.value] : []}
                                onSelect={(val) => {
                                  selectField.onChange(val.value);
                                  setTimeout(() => {
                                    const startVal = watch(`shifts.${index}.startTime`);
                                    if (startVal) {
                                      trigger(`shifts.${index}.startTime`);
                                    }
                                  }, 0);
                                }}
                                placeholder="Select"
                                isSearchable={false}
                                isCrossShow={false}
                                error={shiftErrors?.[index]?.endTime}
                                className="[&_span.text-red-600]:whitespace-nowrap"
                              />
                            )}
                          />
                        </div>

                        {/* Break Hours/Minutes */}
                        <div className="flex flex-col shrink-0">
                          <label className="block text-sm font-medium text-gray-700 mb-1">break duration</label>
                          <div className="flex items-center gap-1.5 h-10 font-medium text-sm text-gray-700">
                            <input
                              type="number"
                              min={0}
                              max={23}
                              value={Math.floor((watch(`shifts.${index}.breakDuration`) || 0) / 60) || ""}
                              onChange={(e) => {
                                const hr = parseInt(e.target.value, 10) || 0;
                                const currentMin = (watch(`shifts.${index}.breakDuration`) || 0) % 60;
                                setValue(`shifts.${index}.breakDuration` as const, hr * 60 + currentMin);
                              }}
                              placeholder="0"
                              className="w-8 text-center bg-transparent border-b-2 border-gray-400 rounded-none focus:outline-none focus:border-primary px-0.5 py-0.5 text-sm font-normal"
                            />
                            <span>hr</span>

                            <input
                              type="number"
                              min={0}
                              max={59}
                              value={(watch(`shifts.${index}.breakDuration`) || 0) % 60 || ""}
                              onChange={(e) => {
                                const min = parseInt(e.target.value, 10) || 0;
                                const currentHr = Math.floor((watch(`shifts.${index}.breakDuration`) || 0) / 60);
                                setValue(`shifts.${index}.breakDuration` as const, currentHr * 60 + min);
                              }}
                              placeholder="00"
                              className="w-8 text-center bg-transparent border-b-2 border-gray-400 rounded-none focus:outline-none focus:border-primary px-0.5 py-0.5 text-sm font-normal"
                            />
                            <span>min</span>
                          </div>
                        </div>

                        {/* Default set */}
                        <div className="flex flex-col shrink-0">
                          <span className="block text-sm font-medium text-transparent select-none mb-1">.</span>
                          <div className="flex items-center gap-1.5 h-10">
                            <Controller
                              control={control}
                              name={`shifts.${index}.isDefault` as const}
                              render={({ field: checkField }) => (
                                <input
                                  id={`shifts-def-${index}`}
                                  type="checkbox"
                                  checked={checkField.value || false}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    if (checked) {
                                      const currentShifts = (watch("shifts") as CompanyShift[]) || [];
                                      currentShifts.forEach((_, idx) => {
                                        setValue(`shifts.${idx}.isDefault` as const, idx === index);
                                      });
                                    } else {
                                      checkField.onChange(false);
                                    }
                                  }}
                                  className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                                />
                              )}
                            />
                            <label htmlFor={`shifts-def-${index}`} className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                              default set
                            </label>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col ml-auto shrink-0">
                          <span className="block text-sm font-medium text-transparent select-none mb-1">.</span>
                          <div className="flex items-center gap-2 h-10">
                            {/* Trash */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                remove(index);
                              }}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 border border-gray-200 rounded-md transition-colors cursor-pointer flex items-center justify-center bg-white shadow-sm"
                              title="Delete Shift"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                            {/* Plus */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                insert(index + 1, {
                                  startTime: "",
                                  endTime: "",
                                  isDefault: false,
                                  breakDuration: 0,
                                  employeeIds: [],
                                });
                              }}
                              className="p-2 bg-primary text-white rounded-full transition-colors cursor-pointer flex items-center justify-center shadow-sm hover:opacity-90"
                              title="Add Shift Below"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {fields.length === 0 && (
                    <div className="text-center py-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                      <p className="text-sm text-gray-500 mb-2">No shifts defined.</p>
                      <Button
                        type="button"
                        onClick={() => append({
                          startTime: "",
                          endTime: "",
                          isDefault: false,
                          breakDuration: 0,
                          employeeIds: []
                        })}
                        className="px-3 py-1.5 text-sm bg-primary text-white rounded hover:opacity-90"
                      >
                        Add First Shift
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 py-4 px-4 sm:px-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Company Skip Days
              </h2>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full">
                    {isEditing ? (
                      <Controller
                        control={control}
                        name="kpiSkipDays"
                        render={({ field }) => (
                          <FormSelect
                            value={field.value}
                            onChange={field.onChange}
                            options={skipDaysOption}
                            error={errors.kpiSkipDays}
                            className="rounded-md"
                            triggerClassName="py-4"
                            isMulti
                          />
                        )}
                      />
                    ) : (
                      <div>
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                          {companyData.kpiSkipDays &&
                            (typeof companyData.kpiSkipDays === "string"
                              ? companyData.kpiSkipDays.split(",")
                              : companyData.kpiSkipDays
                            )
                              .map(
                                (dayValue: string) =>
                                  skipDaysOption.find(
                                    (opt) => opt.value === dayValue,
                                  )?.label,
                              )
                              .filter((label): label is string =>
                                Boolean(label),
                              )
                              .join(", ")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 py-4 px-4 sm:px-8 md:col-span-2">
              <div className="flex flex-col sm:flex-row gap-4 justify-between mb-4 pb-2 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Company Holidays
                </h2>

                <div>
                  {isEditing && (
                    <Button
                      className="w-full sm:w-auto py-2 px-4"
                      onClick={handleAdd}
                    >
                      Add Holiday
                    </Button>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full">
                    <div className="flex-1 p-4  overflow-scroll">
                      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {holidayData?.map((item, index) => (
                          <div key={index} className="relative group">
                            <div className="px-4 py-2 w-full border rounded-md shadow-sm bg-gray-50 hover:bg-gray-100 transition">
                              <span className="font-medium text-gray-800">
                                {item.holidayName}
                              </span>
                              <p className="text-sm flex items-center gap-1 text-gray-600 mt-1">
                                <Calendar className="h-3 w-3" />
                                {formatUTCDateToLocal(item.holidayDate!)}
                              </p>
                            </div>

                            {/* ✅ Show edit/delete buttons only when editing */}
                            {isEditing && (
                              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-primary transition"
                                  onClick={(e) => {
                                    e.preventDefault(); // stop form submission
                                    handleEdit(item);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-primary transition"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleDelete(item.holidayId!);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
        <ImageCropModal
          isOpen={isLogoCropOpen}
          onClose={closeLogoCrop}
          onApply={applyCroppedLogo}
          title="Upload & Crop Logo"
        />

        {isModalOpen && (
          <AddHolidaysForm
            isModalOpen={isModalOpen}
            modalClose={handleClose}
            modalData={modalData!}
          />
        )}
      </div>
    </div>
  );
}

//  <div className="bg-white rounded-xl shadow-sm border border-gray-200 py-4 px-8 md:col-span-2">
//               <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
//                 <h2 className="text-lg font-semibold text-gray-900">
//                   KPI Validation
//                 </h2>
//                 <button
//                   onClick={() => setIsEditing(!isEditing)}
//                   className="text-sm text-blue-600 hover:underline"
//                 >
//                   {isEditing ? "Save" : "Edit"}
//                 </button>
//               </div>

//               <div className="space-y-4">
//                 {isEditing ? (
//                   <div className="flex flex-col gap-4">
//                     {/* Editable Controls */}
//                     <div className="flex items-center justify-center gap-6">
//                       {/* Left Static */}
//                       <div className="flex flex-col items-center">
//                         <span className="text-sm text-gray-600 mb-1">10%</span>
//                         <div
//                           className="w-12 h-10 rounded"
//                           style={{ backgroundColor: "#ff4d4f" }}
//                         ></div>
//                       </div>

//                       {/* Middle Editable */}
//                       <div className="flex flex-col items-center">
//                         <span className="text-sm text-gray-600 mb-1">
//                           Editable
//                         </span>
//                         <div className="flex items-center gap-2">
//                           <input
//                             type="color"
//                             value={middleColor}
//                             onChange={(e) => setMiddleColor(e.target.value)}
//                             className="h-10 w-16 cursor-pointer rounded"
//                           />
//                           <input
//                             type="number"
//                             min={0}
//                             max={100}
//                             value={middlePercent}
//                             onChange={(e) => setMiddlePercent(e.target.value)}
//                             placeholder="%"
//                             className="w-20 border border-gray-300 rounded px-2 py-1"
//                           />
//                         </div>
//                       </div>

//                       {/* Right Static */}
//                       <div className="flex flex-col items-center">
//                         <span className="text-sm text-gray-600 mb-1">100%</span>
//                         <div
//                           className="w-12 h-10 rounded"
//                           style={{ backgroundColor: "#22c55e" }}
//                         ></div>
//                       </div>
//                     </div>

//                     {/* Progress Bar */}
//                     <div className="relative h-5 rounded-full overflow-hidden bg-gray-200">
//                       {/* Left Red 10% */}
//                       <div
//                         className="absolute left-0 top-0 h-full"
//                         style={{ width: "10%", backgroundColor: "#ff4d4f" }}
//                       />
//                       {/* Middle Editable */}
//                       {middlePercent && (
//                         <div
//                           className="absolute top-0 h-full transition-all duration-300"
//                           style={{
//                             left: "10%",
//                             width: `${Math.max(
//                               0,
//                               Math.min(0, middlePercent - 10)
//                             )}%`,
//                             backgroundColor: middleColor || "gray",
//                           }}
//                         />
//                       )}
//                       {/* Right Green 100% */}
//                       <div
//                         className="absolute right-0 top-0 h-full"
//                         style={{ width: "10%", backgroundColor: "#22c55e" }}
//                       />
//                     </div>
//                   </div>
//                 ) : (
//                   // View Mode
//                   <div>
//                     <div className="flex justify-between text-sm mb-2">
//                       <span className="text-gray-600">10%</span>
//                       <span className="text-gray-600">100%</span>
//                     </div>
//                     <div className="relative h-5 rounded-full overflow-hidden bg-gray-200" />
//                   </div>
//                 )}
//               </div>
//             </div>
