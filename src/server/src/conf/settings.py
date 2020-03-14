# -*- coding: utf-8 -*-
from __future__ import annotations
from dj_database_url import parse as database
from decouple import config, Csv
from pathlib import Path
from typing import Tuple
import os, re

"""
Django settings for project.
For more information on this file, see
https://docs.djangoproject.com/en/3.0/topics/settings/
For the full list of settings and their values, see
https://docs.djangoproject.com/en/3.0/ref/settings/
"""

def email(value: str) -> Tuple[str, str]:
    regex = re.compile(r'((?![\s]*<).+?)[\s]*<[\s]*([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)[\s]*>', re.U)
    return regex.match(value).groups()

# General attributes
BASE_DIR = Path(__file__).resolve(strict = True).parents[1]
SETTINGS_MODE = config('SETTINGS_MODE', default = 'production')

# Host domain configuration
INTERNAL_IPS = [ '127.0.0.1', '[::1]' ]
ALLOWED_HOSTS = [ 'localhost', '127.0.0.1', '[::1]' ]
ADMINS = config('ADMINS', cast = Csv(cast = email))

# Application definition
INSTALLED_APPS = [
    'django.contrib.contenttypes',
    'django.contrib.auth',
    'django.contrib.staticfiles',
    'app'
]

ROOT_URLCONF = 'conf.urls'
WSGI_APPLICATION = 'conf.wsgi.application'

# Authentication & password validation
# https://docs.djangoproject.com/en/3.0/ref/settings/#auth-password-validators

# HTTP server
DEFAULT_CHARSET = 'utf-8'
DEFAULT_CONTENT_TYPE = 'text/html'
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.http.ConditionalGetMiddleware',
]
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
            ],
        },
    },
]

# I18N & L10N
# See https://docs.djangoproject.com/en/3.0/topics/i18n/
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = True

# Static assets
# See https://docs.djangoproject.com/en/3.0/howto/static-files/
STATIC_URL = '/static/'
STATIC_ROOT = str(BASE_DIR / 'static')

# Integrations
MAPBOX_API_KEY = config('MAP_API_KEY')
SENDINBLUE_API_KEY = config('EMAIL_API_KEY')
SENDINBLUE_TEMPLATE = config('EMAIL_TEMPLATE', default = 1, cast = int)


if SETTINGS_MODE in ('development', 'testing'):
    from django.core.management.utils import get_random_secret_key
    from django.utils.crypto import get_random_string
    from urllib.request import pathname2url

    # General settings
    DEBUG = True
    SECRET_KEY = get_random_secret_key()
    DEPLOYMENT_KEY = get_random_string(16, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789')

    # Host domain configuration
    HOST_DOMAIN = 'http://localhost:8000'

    # Databases
    # See https://docs.djangoproject.com/en/3.0/ref/settings/#databases
    DATABASES = {
        'default': database(f'sqlite://./db.sqlite3') if SETTINGS_MODE == 'development' else \
                   database('sqlite://:memory:')
    }

    # Logging
    # See https://docs.djangoproject.com/en/3.0/topics/logging/#configuring-logging
    LOGGING = {
        'version': 1,
        'disable_existing_loggers': False,
        'filters': { 'require_debug_false': { '()': 'django.utils.log.RequireDebugFalse' } },
        'formatters': {
            'verbose': {
                'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
                'style': '{',
            }
        },
        'handlers': {
            'console': { 'level': 'WARNING', 'class': 'logging.StreamHandler', 'formatter': 'verbose', }
        },
        'loggers': {
            'django': { 'handlers': [ 'console' ], 'level': 'INFO', 'propagate': True, },
            'django.request': { 'handlers': [ 'console' ], 'level': 'WARNING', 'propagate': False },
            'django.security': { 'handlers': [ 'console' ], 'level': 'WARNING', 'propagate': False },
        },
        'root': { 'handlers': [ 'console' ], 'level': 'INFO' }
    }

elif SETTINGS_MODE in ('staging', 'production'):

    # General settings
    DEBUG = False
    SECRET_KEY = config('SECRET_KEY')

    # Host domain configuration
    HOST_DOMAIN = 'https://garoqro.com'
    ALLOWED_HOSTS = [ 'localhost', '127.0.0.1', '[::1]', 'garoqro.com', '*.garoqro.com' ]

    # Databases
    # See https://docs.djangoproject.com/en/3.0/ref/settings/#databases
    DATABASES = {
        'default': config('DATABASE_URL', cast = database)
    }

    # Security
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_REDIRECT_EXEMPT = []
    SECURE_REFERRER_POLICY = 'no-referrer-when-downgrade'
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True

    # Logging
    # See https://docs.djangoproject.com/en/3.0/topics/logging/#configuring-logging
    LOGGING = {
        'version': 1,
        'disable_existing_loggers': False,
        'filters': { 'require_debug_false': { '()': 'django.utils.log.RequireDebugFalse' } },
        'formatters': {
            'verbose': {
                'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
                'style': '{',
            }
        },
        'handlers': {
            'console': { 'level': 'WARNING', 'class': 'logging.StreamHandler', 'formatter': 'verbose', },
            'file': {
                'level': 'INFO',
                'class': 'logging.FileHandler',
                'filename': config('LOG_FILE_LOCATION'),
                'formatter': 'verbose'
            }
        },
        'loggers': {
            'django': { 'handlers': [ 'file' ], 'level': 'INFO', 'propagate': True, },
            'django.request': { 'handlers': [ 'console' ], 'level': 'WARNING', 'propagate': False },
            'django.security': { 'handlers': [ 'console', 'file' ], 'level': 'WARNING', 'propagate': False },
        },
        'root': { 'handlers': [ 'console', 'file' ], 'level': config('LOG_LEVEL', default = 'INFO') }
    }
