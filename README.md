[![build][travis-image]][travis-url]

[travis-image]: https://travis-ci.org/jojanper/draal-jsapp.svg?branch=master
[travis-url]: https://npmjs.org/package/get-package-readme

# draal-jsapp
> Node.js web backend. Project setup has been generated using [express-generator](https://expressjs.com/en/starter/generator.html).

## Quickstart

### Prerequisites

- [Node.js 8.9+](https://nodejs.org)
- MongoDB
  - [Linux installation](https://docs.mongodb.com/manual/administration/install-on-linux/)
  - [OS X installation](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/)
- For backend tasks development:
  - [Python](https://www.python.org/)
      - Tested with version 2.7
  - [RabbitMQ](https://www.rabbitmq.com/)

### Install dependencies
```
npm install
```

### Start server
```
npm start
```
Open http://localhost:3000 in your browser.

### Run unit tests (using mocha, chai, supertest, istanbul)
```
npm test
```
Console output includes also coverage report.

### Run code styling (eslint)
```
npm run lint
```

### Run code style + unit tests
```
npm run cibuild
```

### Frontend support
It is envisioned that project remains more or less as pure backend. There is currently only one
[template](https://github.com/jojanper/draal-jsapp/blob/master/views/index.pug) in use that bootstraps
Angular client. The client code is from https://github.com/jojanper/angular-app.

#### Example workflow for developing both backend and client

Get the code:
```
npm run client-install
```

This monitors any changes in client code and builds it whenever needed. Also starts the backend server
and creates new root template for every client code change. The backend server is also restarted
on every backend code change. Creates debug builds for frontend.
```
npm run fullstack-dev
```

Same as above but creates release builds for frontend.
```
npm run fullstack-prod
```

---------

## Backend tasks + development
The Node.js app uses [node-celery](https://github.com/mher/node-celery) to queue tasks from Node.js
to [Celery](http://www.celeryproject.org/). The application acts therefore as Producer whereas Celery
is the Consumer. Mixed language development is needed since Celery operates in Python domain.
Communication between Producer and Consumer requires message broker (RabbitMQ in this case). After
prerequisites for backend tasks development have been installed, the installation is finalized with

```
npm run virtualenv-install
source virtualenv2.7/draal/bin/activate
```

This will install python dependencies as virtualenv under current folder.

### Run Python unit tests
```
npm run pytests
```

### Run Python code styling
```
npm run pylint
```

### Start Celery worker
```
celery -A pytasks worker -l info
```

The RabbitMQ broker need to be running, to see RabbitMQ status

```
sudo service rabbitmq-server status
```

To start the application as Producer

```
CELERY_ON=1 npm start
```

---------

## Travis CI
https://travis-ci.org/jojanper/draal-jsapp

---------

## Docker
- Install [Docker](https://docs.docker.com/engine/installation/)
- Linux users should install also [Docker compose](https://docs.docker.com/compose/install/)

Docker Compose is used to run multi-container Docker applications. This project creates two
separate containers: one for the nodejs application and the other for NGINX reverse proxy. The application
is accessible at http://localhost:8008. Currently, the Docker configuration does not include Celery tasks
runner (will change is near future).

To build the project
```
npm run docker-build
```

To start the application
```
npm run docker-run
```

To start the application in detached mode
```
npm run docker-rund
```

To stop application container
```
npm run docker-stop
npm run docker-rm # (to remove the application container)
```

To debug container
```
docker exec -t -i <container-id> /bin/bash
```

---------

## License

[MIT](/LICENSE)
