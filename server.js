const Boom = require('boom');
const db = require("./db");
const express = require("express");
const bodyParser = require('body-parser');
const logger = require('./logger');

const app = express();

// Allow POSTing of JSON data
app.use(bodyParser.json());

app.get('/', async function (req, res, next) {
  let birds;

  try {
    birds = await db.listBirds();
  } catch (ex) {
    return next(ex);
  }

  res.json({
    data: birds
  });
});

app.get('/:id', async function (req, res, next) {
  let bird;

  try {
    bird = await db.getBird(req.params.id);
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
  bird = await db.createBird(req.body);

  res.status(201).json({
    data: bird
  });
});

app.delete("/:id", async function (req, res, next) {
  let deleted;

  try {
    deleted = await db.deleteBird(req.params.id);
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
  logger.error(err.message);

  const error = Boom.wrap(err, 500).output;
  res.status(error.statusCode).json(error.payload);
});

module.exports = app;
