#!/usr/bin/env python
# -*- coding: utf-8 -*-

import unittest
from pytasks.celeryapp import app


class CeleryBaseTest(unittest.TestCase):

    def setUp(self):
        app.conf.update(CELERY_ALWAYS_EAGER=True)


class TestStringMethods(unittest.TestCase):

    def test_upper(self):
        self.assertEqual('foo'.upper(), 'FOO')

    def test_isupper(self):
        self.assertTrue('FOO'.isupper())
        self.assertFalse('Foo'.isupper())

    def test_split(self):
        s = 'hello world'
        self.assertEqual(s.split(), ['hello', 'world'])
        # check that s.split fails when the separator is not a string
        with self.assertRaises(TypeError):
            s.split(2)
