const Boom = require('boom');
const birds = require("./db/birds");
const express = require("express");
const Joi = require('joi');
const bodyParser = require('body-parser');
const logger = require('./logger');

const app = express();

const schema = Joi.object().keys({
  commonName: Joi.string().required().min(1).max(255),
  scientificName: Joi.string().required().min(1).max(255)
});

// Allow POSTing of JSON data
app.use(bodyParser.json());

app.get('/', async function (req, res, next) {
  let results;

  try {
    results = await birds.all();
  } catch (ex) {
    return next(ex);
  }

  res.json({
    data: results
  });
});

app.get('/:id', async function (req, res, next) {
  let bird;

  try {
    bird = await birds.find(req.params.id);
  } catch (ex) {
    return next(ex);
  }

  if (bird !== undefined) {
    return res.json({
      data: bird
    });
  } else {
    next();
  }
});

app.post("/", async function (req, res, next) {
  const result = Joi.validate(req.body, schema);

  if (result.error !== null) {
    return next(Boom.badRequest(result.message));
  }

  let bird;

  try {
    bird = await birds.create(req.body);
  } catch (ex) {
    return next(ex);
  }

  res.status(201).json({
    data: bird
  });
});

app.delete("/:id", async function (req, res, next) {
  let deleted;

  try {
    deleted = await birds.delete(req.params.id);
  } catch (ex) {
    return next(ex);
  }

  if (deleted === true) {
    res.sendStatus(204);
  } else {
    next();
  }
});

// 404 handler
app.use(function (req, res, next) {
  const notFound = Boom.notFound();
  res.status(notFound.output.statusCode).json(notFound.output.payload);
});

// 500 handler
app.use(function (err, req, res, next) {
  if (err.isBoom) {
    logger.error(err.message);
    return res.status(err.output.statusCode).json(err.output.payload);
  }
  let status = 500;

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
