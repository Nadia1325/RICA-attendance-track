# RICA Attendance Tracking – Frontend

React + TypeScript + Vite + Tailwind. All server communication uses **Redux Toolkit Query** against the RICA Attendance Backend (Flask).

## Run
```bash
cp .env.example .env     # change VITE_DEV_API_TARGET if Flask is not on http://localhost:5000
npm install
npm run dev
```
Start the Flask API first. Log in with an account created by the backend Admin (email or username).

## Structure
```
src/app/store.ts                Redux store (api + auth), session persistence
src/features/auth/authSlice.ts  user, access/refresh tokens, must-change-password flag
src/services/api.ts             RTK Query endpoints, Bearer header, refresh on 401
src/services/mappers.ts         backend rows -> UI types
src/data/store.tsx              useApp() facade over the RTK Query hooks
src/components/Brand.tsx        RICA logo + Republic of Rwanda emblem
src/pages/                      one file per screen
```

## Data flow
- Login stores tokens in the `auth` slice (mirrored to localStorage). Every request gets `Authorization: Bearer`.
- Lists are cached queries with tags; mutations invalidate tags so screens refresh after uploads, corrections, leave, user changes.
- A 401 triggers one `POST /api/auth/refresh`; if it fails the user is signed out and the cache is cleared.

## Roles (as in the backend)
ADMIN (full), DIRECTOR (read-only, all departments), HOD (own department).

## Not offered by the backend, so not in the UI
Employee create/edit/delete, holiday edit, shift delete, office/unit level, Head of Office/Unit role.

## To confirm in /apidocs
Request body of `POST /api/auth/change-password` (frontend sends `current_password`, `new_password`) and the response key of `/api/auth/refresh` (`access_token`).
