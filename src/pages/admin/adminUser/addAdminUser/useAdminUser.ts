// import { useCallback, useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { Controller, FormProvider, useForm } from "react-hook-form";

// import en from "@/share/locale/en.json";

// import {
//   useDdCity,
//   useDdLocality,
//   useGetLabel,
//   useGetUserMandatoryField,
//   useGetPrefix,
//   userMutation,
// } from "@/share/data/hooks";
// import useDdPreset from "@/share/data/hooks/useDdPreset";

// import { useGetCityById } from "@/share/data/hooks/Location";
// import useGetUserDetail from "../../../../layout/CmsLayout/useGetUserDetail";
// import FormSelect from "@/components/comman/Select/selectuser";
// import FormInputField from "@/components/comman/FormInput/FormInputField";
// import { useBreadcrumbs } from "@/context/BreadcrumbContext";
// import { createOptions } from "@/components/comman/CreateDropdownOption/createDropdownOption";
// import { validationObjFromValidationKey } from "@/share/Utils/validation.utils";
// import FormTextarea from "@/components/comman/FormTextarea/FormTextareaField";

// export default function useAddUser() {
//   const methods = useForm();
//   const { id: userId } = useParams();
//   const [isUser, setIsUser] = useState<UserData>();
//   const [isModalOpen, setModalOpen] = useState(false);

//   const { data: userDetails } = useGetUserDetail(userId || "");

//   const { setBreadcrumbs } = useBreadcrumbs();

//   useEffect(() => {
//     setBreadcrumbs([
//       { label: "Admin Tools", href: "/admin-tools" },
//       { label: "User", href: "/admin-tools/user" },
//       { label: userId ? "Update User" : "Add User", href: "" },
//     ]);
//   }, [setBreadcrumbs, userId]);

//   const { mutate: userAdd } = userMutation();

//   const handleClose = () => {
//     setModalOpen(false);
//   };

//   useEffect(() => {
//     if (userId && userDetails) {
//       setIsUser(userDetails);
//     }
//   }, [userDetails, userId]);

//   // Use React Hook Form
//   const {
//     register,
//     formState: { errors },
//     getValues,
//     handleSubmit,
//     control,
//     trigger,
//     setValue,
//     watch,
//   } = useForm({
//     values: isUser,
//     mode: "onChange",
//   });

//   const onFinish = useCallback(async () => {
//     const isValid = await trigger();
//     if (isValid) {
//       setModalOpen(true);
//     }
//   }, [trigger]);

//   const { data: mandatoryField } = useGetUserMandatoryField();

//   // Form submission handler
//   const onSubmit = handleSubmit(async (data: UserData) => {
//     delete data.isSuperAdmin;
//     const finalData = {
//       aboutMe: data.aboutMe,
//       cityId: data.cityId || "",
//       localityId: data.localityId || "",
//       designationId: data.designationId,
//       emergencyContactName: data.emergencyContactName,
//       emergencyContactNumber: data.emergencyContactNumber,
//       presetId: data.presetId || "",
//       userAddress: data.userAddress,
//       userEmail: data.userEmail,
//       userFirstName: data.userFirstName,
//       userId: data.userId,
//       userLastName: data.userLastName || "",
//       userMobileNumber: data.userMobileNumber,
//       userRd1: data.userRd1,
//       userRd2: data.userRd2,
//       userRd3: data.userRd3,
//       userRd4: data.userRd4,
//       userPrefixId: data.userPrefixId,
//     };
//     // return
//     userAdd(finalData);
//   });

//   const stepNames = [
//     "Basic Details",
//     "Contact Information",
//     "Address",
//     "Documentation",
//     "Bio",
//   ];

//   // Step components
//   const BasicDetails = () => {
//     const selectedDepartment = watch("departmentId");
//     const { data: prefixData } = useGetPrefix();
//     const { data: department } = useDdDepartment();
//     const { data: designation } = useDdDesignation({
//       filter: { departmentId: selectedDepartment },
//     });
//     const { data: preset } = useDdPreset();

//     const prefixOptions = createOptions(
//       prefixData,
//       "Please select Prefix",
//       "prefixId",
//       "prefixName",
//     );
//     const departmentOptions = createOptions(
//       department,
//       "Please select Department",
//       "departmentId",
//       "departmentName",
//     );
//     const designationOptions = createOptions(
//       designation,
//       "Please select Designation",
//       "designationId",
//       "designationName",
//     );
//     const presetOptions = createOptions(
//       preset,
//       "Please select Preset",
//       "presetId",
//       "presetName",
//     );

//     return (
//       <FormProvider {...methods}>
//         <div className="min-h-[200px] max-h-[calc(100vh-300px)]  pr-3">
//           <div>
//             <Controller
//               name="userPrefixId"
//               control={control}
//               rules={{
//                 required: mandatoryField?.prefix
//                   ? en["userFormPart.prefix.required"]
//                   : undefined,
//               }}
//               render={({ field }) => (
//                 <FormSelect
//                   {...field}
//                   id="prefixId"
//                   label={en["userFormPart.prefix.label"]}
//                   options={prefixOptions}
//                   className="rounded-md py-2 h-full focus-visible:ring-0"
//                   containerClass="mt-0 tb:mt-0 self-stretch w-full"
//                   onChange={(event) => {
//                     field.onChange(event);
//                   }}
//                   error={errors.userPrefixId}
//                   isMandatory={!!mandatoryField?.prefix}
//                 />
//               )}
//             />
//           </div>
//           <div className="mt-3">
//             <FormInputField
//               id="userFirstName"
//               {...register("userFirstName", {
//                 required: mandatoryField?.firstName
//                   ? en["userFormPart.firstName.required"]
//                   : false,
//               })}
//               error={errors.userFirstName}
//               label={en["userFormPart.firstName.label"]}
//               placeholder={en["userFormPart.firstName.placeholder"]}
//               containerClass="mt-0 tb:mt-0"
//               className="text-lg"
//               isMandatory={true}
//             />
//           </div>
//           <div className="mt-3">
//             <FormInputField
//               id="userLastName"
//               {...register("userLastName", {
//                 required: mandatoryField?.lastName
//                   ? en["userFormPart.lastName.required"]
//                   : false,
//               })}
//               error={errors.userLastName}
//               label={en["userFormPart.lastName.label"]}
//               placeholder={en["userFormPart.lastName.placeholder"]}
//               containerClass="mt-0 tb:mt-0"
//               className="text-lg"
//               isMandatory={true}
//             />
//           </div>
//           <div className="my-3">
//             <Controller
//               name="departmentId"
//               control={control}
//               rules={{
//                 required: mandatoryField?.department
//                   ? en["userFormPart.department.required"]
//                   : false,
//               }}
//               render={({ field }) => (
//                 <FormSelect
//                   {...field}
//                   id="departmentId"
//                   label="Department"
//                   options={departmentOptions}
//                   className="rounded-md py-2  tb:ps-2 h-full focus-visible:ring-0"
//                   containerClass="mt-0 tb:mt-0 self-stretch w-full"
//                   onChange={(event) => {
//                     field.onChange(event.target.value);
//                   }}
//                   error={errors.departmentId}
//                   isMandatory={!!mandatoryField?.department}
//                 />
//               )}
//             />
//           </div>
//           <div className="my-3">
//             <Controller
//               name="designationId"
//               control={control}
//               rules={{
//                 required: mandatoryField?.designation
//                   ? en["userFormPart.designation.required"]
//                   : undefined,
//               }}
//               render={({ field }) => (
//                 <FormSelect
//                   {...field}
//                   id="designationId"
//                   label="Designation"
//                   options={designationOptions}
//                   className="rounded-md py-2  tb:ps-2 h-full focus-visible:ring-0"
//                   containerClass="mt-0 tb:mt-0 self-stretch w-full"
//                   onChange={(event) => {
//                     field.onChange(event); // Update RHF
//                   }}
//                   error={errors.designationId}
//                   isMandatory={!!mandatoryField?.designation}
//                 />
//               )}
//             />
//           </div>
//           <div className="my-3">
//             <Controller
//               name="presetId"
//               control={control}
//               render={({ field }) => (
//                 <FormSelect
//                   {...field}
//                   id="presetId"
//                   label="Preset"
//                   options={presetOptions}
//                   className="rounded-md py-2  tb:ps-2 h-full focus-visible:ring-0"
//                   containerClass="mt-0 tb:mt-0 self-stretch w-full"
//                   onChange={(event) => {
//                     field.onChange(event); // Update RHF
//                   }}
//                   error={errors.presetId}
//                 />
//               )}
//             />
//           </div>
//         </div>
//       </FormProvider>
//     );
//   };

//   const ContactInformation = () => {
//     return (
//       <FormProvider {...methods}>
//         <div>
//           <FormInputField
//             id="userMobileNumber"
//             {...register("userMobileNumber", {
//               required: mandatoryField?.mobileNumber
//                 ? en["userFormPart.userMobileNumber.required"]
//                 : false,
//             })}
//             error={errors.userMobileNumber}
//             label={en["userFormPart.userMobileNumber.label"]}
//             placeholder={en["userFormPart.userMobileNumber.placeholder"]}
//             containerClass="mt-0 tb:mt-0"
//             className="text-lg"
//             type="number"
//             isMandatory={!!mandatoryField?.mobileNumber}
//           />
//           <div className="mt-3">
//             <FormInputField
//               id="userEmail"
//               {...register("userEmail", {
//                 required: mandatoryField?.email
//                   ? en["userFormPart.userEmail.required"]
//                   : false,
//               })}
//               error={errors.userEmail}
//               label={en["userFormPart.userEmail.label"]}
//               placeholder={en["userFormPart.userEmail.placeholder"]}
//               containerClass="mt-0 tb:mt-0"
//               className="text-lg"
//               isMandatory={!!mandatoryField?.country}
//             />
//           </div>
//           <div className="mt-3">
//             <FormInputField
//               id="emergencyContactName"
//               {...register("emergencyContactName", {
//                 required: mandatoryField?.emergencyContact
//                   ? en["userFormPart.emergencyContactName.required"]
//                   : false,
//               })}
//               error={errors.emergencyContactName}
//               label={en["userFormPart.emergencyContactName.label"]}
//               placeholder={en["userFormPart.emergencyContactName.placeholder"]}
//               className="text-lg"
//               isMandatory={!!mandatoryField?.emergencyContact}
//             />
//             <FormInputField
//               id="emergencyContactNumber"
//               {...register("emergencyContactNumber", {
//                 required: mandatoryField?.emergencyContactNumber
//                   ? en["userFormPart.emergencyContactNumber.required"]
//                   : false,
//               })}
//               error={errors.emergencyContactNumber}
//               label={en["userFormPart.emergencyContactNumber.label"]}
//               placeholder={
//                 en["userFormPart.emergencyContactNumber.placeholder"]
//               }
//               className="text-lg"
//               type="number"
//               isMandatory={!!mandatoryField?.emergencyContactNumber}
//             />
//           </div>
//         </div>
//       </FormProvider>
//     );
//   };

//   const Address = () => {
//     const selectedCity = watch("cityId");

//     const { data: cityData } = useDdCity({ filter: {} });
//     const { data: localityData } = useDdLocality({
//       filter: {
//         cityId: selectedCity,
//         status: 1,
//       },
//     });
//     const { data: locData } = useGetCityById(selectedCity || "");

//     const cityOptions = createOptions(
//       cityData,
//       "Please select City",
//       "cityId",
//       "cityName",
//     );
//     const localityOptions = createOptions(
//       localityData,
//       "Please select Locality",
//       "localityId",
//       "localityName",
//     );
//     return (
//       <FormProvider {...methods}>
//         <div>
//           <FormInputField
//             id="userAddress"
//             {...register("userAddress", {
//               required: mandatoryField?.address
//                 ? en["userFormPart.address.required"]
//                 : false,
//             })}
//             error={errors.userAddress}
//             label={en["userFormPart.address.label"]}
//             placeholder={en["userFormPart.address.placeholder"]}
//             containerClass="mt-0 tb:mt-0"
//             className="text-lg"
//             isMandatory={!!mandatoryField?.address}
//           />

//           <div className="flex gap-5 mb-4 mt-4">
//             <div className="w-1/2">
//               <Controller
//                 name="cityId"
//                 control={control}
//                 rules={{
//                   required: mandatoryField?.city
//                     ? en["userFormPart.city.required"]
//                     : undefined,
//                 }}
//                 render={({ field }) => (
//                   <FormSelect
//                     {...field}
//                     id="cityId"
//                     label={en["userFormPart.city.label"]}
//                     options={cityOptions}
//                     className="rounded-md py-2  tb:ps-2 h-full focus-visible:ring-0"
//                     containerClass="mt-0 tb:mt-0 self-stretch w-full"
//                     onChange={(event) => {
//                       const cityId = event.target.value;
//                       field.onChange(event); // Update RHF
//                       setValue("cityId", cityId);
//                     }}
//                     error={errors.cityId}
//                     isMandatory={!!mandatoryField?.city}
//                   />
//                 )}
//               />
//             </div>
//             <div className="w-1/2">
//               <Controller
//                 name="localityId"
//                 control={control}
//                 rules={{
//                   required: mandatoryField?.locality
//                     ? en["userFormPart.locality.required"]
//                     : undefined,
//                 }}
//                 render={({ field }) => (
//                   <FormSelect
//                     {...field}
//                     id="localityId"
//                     label={en["userFormPart.locality.label"]}
//                     options={localityOptions}
//                     className="rounded-md py-2  tb:ps-1 h-full focus-visible:ring-0"
//                     containerClass="mt-0 tb:mt-0 self-stretch w-full"
//                     onChange={(event) => {
//                       const localityId = event.target.value;
//                       field.onChange(event); // Update RHF
//                       setValue("localityId", localityId);
//                     }}
//                     error={errors.localityId}
//                     isMandatory={!!mandatoryField?.locality}
//                   />
//                 )}
//               />
//             </div>
//           </div>
//           <div className="flex gap-5 mb-4 mt-4">
//             <div className="w-1/2">
//               <span>{en["userFormPart.country.label"]}</span>
//               <p className="w-full rounded p-1 border border-dark-600/70 cursor-not-allowed select-none h-9">
//                 {locData?.countryName}
//               </p>
//             </div>
//             <div className="w-1/2">
//               <span>{en["userFormPart.state.label"]}</span>
//               <p className="w-full rounded p-1 border border-dark-600/70 cursor-not-allowed select-none h-9">
//                 {locData?.stateName}
//               </p>
//             </div>
//           </div>
//           <div className="flex gap-5 mb-4">
//             <div className="w-1/2">
//               <span>{en["userFormPart.district.label"]}</span>
//               <p className="w-full rounded p-1 border border-dark-600/70 cursor-not-allowed select-none h-9">
//                 {locData?.districtName}
//               </p>
//             </div>
//             <div className="w-1/2">
//               <span>{en["userFormPart.block.label"]}</span>
//               <p className="w-full rounded p-1 border border-dark-600/70 cursor-not-allowed select-none h-9">
//                 {locData?.blockName}
//               </p>
//             </div>
//           </div>
//         </div>
//       </FormProvider>
//     );
//   };

//   const Documentation = () => {
//     const { data: rdFields } = useGetLabel({
//       filter: {},
//     });

//     return (
//       <FormProvider {...methods}>
//         <div className="flex gap-6 w-full">
//           <div className="w-1/4">
//             <FormInputField
//               id="userRd1"
//               {...register("userRd1", {
//                 ...(validationObjFromValidationKey(
//                   rdFields?.data?.find(
//                     (item: { labelKey: string }) =>
//                       item.labelKey === "user_rd_1",
//                   )?.validationKey || "PAN",
//                   mandatoryField?.rd1,
//                 ) || {}),
//                 required: mandatoryField?.rd1
//                   ? "This Field is Required"
//                   : false,
//               })}
//               error={errors.userRd1}
//               label={
//                 rdFields?.data?.find(
//                   (item: { labelKey: string }) => item.labelKey === "user_rd_1",
//                 )?.labelName || "RD 1"
//               }
//               placeholder={
//                 rdFields?.data?.find(
//                   (item: { labelKey: string }) => item.labelKey === "user_rd_1",
//                 )?.labelName || "RD 1"
//               }
//               containerClass="mt-0 tb:mt-0"
//               className="text-lg"
//               isMandatory={mandatoryField?.rd1}
//             />
//           </div>
//           <div className="w-1/4">
//             <FormInputField
//               id="userRd2"
//               {...register("userRd2", {
//                 ...(validationObjFromValidationKey(
//                   rdFields?.data?.find(
//                     (item: { labelKey: string }) =>
//                       item.labelKey === "user_rd_2",
//                   )?.validationKey || "DL",
//                   mandatoryField?.rd2,
//                 ) || {}),
//                 required: mandatoryField?.rd2
//                   ? "This Field is Required"
//                   : false,
//               })}
//               error={errors.userRd2}
//               label={
//                 rdFields?.data?.find(
//                   (item: { labelKey: string }) => item.labelKey === "user_rd_2",
//                 )?.labelName || "RD 2"
//               }
//               placeholder={
//                 rdFields?.data?.find(
//                   (item: { labelKey: string }) => item.labelKey === "user_rd_2",
//                 )?.labelName || "RD 2"
//               }
//               containerClass="mt-0 tb:mt-0"
//               className="text-lg"
//               isMandatory={mandatoryField?.rd2}
//             />
//           </div>
//           <div className="w-1/4">
//             <FormInputField
//               id="userRd3"
//               {...register("userRd3", {
//                 ...(validationObjFromValidationKey(
//                   rdFields?.data?.find(
//                     (item: { labelKey: string }) =>
//                       item.labelKey === "user_rd_3",
//                   )?.validationKey || "PASPRT",
//                   mandatoryField?.rd3,
//                 ) || {}),
//                 required: mandatoryField?.rd3
//                   ? "This Field is Required"
//                   : false,
//               })}
//               error={errors.userRd3}
//               label={
//                 rdFields?.data?.find(
//                   (item: { labelKey: string }) => item.labelKey === "user_rd_3",
//                 )?.labelName || "RD 3"
//               }
//               placeholder={
//                 rdFields?.data?.find(
//                   (item: { labelKey: string }) => item.labelKey === "user_rd_3",
//                 )?.labelName || "RD 3"
//               }
//               containerClass="mt-0 tb:mt-0"
//               className="text-lg"
//               isMandatory={mandatoryField?.rd3}
//             />
//           </div>
//           <div className="w-1/4">
//             <FormInputField
//               id="userRd4"
//               {...register("userRd4", {
//                 ...(validationObjFromValidationKey(
//                   rdFields?.data?.find(
//                     (item: { labelKey: string }) =>
//                       item.labelKey === "user_rd_4",
//                   )?.validationKey || "AADHAAR",
//                   mandatoryField?.rd4,
//                 ) || {}),
//                 required: mandatoryField?.rd4
//                   ? "This Field is Required"
//                   : false,
//               })}
//               error={errors.userRd4}
//               label={
//                 rdFields?.data?.find(
//                   (item: { labelKey: string }) => item.labelKey === "user_rd_4",
//                 )?.labelName || "RD 4"
//               }
//               placeholder={
//                 rdFields?.data?.find(
//                   (item: { labelKey: string }) => item.labelKey === "user_rd_4",
//                 )?.labelName || "RD 4"
//               }
//               containerClass="mt-0 tb:mt-0"
//               className="text-lg"
//               isMandatory={mandatoryField?.rd4}
//             />
//           </div>
//         </div>
//       </FormProvider>
//     );
//   };

//   const Bio = () => {
//     return (
//       <FormProvider {...methods}>
//         <div>
//           <label htmlFor="userAbout" className="font-semibold">
//             {en["imageAndAboutPart.about.label"]}
//           </label>
//           <FormTextarea
//             id="aboutMe"
//             {...register("aboutMe", {
//               required:
//                 !!mandatoryField?.aboutMe && "Please enter user about details",
//             })}
//             error={errors.aboutMe}
//             containerClass="h-full"
//             className="p-0 h-full border focus:ring-0"
//             placeholder="Enter User About Details"
//           />
//         </div>
//       </FormProvider>
//     );
//   };

//   return {
//     stepNames,
//     BasicDetails,
//     onSubmit,
//     ContactInformation,
//     Address,
//     Documentation,
//     Bio,
//     userPreview: getValues(),
//     trigger,
//     isModalOpen,
//     handleClose,
//     onFinish,
//     userId,
//   };
// }
