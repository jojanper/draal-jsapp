#!/usr/bin/env python
# -*- coding: utf-8 -*-

from __future__ import absolute_import, unicode_literals
from celery import Celery
import os
import logging.config

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pytasks.settings')

ENV_TAG = 'CELERY_BROKER_URL'
DEFAULT_BROKER = 'amqp://guest:guest@localhost:5672//'
BROKER_URL = os.environ[ENV_TAG] if ENV_TAG in os.environ else DEFAULT_BROKER

app = Celery('pytasks', broker=BROKER_URL, include=['pytasks.tasks'])

# Optional configuration, see the application user guide.
app.conf.update(
    result_expires=3600,
)

#
# Logging configuration
#
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose_full': {
            'format': '[%(levelname)s %(asctime)s %(pathname)s %(funcName)s ' +
                      '%(lineno)d: %(levelname)s/%(processName)s] %(message)s'
        },
        'verbose': {
            'format': '%(levelname)s %(asctime)s %(module)s %(lineno)d: %(message)s'
        },
        'simple': {
            'format': '%(levelname)s %(message)s'
        },
    },
    'handlers': {
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose'
        }
    },
    'loggers': {
        'pytasks': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },

    # You can also shortcut 'loggers' and just configure logging for EVERYTHING at once
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
        'formatter': 'verbose'
    }
}

logging.config.dictConfig(LOGGING)


if __name__ == '__main__':
    app.start()
