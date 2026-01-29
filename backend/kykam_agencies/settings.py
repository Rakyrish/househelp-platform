from pathlib import Path
import os
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

# Build paths inside the project
BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv('SECRET_KEY')
DEBUG = True
import os

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'host.docker.internal', '*']
CORS_ALLOW_ALL_ORIGINS = True  # For development only
# OR
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third-party apps
    'rest_framework',
    'rest_framework.authtoken', # Added for Token generation
    'corsheaders',
    
    # Your apps
    'users',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # 1. ALWAYS FIRST
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',  # 2. MUST BE AFTER CORS
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'users.middleware.MaintenanceMiddleware', # 3. Custom logic should be lower
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

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
            ],
        },
    },
]

WSGI_APPLICATION = 'kykam_agencies.wsgi.application'

# Database configuration
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

# --- NEW: CUSTOM AUTHENTICATION ---
# This allows Django to use your phone-based login logic
AUTH_USER_MODEL = 'users.User'

AUTHENTICATION_BACKENDS = [
    'users.backends.PhoneAuthBackend', # Points to your custom phone logic
    'django.contrib.auth.backends.ModelBackend', # Fallback
]

# --- NEW: REST FRAMEWORK SETTINGS ---
# This ensures DRF knows how to authenticate and find its CSS
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'users.authentication.ExpiringTokenAuthentication', # Changed this
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated', # Recommendation: Secure by default
        'rest_framework.permissions.AllowAny',
    ],
}

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [
    BASE_DIR / 'static',
]

# Media files - User uploads
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media' # Using the / operator is cleaner with Path objects

# CORS settings
CORS_ALLOW_ALL_ORIGINS = True

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
# Allows your React app to display media/site content in iframes
X_FRAME_OPTIONS = 'SAMEORIGIN'


SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True, 
}

TOKEN_EXPIRED_AFTER_SECONDS = 3600  # Token expires in 5 minutes

# --- SENDGRID CONFIGURATION ---
EMAIL_BACKEND = "sendgrid_backend.SendgridBackend"
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")

# This is the email you verified in your SendGrid dashboard
DEFAULT_FROM_EMAIL = os.getenv("EMAIL_USER") 

# Toggle this for debugging
SENDGRID_SANDBOX_MODE_IN_DEBUG = False

