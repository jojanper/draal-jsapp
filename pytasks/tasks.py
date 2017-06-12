#!/usr/bin/env python
# -*- coding: utf-8 -*-

from .celeryapp import app


@app.task
def echo(msg):
    print(msg)
    return 0
