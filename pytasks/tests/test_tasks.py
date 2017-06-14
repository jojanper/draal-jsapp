#!/usr/bin/env python
# -*- coding: utf-8 -*-

import unittest
from mock import patch

from pytasks.celery import app
from pytasks.tasks import registration_email


class CeleryBaseTest(unittest.TestCase):
    def setUp(self):
        app.conf.update(CELERY_ALWAYS_EAGER=True)


class RegisterTestcase(CeleryBaseTest):

    @patch('pytasks.tasks.send_mail')
    def test_send_registration_mail(self, mailer_mock):
        """Registration email is send"""
        mailer_mock.return_value = True

        # GIVEN registration details
        kwargs = {
            'email': 'test@test.com',
            'activation_key': '123'
        }

        # WHEN registration mailer is called
        registration_email(**kwargs)

        # THEN mail is sent
        self.assertEqual(mailer_mock.call_count, 1)
