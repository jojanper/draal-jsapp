from .celery import app


@app.task
def echo(msg):
    print(msg)
    return 0
