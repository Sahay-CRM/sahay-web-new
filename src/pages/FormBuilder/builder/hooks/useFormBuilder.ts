import { useCallback, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useCreateForm, useGetForm, useUpdateForm } from "@/features/api/Form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { queryClient } from "@/queryClient";

// Helper: parse options from API string → Option[]
function parseOptions(raw: unknown): Option[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    return raw
      .split(",")
      .filter((s) => s.trim())
      .map((s, i) => ({ id: `opt-${i}`, text: s.trim() }));
  }
  return [];
}

// Helper: parse formSettings from API array → flat object
function parseApiSettings(raw: unknown): Partial<FormSettings> {
  if (!raw) return {};
  if (Array.isArray(raw)) {
    return raw.reduce(
      (acc, item: { key: string; value: string }) => {
        let parsed: string | boolean | number = item.value;
        if (item.value === "true") parsed = true;
        else if (item.value === "false") parsed = false;
        else if (!isNaN(Number(item.value)) && item.value !== "")
          parsed = Number(item.value);
        acc[item.key] = parsed;
        return acc;
      },
      {} as Record<string, unknown>,
    );
  }
  if (typeof raw === "object") return raw as Partial<FormSettings>;
  return {};
}

const defaultFormValues: FormDetails = {
  id: "",
  name: "",
  description: "",
  notificationEmail: "",
  isActive: false,
  visibility: "PUBLIC",
  mobileNumbers: [],
  fields: [],
  formSettings: {} as unknown as FormSettings,
  responseMessage: "",
  expireDate: undefined,
};

export default function useFormBuilder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const formId = searchParams.get("id") || "";

  // Fields managed separately (react-hook-form doesn't handle nested arrays well)
  const [fields, setFields] = useState<Question[]>([]);

  const { data: fetchedForm, isFetching } = useGetForm(formId);
  const { mutate: createForm, isPending: isCreating } = useCreateForm();
  const { mutate: updateForm, isPending: isUpdating } = useUpdateForm();

  const {
    register,
    watch,
    reset,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm<FormDetails>({
    defaultValues: defaultFormValues,
  });

  // Populate form when data arrives
  useEffect(() => {
    if (fetchedForm?.data) {
      const d = fetchedForm.data;
      reset({
        ...defaultFormValues,
        ...d,
        formSettings: {
          ...({} as FormSettings),
          ...parseApiSettings(d.formSettings),
        },
      });
      // Parse fields separately
      const parsedFields: Question[] = (d.fields || []).map(
        (f: Question & { options?: unknown; QUESTION?: string }) => ({
          ...f,
          label: f.label || f.QUESTION || "",
          options: parseOptions(f.options),
        }),
      );
      setFields(
        parsedFields.length > 0
          ? parsedFields
          : [
              {
                id: `q-${Date.now()}`,
                name: "field_1",
                label: "",
                fieldType: "TEXT",
                isRequired: false,
                order: 1,
                placeholder: "",
                options: [],
              },
            ],
      );
    } else if (!formId) {
      reset(defaultFormValues);
      setFields([
        {
          id: `q-${Date.now()}`,
          name: "field_1",
          label: "",
          fieldType: "TEXT",
          isRequired: false,
          order: 1,
          placeholder: "",
          options: [],
        },
      ]);
    }
  }, [fetchedForm, formId, reset]);

  // Build the API payload from form values + fields
  const buildPayload = () => {
    const values = getValues();
    return {
      ...values,
      fields: fields.map((f) => ({
        ...f,
        isMcq: f.fieldType === "QUESTION",
        options: Array.isArray(f.options)
          ? f.options.map((o: Option) => o.text).join(",")
          : f.options || "",
      })),
    };
  };

  const [triedSaving, setTriedSaving] = useState(false);

  const onSave = handleSubmit(() => {
    setTriedSaving(true);
    const emptyFields = fields.filter((f) => !f.label || !f.label.trim());
    if (emptyFields.length > 0) {
      return;
    }

    // Validate that MCQ questions have a correct answer
    const mcqWithoutAnswer = fields.filter(
      (f) =>
        f.fieldType === "QUESTION" &&
        (!f.correctAnswer ||
          (Array.isArray(f.correctAnswer) && f.correctAnswer.length === 0)),
    );
    if (mcqWithoutAnswer.length > 0) {
      return;
    }

    const payload = buildPayload();

    if (formId) {
      updateForm(
        { id: formId, data: payload as unknown as Partial<FormDetails> },
        {
          onSuccess: () => {
            setTriedSaving(false);
            queryClient.invalidateQueries({
              queryKey: ["get-form-by-id", formId],
            });
          },
        },
      );
    } else {
      createForm(payload as unknown as Partial<FormDetails>, {
        onSuccess: (res) => {
          setTriedSaving(false);
          const newId = res?.data?.id;
          if (newId)
            navigate(`/dashboard/form-builder?id=${newId}`, { replace: true });
        },
      });
    }
  });

  // ---------- Field operations (local useState) ----------

  const reorder = (arr: Question[]) =>
    arr.map((q, i) => ({ ...q, order: i + 1 }));

  const addQuestion = useCallback(
    (afterQuestionId?: string, fieldType: FieldType = "TEXT") => {
      const newQ: Question = {
        id: `q-${Date.now()}`,
        name: `field_${Date.now()}`,
        label: "",
        fieldType,
        isRequired: false,
        order: 0,
        placeholder: "",
        options: ["RADIO", "CHECKBOX", "SELECT", "QUESTION"].includes(fieldType)
          ? [
              { id: `opt-${Date.now()}-1`, text: "" },
              { id: `opt-${Date.now()}-2`, text: "" },
            ]
          : [],
      };
      setFields((prev) => {
        const idx = afterQuestionId
          ? prev.findIndex((q) => q.id === afterQuestionId)
          : prev.length - 1;
        const next = [...prev];
        next.splice(idx + 1, 0, newQ);
        return reorder(next);
      });
    },
    [],
  );

  const updateQuestion = useCallback(
    (questionId: string, updates: Partial<Question>) => {
      setFields((prev) =>
        prev.map((q) => {
          if (q.id !== questionId) return q;

          const newUpdates = { ...updates };

          // If changing FROM QUESTION to something else, clear correctAnswer
          if (
            q.fieldType === "QUESTION" &&
            updates.fieldType &&
            updates.fieldType !== "QUESTION"
          ) {
            newUpdates.correctAnswer = undefined;
          }

          // If changing TO a choice field and it has no options, add 2 defaults
          if (
            updates.fieldType &&
            ["RADIO", "CHECKBOX", "SELECT", "QUESTION"].includes(
              updates.fieldType,
            ) &&
            (!q.options || q.options.length === 0)
          ) {
            newUpdates.options = [
              { id: `opt-${Date.now()}-1`, text: "" },
              { id: `opt-${Date.now()}-2`, text: "" },
            ];
          }

          return { ...q, ...newUpdates };
        }),
      );
    },
    [],
  );

  const deleteQuestion = useCallback((questionId: string) => {
    setFields((prev) => reorder(prev.filter((q) => q.id !== questionId)));
  }, []);

  const duplicateQuestion = useCallback((questionId: string) => {
    setFields((prev) => {
      const idx = prev.findIndex((q) => q.id === questionId);
      if (idx === -1) return prev;
      const dupe: Question = {
        ...JSON.parse(JSON.stringify(prev[idx])),
        id: `q-${Date.now()}`,
        name: `field_copy_${Date.now()}`,
      };
      const next = [...prev];
      next.splice(idx + 1, 0, dupe);
      return reorder(next);
    });
  }, []);

  const moveQuestion = useCallback((activeId: string, overId: string) => {
    setFields((prev) => {
      const oldIdx = prev.findIndex((q) => q.id === activeId);
      const newIdx = prev.findIndex((q) => q.id === overId);
      if (oldIdx === -1 || newIdx === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(oldIdx, 1);
      next.splice(newIdx, 0, moved);
      return reorder(next);
    });
  }, []);

  const addOption = useCallback((questionId: string) => {
    setFields((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        const opts = q.options || [];
        return {
          ...q,
          options: [...opts, { id: `opt-${Date.now()}`, text: "" }],
        };
      }),
    );
  }, []);

  const updateOption = useCallback(
    (questionId: string, optionId: string, text: string) => {
      setFields((prev) =>
        prev.map((q) => {
          if (q.id !== questionId) return q;
          return {
            ...q,
            options: (q.options || []).map((o) =>
              o.id === optionId ? { ...o, text } : o,
            ),
          };
        }),
      );
    },
    [],
  );

  const deleteOption = useCallback((questionId: string, optionId: string) => {
    setFields((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;

        const deletedOption = q.options?.find((o) => o.id === optionId);
        const nextOptions = (q.options || []).filter((o) => o.id !== optionId);

        let nextCorrectAnswer = q.correctAnswer;
        if (deletedOption && q.correctAnswer) {
          if (Array.isArray(q.correctAnswer)) {
            nextCorrectAnswer = q.correctAnswer.filter(
              (v) => v !== deletedOption.text,
            );
          } else if (q.correctAnswer === deletedOption.text) {
            nextCorrectAnswer = undefined;
          }
        }

        return {
          ...q,
          options: nextOptions,
          correctAnswer: nextCorrectAnswer,
        };
      }),
    );
  }, []);

  const formValues = watch();

  return {
    // Form values (for header, status, etc.)
    formData: { ...formValues, fields },
    formId,
    isFetching,
    isSaving: isCreating || isUpdating,
    // react-hook-form helpers
    register,
    watch,
    setValue,
    errors,
    onSave,
    triedSaving,
    // Field operations
    fields,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    duplicateQuestion,
    moveQuestion,
    addOption,
    updateOption,
    deleteOption,
  };
}
