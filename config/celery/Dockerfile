FROM python:2.7

COPY ./requirements.txt /pytasks/requirements.txt

COPY ./pytasks/ /pytasks/pytasks

WORKDIR /pytasks/

RUN pip install -r requirements.txt

ENTRYPOINT celery -A pytasks worker --concurrency=2 --loglevel=info
