#!/usr/bin/env python
# -*- coding: utf-8 -*-

from django.conf import settings
from django.core.mail import send_mail

from .celery import app


@app.task
def echo(msg):
    print(msg)
    send_mail('Test', 'Test', settings.DEFAULT_FROM_EMAIL, ['juha.ojanpera@gmail.com'],
              fail_silently=True)
    return 0
