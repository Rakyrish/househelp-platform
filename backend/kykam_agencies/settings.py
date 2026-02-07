from pathlib import Path
import os
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv('SECRET_KEY')

# Ensure DEBUG is strictly False in production
DEBUG = os.getenv('DEBUG', 'False') == 'True'

FRONTEND_URL = os.getenv('FRONTEND_URL', 'https://kykamagencies.co.ke')

ALLOWED_HOSTS = [
    'kykamagencies.co.ke',
    'www.kykamagencies.co.ke',
    'api.kykamagencies.co.ke',
    'localhost',
    '127.0.0.1',
    'host.docker.internal',
    "102.212.247.246",
    'www.lucacare.co.ke',
    'lucacare.co.ke',
]

CORS_ALLOW_CREDENTIALS = True
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'whitenoise.runserver_nostatic',  # Listed only once now

    # Your apps
    'users',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware', 
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Maintenance Middleware logic
if not DEBUG:
    try:
        auth_middleware_index = MIDDLEWARE.index('django.contrib.auth.middleware.AuthenticationMiddleware')
        MIDDLEWARE.insert(auth_middleware_index + 1, 'users.middleware.MaintenanceMiddleware')
    except ValueError:
        MIDDLEWARE.append('users.middleware.MaintenanceMiddleware')

ROOT_URLCONF = 'kykam_agencies.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'django.template.context_processors.media',
            ],
        },
    },
]

WSGI_APPLICATION = 'kykam_agencies.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DBNAME'),
        'USER': os.getenv('DBUSER'),
        'PASSWORD': os.getenv('DBPASSWORD'),
        'HOST': os.getenv('DBHOST'),
        'PORT': os.getenv('DBPORT', '5432'),
    }
}

AUTH_USER_MODEL = 'users.User'
AUTHENTICATION_BACKENDS = [
    'users.backends.PhoneAuthBackend',
    'django.contrib.auth.backends.ModelBackend',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'users.authentication.ExpiringTokenAuthentication',
        'users.authentication.CsrfExemptSessionAuthentication', # This one replaces SessionAuthentication
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

# --- STATIC & MEDIA FILES ---
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.StaticFilesStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# --- SECURITY & CORS ---
CORS_ALLOWED_ORIGINS = [
    os.getenv("FRONTEND_URL", "https://kykamagencies.co.ke"),
    "https://kykamagencies.co.ke",
    "https://www.kykamagencies.co.ke",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

CSRF_TRUSTED_ORIGINS = [
    "https://kykamagencies.co.ke",
    "https://www.kykamagencies.co.ke",
    "https://api.kykamagencies.co.ke",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

CSRF_COOKIE_HTTPONLY = False
CSRF_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_SAMESITE = 'Lax'
# CSRF_COOKIE_SAMESITE = 'None' if not DEBUG else 'Lax'
# SESSION_COOKIE_SAMESITE = 'None' if not DEBUG else 'Lax'

# Production Security Headers
if not DEBUG:
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    USE_X_FORWARDED_HOST = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True

EMAIL_BACKEND = "sendgrid_backend.SendgridBackend"
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL")

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
