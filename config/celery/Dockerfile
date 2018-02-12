FROM python:2.7-alpine

COPY ./requirements.txt /pytasks/requirements.txt

COPY ./pytasks/ /pytasks/pytasks

WORKDIR /pytasks/

RUN pip install -r requirements.txt

ENTRYPOINT celery -A pytasks.celery_app:app worker --concurrency=2 --loglevel=info  --logfile=/var/log/celery.log
