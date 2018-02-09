FROM python:2.7

ADD ./requirements.txt /pytasks/requirements.txt

ADD ./pytasks/ /pytasks/

WORKDIR /pytasks/

RUN pip install -r requirements.txt

ENTRYPOINT celery -A pytasks worker --concurrency=2 --loglevel=info
