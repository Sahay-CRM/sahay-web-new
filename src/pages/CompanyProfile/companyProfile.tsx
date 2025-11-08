import {
  Edit2,
  Save,
  X,
  Upload,
  Building,
  FileText,
  Calendar,
  Edit,
  Trash2,
} from "lucide-react";
import useCompany from "./useCompany";
import { Button } from "@/components/ui/button";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import { Controller } from "react-hook-form";
import SearchDropdown from "@/components/shared/Form/SearchDropdown";
import {
  formatIndianNumber,
  formatUTCDateToLocal,
} from "@/features/utils/app.utils";
import FormImage from "@/components/shared/Form/FormImage/FormImage";
import PageNotAccess from "../PageNoAccess";
import ImageCropModal from "@/components/shared/Modal/ImageCropModal";
import { ImageBaseURL } from "@/features/utils/urls.utils";
import FormSelect from "@/components/shared/Form/FormSelect";
import AddHolidaysForm from "../CompanyHoliday/AddHolidayFormModal";

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
  } = useCompany();

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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full text-white font-bold text-2xl shadow-lg">
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
                    <Building className="w-8 h-8" />
                  )}
                </div>

                {isEditing && (
                  <button
                    type="button"
                    onClick={openLogoCrop}
                    className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1.5 rounded-full cursor-pointer shadow-lg hover:bg-blue-700 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="mx-6">
                <h1 className="text-xl font-bold text-gray-900">
                  {companyData.companyName}
                </h1>
                <p className="text-gray-600 mt-1">
                  {companyData.Industry?.industryName} • {companyData.cityName}
                </p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-black">
                  <span>Admin Name: {companyData.companyAdminName}</span>
                  <span>📧 {companyData.companyAdminEmail}</span>
                  <span>📱 {companyData.companyAdminMobile}</span>
                </div>
              </div>
            </div>

            {permission.Edit && (
              <>
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center bg-primary text-white rounded-lg hover:bg-primary transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </Button>
                ) : (
                  <div className="flex space-x-3">
                    <Button
                      onClick={handleCancel}
                      className="flex items-center bg-gray-500 text-white px-4 py-2.5 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </Button>
                    <Button
                      onClick={handleSubmit(onSubmit)}
                      className="flex items-center bg-primary text-white rounded-lg hover:bg-primary transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 py-4 px-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Company Information
              </h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-1/2">
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
                  <div className="w-1/2">
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
                <div className="flex gap-4">
                  <div className="w-1/2">
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
                  <div className="w-1/2">
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
                <div className="flex gap-4">
                  <div className="w-1/2">
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
                  <div className="w-1/2">
                    {isEditing ? (
                      <Controller
                        control={control}
                        name="kpiSkipDays"
                        render={({ field }) => (
                          <FormSelect
                            label="Company Skip Days"
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
                        <label className="block text-sm font-medium text-gray-700">
                          Company Skip Days
                        </label>
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
                {/* <div className="w-1/2">
                  {isEditing ? (
                    <Controller
                      control={control}
                      name="unit"
                      render={({ field }) => (
                        <FormSelect
                          label="Unit"
                          value={field.value}
                          onChange={field.onChange}
                          options={formatOptions}
                          error={errors.unit}
                          className="rounded-md"
                          triggerClassName="py-4"
                        />
                      )}
                    />
                  ) : (
                    <div>
                      {companyData.kpiSkipDays && (
                        <>
                          <label className="block text-sm font-medium text-gray-700">
                            Unit
                          </label>
                          <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                            {(typeof companyData.kpiSkipDays === "string"
                              ? companyData.kpiSkipDays.split(",")
                              : companyData.kpiSkipDays
                            )
                              .map(
                                (dayValue: string) =>
                                  skipDaysOption.find(
                                    (opt) => opt.value === dayValue
                                  )?.label
                              )
                              .filter((label): label is string =>
                                Boolean(label)
                              )
                              .join(", ")}
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </div> */}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 py-4 px-8">
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
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                          {companyData.accountsPocEmail}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-1/3">
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
                  <div className="w-1/3">
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
                  <div className="w-1/3">
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
                    <p className="text-gray-900 bg-gray-50 px-3 py-1 rounded-lg">
                      {companyData.companyAddress}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 py-4 px-8 md:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Legal Information
              </h2>
              <div className="flex gap-10 h-auto">
                {/* PAN Card Section */}
                <div className="w-1/2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pancard Number
                    </label>
                    {isEditing ? (
                      <FormInputField
                        label=""
                        {...register("pancardNumber")}
                        error={errors.pancardNumber}
                      />
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-3  rounded-lg">
                        {watch("pancardNumber") || "Not provided"}
                      </p>
                    )}
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">
                      PAN Card
                    </label>
                    {isEditing ? (
                      <FormImage
                        label=""
                        value={watch("pan") ?? ""}
                        onChange={(val) => setValue("pan", val)}
                        error={errors.pan}
                      />
                    ) : (
                      <div className="h-full bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
                        {watch("pan") ? (
                          <img
                            src={watch("pan")}
                            alt="PAN Card"
                            className="h-full w-full object-contain rounded-lg"
                          />
                        ) : (
                          <div className="text-center text-gray-500">
                            <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>No PAN card uploaded</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* GST Section */}
                <div className="w-1/2">
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
                      <FormImage
                        label=""
                        value={watch("gstCertificate") ?? ""}
                        onChange={(val) => setValue("gstCertificate", val)}
                        error={errors.gstCertificate}
                      />
                    ) : (
                      <div className="h-full bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
                        {watch("gstCertificate") ? (
                          <img
                            src={watch("gstCertificate")}
                            alt="GST Certificate"
                            className="h-full w-full object-contain rounded-lg"
                          />
                        ) : (
                          <div className="text-center text-gray-500">
                            <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>No GST certificate uploaded</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 py-4 px-8 md:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Company Skip Days
              </h2>
              <div className="space-y-4">
                <div className="flex gap-4">
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 py-4 px-8 md:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Company Holidays
              </h2>
              <div className="space-y-4">
                <div className="flex gap-4">
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
