# RICA Attendance Tracking

Frontend-only attendance management demo built with React, TypeScript, and Vite. Accounts, attendance records, imports, reports, leave, configuration, and audit activity are stored in this browser's local storage. No backend service or remote API is used.

## Run locally

```bash
npm install
npm run dev
```

## Demo accounts

- Admin: `admin@rica.rw` / `Admin@123`
- Head of Department: `hod@rica.rw` / `HOD@123`
- Head of Office/Unit: `hou@rica.rw` / `HOU@123`
- Director: `director@rica.rw` / `Director@123`

These accounts and their passwords are for this browser demo. Admins can create local accounts and reset their passwords in **Users & configuration**.

## Included workflows

- Role-scoped dashboard, attendance, reports, and performance KPIs.
- Attendance file preview and import from Excel or CSV into local browser storage.
- Attendance verification, leave entries, employees, departments, shifts, and holidays.
- Local user management, password changes, and audit history.
- Responsive navigation and page layouts for desktop and mobile screens.
