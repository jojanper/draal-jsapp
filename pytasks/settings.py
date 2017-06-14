#!/usr/bin/env python
# -*- coding: utf-8 -*-


ADMINS = (
    ('Juha Ojanpera', 'juha.ojanpera@gmail.com'),
)

SECRET_KEY = 'mctqf=#a+#o3h4w&amp;v5hol510+w@u_(mkm-+j=cxkd@r2_^v2&amp;8'

DEFAULT_FROM_EMAIL = 'Draal Media <do-not-reply@gmail.com>'

EMAIL_USE_TLS = True
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_HOST_USER = ''
EMAIL_HOST_PASSWORD = ''
EMAIL_PORT = 587

# Local settings
try:
    from local_settings import *  # noqa
except ImportError:
    pass
