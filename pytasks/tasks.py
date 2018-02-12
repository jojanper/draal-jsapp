#!/usr/bin/env python
# -*- coding: utf-8 -*-

# System imports
from django.conf import settings
from django.core.mail import send_mail
from celery.utils.log import get_task_logger

# Project settings
from pytasks.celery_app import app


logger = get_task_logger(__name__)


@app.task(ignore_result=True)
def registration_email(email, activation_key):
    subject = 'Draal registration'
    message = 'Your activation key is {}'.format(activation_key)
    logger.info('{}, {}'.format(email, activation_key))
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email], fail_silently=True)


@app.task(ignore_result=True)
def passwordreset_email(email, reset_key):
    subject = 'Draal password reset'
    message = 'Your reset key is {}'.format(reset_key)
    logger.info('{}, {}'.format(email, reset_key))
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email], fail_silently=True)
