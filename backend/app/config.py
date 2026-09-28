import os
import secrets
from datetime import timedelta


DEBUG = os.getenv("FLASK_DEBUG", "false").lower() == "true"
SECRET_KEY = os.getenv("SECRET_KEY")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
if not DEBUG and (not SECRET_KEY or not JWT_SECRET_KEY):
    raise RuntimeError("SECRET_KEY and JWT_SECRET_KEY must be configured outside development mode.")


class Config:
    DEBUG = DEBUG
    SECRET_KEY = SECRET_KEY or secrets.token_urlsafe(48)
    JSON_SORT_KEYS = False

    # --- JWT (names match your .env: ACCESS_TOKEN_MINUTES / REFRESH_TOKEN_DAYS) ---
    JWT_SECRET_KEY = JWT_SECRET_KEY or secrets.token_urlsafe(48)
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=int(os.getenv("ACCESS_TOKEN_MINUTES", "30")))
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=int(os.getenv("REFRESH_TOKEN_DAYS", "7")))

    # --- Login lockout policy (not in your .env yet; these are safe defaults) ---
    MAX_FAILED_LOGINS = int(os.getenv("MAX_FAILED_LOGINS", "5"))
    LOCKOUT_MINUTES = int(os.getenv("LOCKOUT_MINUTES", "15"))

    # --- Forgot-password token lifetime ---
    PASSWORD_RESET_TTL_MINUTES = int(os.getenv("PASSWORD_RESET_TTL_MINUTES", "30"))

    # SMTP is required for production password recovery. Debug mode can
    # return a one-time reset token directly to the local development UI.
    SMTP_HOST = os.getenv("SMTP_HOST")
    SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME = os.getenv("SMTP_USERNAME")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
    SMTP_FROM = os.getenv("SMTP_FROM")
    SMTP_USE_TLS = os.getenv("SMTP_USE_TLS", "true").lower() == "true"
    SMTP_USE_SSL = os.getenv("SMTP_USE_SSL", "false").lower() == "true"
    # Optional: front-end URL to embed in the email, e.g.
    # "https://app.rica.com/reset-password" -> becomes .../<token>
    PASSWORD_RESET_URL_BASE = os.getenv("PASSWORD_RESET_URL_BASE")

    # --- CORS: comma-separated list, e.g. "http://localhost:3000,https://app.rica.com" ---
    CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",") if o.strip()]
