#!/usr/bin/env python
# -*- coding: utf-8 -*-

import unittest
from mock import patch

from pytasks.celery_app import app
from pytasks.tasks import registration_email, passwordreset_email


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

    @patch('pytasks.tasks.send_mail')
    def test_send_passwordreset_mail(self, mailer_mock):
        """Password reset email is send"""
        mailer_mock.return_value = True

        # GIVEN reset details
        kwargs = {
            'email': 'test@test.com',
            'reset_key': '123'
        }

        # WHEN reset mailer is called
        passwordreset_email(**kwargs)

        # THEN mail is sent
        self.assertEqual(mailer_mock.call_count, 1)
