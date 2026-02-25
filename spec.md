# Specification

## Summary
**Goal:** Add role-based proof file visibility controls and an Admin-only Proof Review Panel to the Yesfour Infra Task Management application.

**Planned changes:**
- Update the Motoko backend task data model to store `proofFile` (safe relative URL/key), `submittedByName`, `submittedByEmail`, and `submissionTimestamp` fields on task records.
- On proof upload, automatically set task status to Blue and `approvalStatus` to `#pendingReview` in the backend.
- Add a backend query `getProofForTask(taskId)` that enforces role/ownership checks, returning `#unauthorized` for ineligible callers (only Admin or the assigned employee may access proof fields).
- Ensure all task query responses omit/null proof fields for callers who are not Admin or the task's own assignee.
- On the Employee Dashboard, show proof file preview/link and a "Pending Review" badge only on the employee's own task cards; hide all proof data for tasks assigned to other employees.
- On the Admin Dashboard All Tasks view, add per-task: a blue "Proof Uploaded" badge, a "View Proof" button (opens image/PDF preview modal or new tab), a "Download Proof" link, a formatted Submission Timestamp, and a "Submitted By" field (name + email) — all hidden from Manager and Employee roles.
- Add an Admin-only Proof Review Panel in the Admin task expanded/detail view showing: employee name, file preview (thumbnail or PDF icon), upload date/time, an Approve button, and a Reject button that opens a modal requiring a rejection reason before submission.
- Add three approval status badges visible only to Admin: blue "Proof Uploaded" (`#pendingReview`), green "Approved" (`#approved`), red "Rejected" (`#rejected`).
- Add a `getProofForTask` React Query hook in `useQueries.ts` that is only invoked from Admin task views or the employee's own task card; silently suppress the proof section if the backend returns `#unauthorized`.
- Ensure no proof URLs are stored in the global query cache in a way accessible to Manager or other Employee components.

**User-visible outcome:** Admins can view, preview, download, approve, and reject uploaded proof files from a dedicated Proof Review Panel in the task detail view, with clear status badges. Employees see only their own proof and a "Pending Review" badge after uploading. Managers and other employees see no proof-related data at any point.
