import { useForm } from "react-hook-form";
import { useState, useEffect, useCallback } from "react";
import { useGetCompanyProject } from "@/features/api/companyProject";
import {
  // useGetAllTaskStatus,
  useDdTaskType,
  addUpdateRepeatCompanyTaskMutation,
} from "@/features/api/companyTask";
import { getEmployee } from "@/features/api/companyEmployee";
import { useNavigate, useParams } from "react-router-dom";
import { useGetCompanyMeeting } from "@/features/api/companyMeeting";
import { useSelector } from "react-redux";
import { getUserPermission } from "@/features/selectors/auth.selector";
import useGetRepeatCompanyTaskById from "@/features/api/companyTask/useGetRepeatCompanyTaskById";

interface FormValues {
  // taskId?: string;
  repetitiveTaskId?: string;
  project?: CompanyProjectDataProps | string | null;
  taskName: string;
  taskDescription: string;
  taskStartDate: Date | null;
  taskDeadline: Date | null;
  repeatType: string;
  taskStatusId?: string;
  isActive?: boolean | string;
  taskTypeId?: string;
  meeting?: CompanyMeetingDataProps | string | null;
  assignUser: EmployeeDetails[];
  comment?: string;
}

// Renamed hook
export const useAddCompanyTask = (taskDeadline?: string | Date) => {
  const { mutate: addUpdateTask, isPending } =
    addUpdateRepeatCompanyTaskMutation();
  const { id: repetitiveTaskId } = useParams();
  const { data: taskDataById } = useGetRepeatCompanyTaskById(
    repetitiveTaskId || "",
  );

  const permission = useSelector(getUserPermission);
  const navigate = useNavigate();
  const [isModalOpen, setModalOpen] = useState(false);
  const methods = useForm<FormValues>({
    defaultValues: {
      // taskId: "",
      repetitiveTaskId: "",
      project: "",
      taskName: "",
      taskDescription: "",
      taskStartDate: null,
      taskDeadline: null,
      repeatType: "",
      taskStatusId: "",
      isActive: undefined,
      taskTypeId: "",
      assignUser: [],
      comment: "",
    },

    mode: "onChange",
  });
  const { reset, trigger, getValues } = methods;
  const { data: taskTypeData, isLoading: typeLoading } = useDdTaskType();
  const [paginationFilterEmployee, setPaginationFilterEmployee] =
    useState<PaginationFilter>({
      currentPage: 1,
      pageSize: 25,
      search: "",
    });
  const [paginationFilterProject, setPaginationFilterProject] =
    useState<PaginationFilter>({
      currentPage: 1,
      pageSize: 25,
      search: "",
    });
  const [paginationFilterMeeting, setPaginationFilterMeeting] =
    useState<PaginationFilter>({
      currentPage: 1,
      pageSize: 25,
      search: "",
    });
  const { data: employeedata, isLoading: employeeLoading } = getEmployee({
    filter: { ...paginationFilterEmployee, isDeactivated: false },
  });
  const { data: projectListdata, isLoading: projectLoading } =
    useGetCompanyProject({
      filter: paginationFilterProject,
      enable: !!paginationFilterProject,
    });
  const { data: meetingData, isLoading: meetingLoading } = useGetCompanyMeeting(
    {
      filter: paginationFilterMeeting,
    },
  );

  useEffect(() => {
    if (
      repetitiveTaskId &&
      taskDataById?.data &&
      projectListdata &&
      meetingData &&
      employeedata
    ) {
      // Safely parse the taskDeadline string into a Date object
      const deadlineString = taskDataById.data.taskDeadline;
      const taskDeadlineDate = deadlineString ? new Date(deadlineString) : null;

      // Check if the date is valid before setting it
      const validTaskDeadline =
        taskDeadlineDate && !isNaN(taskDeadlineDate.getTime())
          ? taskDeadlineDate
          : null;
      const employeeIds = taskDataById?.data?.employeeIds ?? [];
      reset({
        repetitiveTaskId: taskDataById.data.repetitiveTaskId || "",
        project:
          projectListdata?.data?.find(
            (p) => p.projectId === taskDataById.data?.projectId,
          ) || null,
        meeting:
          meetingData?.data?.find(
            (p) => p.meetingId === taskDataById.data?.meetingId,
          ) || null,
        taskName: taskDataById.data.taskName || "",
        taskDescription: taskDataById.data.taskDescription || "",
        taskStartDate: taskDataById.data.taskStartDate
          ? new Date(taskDataById.data.taskStartDate)
          : null,

        // Use the validated date here
        taskDeadline: validTaskDeadline,

        repeatType: taskDataById.data.repeatType || "",
        isActive: taskDataById.data.isActive ? "active" : "inactive",
        taskTypeId: taskDataById.data.taskTypeId || "",
        assignUser:
          employeedata?.data?.filter((emp) =>
            employeeIds.includes(emp.employeeId),
          ) ?? [],
      });
    }
  }, [
    taskDataById,
    reset,
    repetitiveTaskId,
    projectListdata,
    meetingData,
    employeedata,
  ]);

  const [step, setStep] = useState(1);

  // const { data: taskStatus, isLoading: statusLoading } = useGetAllTaskStatus({
  //   filter: {},
  // });

  // const taskStatusOptions = taskStatus
  //   ? taskStatus.data.map((status) => ({
  //       label: status.taskStatus,
  //       value: status.taskStatusId,
  //     }))
  //   : [];
  const taskStatusOptions = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
  ];

  const taskTypeOptions = taskTypeData
    ? taskTypeData.data.map((status) => ({
        label: status.taskTypeName,
        value: status.taskTypeId,
      }))
    : [];

  const getDayName = (date: Date) =>
    date.toLocaleDateString("en-US", { weekday: "long" });
  function getOrdinalWeekday(date: Date) {
    const day = date.getDay();
    const dateOfMonth = date.getDate();
    const lastDateOfMonth = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0,
    ).getDate();

    const weekdayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const ordinals = ["first", "second", "third", "fourth", "fifth"];

    // Calculate week number in month (1-based)
    const weekNumber = Math.ceil(dateOfMonth / 7);

    // Check if date is in the last week of the month
    const daysLeftInMonth = lastDateOfMonth - dateOfMonth;
    const isLastWeek = daysLeftInMonth < 7;

    const ordinalLabel = isLastWeek ? "last" : ordinals[weekNumber - 1];

    return `${ordinalLabel} ${weekdayNames[day]}`;
  }

  // Format options dynamically based on taskDeadline
  let repetitionOptions = [{}];

  if (taskDeadline) {
    try {
      const dateObj = new Date(taskDeadline);
      const dayName = getDayName(dateObj);
      const ordinalWeekday = getOrdinalWeekday(dateObj);
      const lastDateOfMonth = new Date(
        dateObj.getFullYear(),
        dateObj.getMonth() + 1,
        0,
      ).getDate();

      const dateOfMonth = dateObj.getDate();
      const daysLeftInMonth = lastDateOfMonth - dateOfMonth;
      const isLastWeek = daysLeftInMonth < 7;
      const monthName = dateObj.toLocaleDateString("en-US", { month: "long" }); // e.g., "March"
      const isLastDayOfMonth = dateOfMonth === lastDateOfMonth;

      repetitionOptions = [
        { value: "DAILY", label: "Daily" },
        { value: "DAILYALTERNATE", label: "Daily (Every Other Day)" },
        { value: "WEEKLY", label: `Weekly on ${dayName}` },
        // Conditionally include only one of these two:
        ...(isLastWeek
          ? [
              {
                value: "MONTHLYLASTWEEKDAY",
                label: `Monthly on the last ${dayName}`,
              },
            ]
          : [
              {
                value: "MONTHLYNWEEKDAY",
                label: `Monthly on the ${ordinalWeekday}`,
              },
            ]),
        {
          value: "MONTHLYDATE",
          label: `Monthly on the ${getOrdinalDate(dateOfMonth)} date `,
        },
        ...(isLastDayOfMonth
          ? [
              {
                value: "MONTHLYEOM",
                label: `Monthly on the last day (${getOrdinalDate(lastDateOfMonth)})`,
              },
            ]
          : []),

        {
          value: "YEARLYXMONTHDATE",
          label: `Yearly on ${monthName} ${getOrdinalDate(dateOfMonth)}`, // Yearly - Date (e.g., March 14th)
        },
        ...(!isLastDayOfMonth
          ? [
              {
                value: "YEARLYXMONTHNWEEKDAY",
                label: `Yearly on the ${ordinalWeekday} of ${monthName}  `,
              },
            ]
          : []),
        ...(isLastDayOfMonth
          ? [
              {
                value: "YEARLYXMONTHLASTWEEKDAY",
                label: `Yearly on the last ${dayName} of ${monthName}  `,
              },
            ]
          : []),
      ];
    } catch {
      // fallback if invalid date
      repetitionOptions = [];
    }
  } else {
    repetitionOptions = [];
  }

  // Helper to get ordinal string for day (1st, 2nd, 3rd...)
  function getOrdinalDate(n: number) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  const steps = ["Project", "Meeting", "Basic Info", "Assign User"];

  // Define required and optional fields for each step
  const stepFieldConfig: Record<
    number,
    { required: (keyof FormValues)[]; optional: (keyof FormValues)[] }
  > = repetitiveTaskId
    ? {
        1: { required: ["project"], optional: [] },
        2: { required: ["meeting"], optional: [] },
        3: {
          required: [
            "taskName",
            "taskDescription",
            "repeatType",
            "taskDeadline",
            "isActive",
            "taskStatusId",
            "taskTypeId",
          ],
          optional: ["taskStartDate"],
        },
        // Adjusted step numbers to be contiguous for array indexing if needed,
        // but direct object key access is fine.
        4: { required: ["assignUser"], optional: [] }, // Was 7
      }
    : {
        1: { required: ["project"], optional: [] },
        2: { required: ["meeting"], optional: [] },
        3: {
          required: [
            "taskName",
            "taskDescription",
            "repeatType",
            "taskDeadline",
            "isActive",
            "taskStatusId",
            "taskTypeId",
          ],
          optional: ["taskStartDate"],
        },
        4: { required: ["assignUser"], optional: [] }, // Was 7
        5: { required: [], optional: ["comment"] }, // Was 8
      };

  const validateStep = async (): Promise<boolean> => {
    const currentStepConfig = stepFieldConfig[step];
    if (!currentStepConfig) return true;

    // Clear previous errors for optional fields
    currentStepConfig.optional.forEach((field) => {
      methods.clearErrors(field);
    });

    // Only validate required fields for the current step
    if (currentStepConfig.required.length === 0) {
      return true; // No required fields, step is valid
    }

    return methods.trigger(currentStepConfig.required);
  };

  const nextStep = async () => {
    if (await validateStep()) {
      setStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };
  const onFinish = useCallback(async () => {
    const isValid = await trigger();
    if (isValid) {
      setModalOpen(true);
    }
  }, [trigger]);

  const onSubmit = async (data: FormValues) => {
    const isActiveValue =
      typeof data?.isActive === "string"
        ? data.isActive === "active"
        : !!data.isActive;

    const assigneeIds =
      (data.assignUser as unknown as { employeeId: string }[])?.map(
        (user) => user.employeeId,
      ) ?? [];

    const payload = data.repetitiveTaskId
      ? {
          repetitiveTaskId: repetitiveTaskId,
          taskName: data.taskName,
          taskDescription: data.taskDescription,
          taskStartDate: data.taskStartDate
            ? new Date(data.taskStartDate)
            : null,
          taskDeadline: data.taskDeadline ? new Date(data.taskDeadline) : null,
          taskStatusId: data?.taskStatusId,
          isActive: isActiveValue,

          taskTypeId: data?.taskTypeId,
          comment: data.comment,
          employeeIds: assigneeIds,
          projectId:
            (data.project as unknown as { projectId: string })?.projectId ??
            null,
          meetingId:
            (data.meeting as unknown as { meetingId: string })?.meetingId ??
            null,

          repeatType: data.repeatType.toUpperCase(),
        }
      : {
          taskName: data.taskName,
          taskDescription: data.taskDescription,
          taskStartDate: data.taskStartDate
            ? new Date(data.taskStartDate)
            : null,
          taskDeadline: data.taskDeadline ? new Date(data.taskDeadline) : null,
          taskStatusId: data?.taskStatusId,
          isActive: isActiveValue,

          taskTypeId: data?.taskTypeId,
          comment: data.comment,
          employeeIds: assigneeIds,
          projectId:
            (data.project as unknown as { projectId: string })?.projectId ??
            null,
          meetingId:
            (data.meeting as unknown as { meetingId: string })?.meetingId ??
            null,
          repeatType: data.repeatType.toUpperCase(),
        };

    addUpdateTask(payload, {
      onSuccess: () => {
        navigate("/dashboard/tasksrepeat");
      },
    });
  };
  const handleClose = () => setModalOpen(false);
  return {
    step,
    steps,
    nextStep,
    prevStep,
    onSubmit,
    methods,
    repetitionOptions,
    employeedata,
    projectListdata,
    setPaginationFilterEmployee,
    setPaginationFilterProject,
    setPaginationFilterMeeting,
    meetingData,
    repetitiveTaskId,
    taskStatusOptions,
    taskTypeOptions,
    permission,
    paginationFilterProject,
    paginationFilterEmployee,
    paginationFilterMeeting,
    isPending,
    taskDataById,
    projectLoading,
    // statusLoading,
    typeLoading,
    employeeLoading,
    meetingLoading,
    onFinish,
    isModalOpen,
    handleClose,
    taskpreviewData: getValues(),
  };
};
