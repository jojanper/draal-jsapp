#!/usr/bin/env python
# -*- coding: utf-8 -*-

# System imports
import logging
from django.conf import settings
from django.core.mail import send_mail

# Project settings
from .celery import app


logger = logging.getLogger(__name__)


@app.task(ignore_result=True)
def registration_email(email, activation_key):
    subject = 'Draal registration'
    message = 'Your activation key is {}'.format(activation_key)
    logger.debug('{}, {}'.format(email, activation_key))
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email], fail_silently=True)
