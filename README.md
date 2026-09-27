# RICA Attendance Tracking — Frontend Update

This update preserves the existing RICA visual language and page structure while adding the requested organization-grade frontend workflows.

## Implemented
- Four role boundaries aligned to the RICA User Roles & Activity Specification.
- Login by assigned Gmail/work email **or exact account name**, plus password.
- Admin-created users with initial passwords.
- Admin password reset for any user.
- Admin account deletion; deleted accounts are removed from the frontend account store and cannot authenticate.
- Browser-local persistence for users, account session, attendance imports, reports, leaves, configuration, and audit data.
- Excel `.xls` / `.xlsx` import remains Admin-only.
- Dashboard KPI cards use percentages.
- Dashboard attendance trend graph uses percentages for attendance, late, and absence rates.
- Added a circular Department Tracking attendance indicator with department percentages.
- Performance chart displays percentage-based attendance values and percentage tooltips.
- Responsive mobile navigation drawer while preserving the desktop sidebar design.
- Responsive user-management tables with horizontal scrolling on small screens.
- Admin-only audit log access.
- Fixed an existing Monthly Report variable-order TypeScript error.

## Demo accounts
- Admin: `admin@rica.rw` / `Admin@123`
- Head of Department: `Jean Bosco Niyonzima` or `hod@rica.rw` / `HOD@123`
- Head of Office/Unit: `hou@rica.rw` / `HOU@123`
- Director: `director@rica.rw` / `Director@123`

Change these passwords from the Admin Users & config page for actual use.

## Important frontend-only limitation
This is a frontend-only implementation. Passwords are hashed before browser storage, but browser-side authentication cannot provide the same security guarantees as a server-side identity system. For a real large-organization deployment, authentication, authorization, password reset, account deletion, audit integrity, and Excel import validation should be enforced by a backend/API and database as well.

## Run
```bash
npm install
npm run dev
```

For a clean environment, do not copy `node_modules` from another operating system; let npm install dependencies for the machine being used.

## September 2026 UI/management extension
- Added modern browser calendar controls to dashboard, verified attendance, verification queue, daily report, raw attendance, and monthly reporting.
- Monthly report now uses a selectable month instead of a fixed month.
- Performance KPIs now include circular attendance and punctuality KPI charts in addition to the existing department chart.
- Employee master now supports search by name/ID/position, Active/Inactive filtering, Admin add/edit/delete, and status switching.
- Organization page now lets Admin add departments/organizations with a name and short code; additions persist in frontend storage.
- Data Import now parses and previews an Excel file before confirmation, showing row count, employee count, date range, and sample records; confirmed imports retain Batch IDs, duplicates, and anomaly counts.
- Raw Attendance now supports search, department filter, calendar day/month/year selection, and Excel exports for daily, monthly, and yearly periods.
- Raw attendance is now scoped to the signed-in user's organization/department/unit boundary.
- Existing visual design, navigation, colors, card system, and role boundaries were retained.
- Frontend-only security note: authentication and authorization are persisted locally for prototype/demo use; production deployment should move credential validation and permission enforcement to a backend service/database.
