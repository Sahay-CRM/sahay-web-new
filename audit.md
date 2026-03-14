# Technical Audit: Duplicate Form Submission Issue

This document provides a full technical audit of the sahay-web-new project regarding the duplicate form submission issue reported.

## 1. Executive Summary
The audit has identified a **primary race condition in the frontend** and a **lack of safety constraints on the backend** as the dual causes for duplicate records. Users clicking the "Submit" button multiple times, or network delays during the screenshot/upload phase, allow the submission logic to trigger multiple times before the UI can successfully lock itself.

---

## 2. Frontend Audit Results

### Findings:
- **Submit Button State:** The button in `FormQuestions.tsx` is disabled based on `isSubmittingForm`. However, this state variable only becomes `true` at the very end of the `handleSubmit` function.
- **Async Execution Path:** The `handleSubmit` function in `useFormPreviewPage.ts` is `async` and performs several high-latency tasks **before** the API call:
    1.  Field level validation.
    2.  Screenshot capture (Awaiting `imgCapture.grabFrame()` and `canvas.toBlob`).
    3.  Multi-file uploads to AWS/Storage.
- **Vulnerability:** During these async steps (which can take 1-3 seconds), the button remains **clickable**. If a user double-clicks, two or more instances of `handleSubmit` run concurrently.

### The "Empty Name" Mystery
- **Evidence:** Record `8d1ed5da...` has a missing `name` but the same `mobile_number`.
- **Reason:** In `useFormPreviewPage.ts`, the `onSuccess` handler of the first successful submission clears the local storage (`localStorage.removeItem`). If the second (duplicate) request is still in flight or starts just as the session is being wiped, the `nameRef.current` or `verifiedName` state may be lost or nullified during the component unmounting/cleanup process, resulting in an empty string being sent to the backend.

---

## 3. Backend & API Investigation

### Findings:
- **Lack of Idempotency:** The `/company/form/submission/submit` endpoint does not verify if a submission with the same `form_id` and `mobile_number` already exists before processing.
- **Database Weakness:** There is currently no **Unique Composite Constraint** on the database level for the pair `(form_id, mobile_number)`.
- **Backend Validation:** The backend allows multiple `POST` requests for the same user identity without restriction, trusting the frontend to manage the flow.

---

## 4. Root Cause Summary
| Component | Issue | Impact |
| :--- | :--- | :--- |
| **Frontend** | Race Condition in `handleSubmit` | Multiple API calls triggered by double-clicks. |
| **Frontend** | UI Disabling Delay | Button remains active during async processing. |
| **Backend** | Missing Logic Guard | Duplicate submissions are accepted as new entries. |
| **Database** | No Unique Index | No final safety net to reject duplicate data. |

---

## 5. Recommended Fixes

### Phase 1: Frontend (Immediate)
1.  **Double-Click Protection:** Add a `useRef` guard to `useFormPreviewPage.ts` to block concurrent executions.
    ```typescript
    const isProcessing = useRef(false);
    // Inside handleSubmit:
    if (isProcessing.current) return;
    isProcessing.current = true;
    try { ... } finally { isProcessing.current = false; }
    ```
2.  **Instant UI Lock:** Use a local state in `FormQuestions.tsx` to disable the button immediately upon the first click, rather than waiting for the API mutation state.

### Phase 2: Backend (Critical)
1.  **Duplicate Check:** Modify the submission controller to check for existing records:
    ```sql
    SELECT id FROM submissions WHERE form_id = ? AND mobile_number = ? AND status = 'SUBMITTED'
    ```
2.  **DB Constraint:** Create a unique index:
    ```sql
    CREATE UNIQUE INDEX idx_unique_submission ON submissions (form_id, mobile_number);
    ```

---

## 6. Best Practices Checklist
- [ ] Always disable submit buttons **synchronously** as the first line of code in the click handler.
- [ ] Implement backend idempotency using request hashes or unique user keys.
- [ ] Ensure database integrity with appropriate unique constraints.
- [ ] Handle "already submitted" errors gracefully on the frontend.
