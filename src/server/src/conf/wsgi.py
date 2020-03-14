# -*- coding: utf-8 -*-
from __future__ import annotations
from django.core.wsgi import get_wsgi_application
import os

"""
WSGI config for project.
It exposes the WSGI callable as a module-level variable named ``application``.
For more information on this file, see
https://docs.djangoproject.com/en/3.0/howto/deployment/wsgi/
"""


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'conf.settings')
application = get_wsgi_application()
