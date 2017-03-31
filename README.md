[![Build Status](https://travis-ci.org/jojanper/draal-jsapp.svg?branch=master)](https://travis-ci.org/jojanper/draal-jsapp)

# draal-jsapp
> Node.js web backend. Project setup has been generated using [express-generator](https://expressjs.com/en/starter/generator.html).

## Quickstart

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

---------

## Travis CI
https://travis-ci.org/jojanper/draal-jsapp

---------

## Docker
- Install [Docker](https://docs.docker.com/engine/installation/)
- Linux users should install also [Docker compose](https://docs.docker.com/compose/install/)

Docker Compose is used to run multi-container Docker applications. This project creates two
separate containers: one for the nodejs application and the other for NGINX reverse proxy. The application
is accessible at http://localhost:8008.

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
