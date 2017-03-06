const birds = require("../models/bird");
const Boom = require('boom');
const express = require('express');
const Joi = require('joi');

let router = new express.Router();

const schema = Joi.object().keys({
  commonName: Joi.string().required().min(1).max(255),
  scientificName: Joi.string().required().min(1).max(255)
});

router.get('/', async function (req, res, next) {
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

router.get('/:id', async function (req, res, next) {
  let bird;

  try {
    bird = await birds.find(req.params.id);
  } catch (ex) {
    return next(ex);
  }

  if (bird !== undefined) {
    return res.json(bird);
  } else {
    next();
  }
});

router.post("/", async function (req, res, next) {
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

  res.status(201).json(bird);
});

router.delete("/:id", async function (req, res, next) {
  let deleted;

  try {
    deleted = await birds.delete(req.params.id);
  } catch (ex) {
    return next(ex);
  }

  if (deleted === 1) {
    res.sendStatus(204);
  } else {
    next();
  }
});

module.exports = router;
