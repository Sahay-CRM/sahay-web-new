import React, { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { QuestionCard } from "./QuestionCard";
// import { FloatingToolbar } from './FloatingToolbar';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface QuestionsTabProps {
  form: FormDetails;
  updateName: (name: string) => void;
  updateDescription: (description: string) => void;
  updateQuestion: (questionId: string, updates: Partial<Question>) => void;
  deleteQuestion: (questionId: string) => void;
  duplicateQuestion: (questionId: string) => void;
  moveQuestion: (activeId: string, overId: string) => void;
  addOption: (questionId: string) => void;
  updateOption: (questionId: string, optionId: string, text: string) => void;
  deleteOption: (questionId: string, optionId: string) => void;
}

export const QuestionsTab: React.FC<QuestionsTabProps> = ({
  form,
  updateName,
  updateDescription,
  updateQuestion,
  deleteQuestion,
  duplicateQuestion,
  moveQuestion,
  addOption,
  updateOption,
  deleteOption,
}) => {
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  // const [toolbarStyle, setToolbarStyle] = useState<React.CSSProperties>({ top: '200px', left: '0px' });
  const questionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      moveQuestion(active.id as string, over.id as string);
    }
  };

  const prevFieldsCount = useRef(form.fields.length);

  useEffect(() => {
    if (form.fields.length > prevFieldsCount.current) {
      // A new field was added (likely at the end or after another field)
      // We want to scroll to the most recently added field
      // The last one in the array is usually the newly added one if added via button,
      // but if added 'after' a field, we should ideally find it.
      // For now, scrolling to the last field as requested.
      const lastField = form.fields[form.fields.length - 1];
      if (lastField) {
        setTimeout(() => {
          const element = questionRefs.current[lastField.id];
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            setActiveQuestionId(lastField.id);
          }
        }, 100);
      }
    }
    prevFieldsCount.current = form.fields.length;
  }, [form.fields.length, form.fields]);

  return (
    <div className="max-w-4xl mx-auto py-3 px-4 form-container relative">
      <Card
        id="title-card"
        className="p-4 mb-3 border-t-4 border-t-[#2f328e] rounded-lg shadow-sm"
        onClick={() => setActiveQuestionId(null)}
      >
        <div className="space-y-4">
          <Input
            value={form.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateName(e.target.value)
            }
            className="text-3xl font-normal border-none border-b border-transparent hover:border-b-gray-200 focus:border-b-[#2f328e] bg-transparent rounded-none px-0 h-auto focus-visible:ring-0 transition-colors"
            placeholder="Untitled form"
          />
          <Textarea
            value={form.description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              updateDescription(e.target.value)
            }
            className="text-sm border-none border-b border-transparent hover:border-b-gray-200 focus:border-b-[#2f328e] bg-transparent rounded-none px-0 py-1 min-h-[40px] resize-none focus-visible:ring-0 transition-colors"
            placeholder="Form description"
          />
        </div>
      </Card>

      {/* <FloatingToolbar
                onAddQuestion={() => addQuestion(activeQuestionId || undefined)}
                style={toolbarStyle}
            /> */}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={form.fields.map((q) => q.id)}
          strategy={verticalListSortingStrategy}
        >
          {(form.fields || []).map((question) => (
            <div
              key={question.id}
              ref={(el) => {
                questionRefs.current[question.id] = el;
              }}
            >
              <QuestionCard
                question={question}
                isActive={activeQuestionId === question.id}
                onActivate={() => setActiveQuestionId(question.id)}
                onUpdate={(updates) => updateQuestion(question.id, updates)}
                onDelete={() => deleteQuestion(question.id)}
                onDuplicate={() => duplicateQuestion(question.id)}
                onAddOption={() => addOption(question.id)}
                onUpdateOption={(optId, text) =>
                  updateOption(question.id, optId, text)
                }
                onDeleteOption={(optId) => deleteOption(question.id, optId)}
              />
            </div>
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
};
