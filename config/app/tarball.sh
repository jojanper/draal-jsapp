#!/bin/bash
#
# Create tar package that contains only executable application code.
#
tar -cvf node-src.tar .env.secrets package* app.js src views public config/*.js config/celery
