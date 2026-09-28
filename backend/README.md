# RICA Attendance API

Flask and PostgreSQL backend for the RICA attendance dashboard. API routes are documented at `/apidocs`; `/health` reports application and database readiness.

## Local setup

1. Use Python 3.12 or later and a running PostgreSQL database.
2. Create a virtual environment, activate it, and install dependencies:

   ```powershell
   py -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   prisma py fetch
   ```

3. Copy `.env.example` to `.env`. Set `DATABASE_URL`, `DIRECT_URL`, `SECRET_KEY`, and `JWT_SECRET_KEY`. Use different, randomly generated values for the two secret keys. Add the frontend origin to `CORS_ORIGINS`.
4. Apply the checked-in migrations and generate the Prisma client:

   ```powershell
   prisma migrate deploy
   prisma generate
   ```

5. Seed the dashboard's 12 RICA departments (safe to rerun):

   ```powershell
   python scripts/seed_departments.py
   ```

6. To create the first Admin, set `RICA_ADMIN_PASSWORD` to a unique strong password and run:

   ```powershell
   python scripts/seed_admin.py
   ```

7. Start the development server:

   ```powershell
   python run.py
   ```

The default local API origin is `http://localhost:5000`. Set `VITE_API_BASE_URL=http://localhost:5000` in the frontend root `.env` and run the frontend with `npm run dev` from the workspace root.

## Security and password recovery

The server refuses to start outside development mode without configured signing secrets. `run.py` does not enable Flask debug mode unless `FLASK_DEBUG=true`. CORS allows only configured origins (localhost Vite is the development default), and this API uses bearer tokens rather than cookie credentials. Configure SMTP to deliver reset tokens. Without SMTP, reset requests still return a generic confirmation, but no reset token is delivered; debug mode exposes a development-only token in the response.

Admin imports accept `.xls`, `.xlsx`, and `.csv` files in multipart field `file`. Authenticated users change their password at `/api/auth/change-password`; forgot/reset uses `/api/auth/forgot-password` and `/api/auth/reset-password`.

## API smoke check

The smoke script makes persistent database writes. Only run it against a disposable development database. Set `RICA_ADMIN_IDENTIFIER` and `RICA_ADMIN_PASSWORD` in the environment first, then run `python scripts/smoke_test_api.py`.
