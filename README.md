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
- These browser-only demo accounts are available only when `VITE_API_BASE_URL` is unset.
- Admin: `admin@rica.rw` / `Admin@123`
- Head of Department: `Jean Bosco Niyonzima` or `hod@rica.rw` / `HOD@123`
- Head of Office/Unit: `hou@rica.rw` / `HOU@123`
- Director: `director@rica.rw` / `Director@123`

Do not use demo accounts for deployment. API mode authenticates against the Flask backend.

## Run
```bash
npm install
npm run dev
```

## RICA backend connection
The Flask backend source is in [backend](backend/README.md). For local integration, copy `.env.example` to `.env` in the project root (frontend) and set `VITE_API_BASE_URL=http://localhost:5000`. Start the backend using its setup instructions, then start Vite. For deployment, point this variable at the deployed backend origin and add the frontend origin to the backend's `CORS_ORIGINS`.

API mode uses backend authentication, catalogs, attendance, leaves, batches, and Admin user/audit data. Admin imports are previewed in the browser and then sent as multipart `file` data to `/api/attendance/upload`; URL imports require the source to allow browser CORS access. Attendance corrections, leaves, holidays, shifts, departments, and user management use the backend's documented write routes. Signed-in users change their passwords at **Change password**; forgot/reset password uses the backend email token flow. The app refreshes access tokens using the backend refresh endpoint.

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
- Backend mode uses server-side authentication and authorization; browser-only localStorage persistence is retained for demo mode.
