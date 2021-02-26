const router = require('express').Router();

const routes = exports;

routes.entry = () => router;

routes.api = require('./api');
