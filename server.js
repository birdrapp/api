const Boom = require('boom');
const birdsRoute = require('./routes/birds');
const express = require('express');
const bodyParser = require('body-parser');
const logger = require('./lib/logger');

const app = express();

// Allow POSTing of JSON data
app.use(bodyParser.json());

app.use('/v1/birds', birdsRoute);

// 404 handler
app.use((req, res, next) => {
  const notFound = Boom.notFound();
  res.status(notFound.output.statusCode).json(notFound.output.payload);
});

// 500 handler
app.use((err, req, res, next) => {
  if (err.isBoom) {
    logger.error(err.message);
    return res.status(err.output.statusCode).json(err.output.payload);
  }

  if (err instanceof SyntaxError) {
    logger.warn(err.message);
    const error = Boom.wrap(err, 400).output;
    res.status(error.statusCode).json(error.payload);
  } else {
    logger.error(err.message);
    const error = Boom.wrap(err, 500).output;
    res.status(error.statusCode).json(error.payload);
  }
});

module.exports = app;
