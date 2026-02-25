# Specification

## Summary
**Goal:** Add an Admin-only Users List section to the existing Admin Dashboard with full user management capabilities, statistics, and search/filter controls.

**Planned changes:**
- Add a backend query (Admin-only) that returns all registered users with aggregated stats: total tasks assigned, tasks completed, and performance points — never exposing password or credential fields
- Add backend mutations (Admin-only) for updating a user's role, toggling account status (Active/Inactive), and deleting a user record
- Add a "Users" sidebar menu item in the Admin Dashboard visible only to Admin role; hidden for Manager and Employee roles
- Create a Users List page with a paginated table (10 per page) showing columns: Serial Number, Full Name, Email, Role, Department, Total Tasks Assigned, Tasks Completed, Performance Points, and Account Status badge
- Add per-row action controls: Edit Role (modal/dropdown), Activate/Deactivate toggle, and Delete with confirmation dialog
- Add search input (filter by name or email) and dropdown filters for Role and Department above the table; changing any filter resets to page 1
- Add a summary strip of four stat cards at the top of the Users List page: Total Users, Total Active Users, Total Managers, Total Employees
- Style the entire Users List page with the existing white + green (#2E7D32) corporate theme, responsive layout, no chat or messaging elements

**User-visible outcome:** Admins can navigate to a "Users" section in the Admin Dashboard to view, search, filter, and manage all registered users — editing roles, toggling account status, and deleting users — while Managers and Employees see no trace of this section.
