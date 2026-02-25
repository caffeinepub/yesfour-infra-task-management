# Specification

## Summary
**Goal:** Add a proof upload and admin review workflow to the Yesfour Infra Task Manager, allowing employees to submit proof files for completed tasks and admins to approve or reject them.

**Planned changes:**
- Extend the Task data model in the Motoko backend to include optional fields: `proofFile`, `submittedAt`, `reviewedAt`, `reviewComment`, and `finalStatus`
- Add `uploadProof` mutation in the backend: only the assigned employee can call it; stores proof file, sets status to Blue (Pending Review)
- Add `markComplete` mutation in the backend: only the assigned employee can call it after uploading proof; confirms the task as pending review
- Add `adminReviewTask` mutation in the backend: Admin-only; approves (sets status Green, awards +10 or -5 performance points) or rejects (requires review comment, sets status Yellow) a task
- Restrict proof-related fields in query responses so only Admins and the assigned employee can see them
- Add proof upload button and "Mark as Completed" button to Employee Dashboard task cards (visible on Yellow/Rejected tasks); show uploaded proof as inline link/thumbnail; update status badge to Blue after submission
- Add Admin-only Proof Review Panel to task cards on the Admin Dashboard showing employee name, submission time, proof preview, "Approve" and "Mark Incomplete" buttons; "Mark Incomplete" opens a modal requiring a non-empty review comment; update status badge after action
- Add `useUploadProof`, `useMarkComplete`, and `useAdminReviewTask` mutation hooks in `useQueries.ts`, each invalidating task list queries on success

**User-visible outcome:** Employees can upload proof files and mark tasks as completed, triggering a Pending Review status. Admins can review submitted proofs and approve or reject them with comments, updating task statuses and performance points accordingly.
