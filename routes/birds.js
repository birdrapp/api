'use strict';

const birds = require('../models/bird');
const href = require('../lib/href');
const paginationLinks = require('../lib/pagination_links');
const Boom = require('boom');
const express = require('express');
const Joi = require('joi');

const router = new express.Router();

const postSchema = Joi.object().keys({
  commonName: Joi.string().required().min(1).max(255),
  scientificName: Joi.string().required().min(1).max(255),
  familyName: Joi.string().required().min(1).max(255),
  family: Joi.string().required().min(1).max(255),
  order: Joi.string().required().min(1).max(255),
  alternativeNames: Joi.array().optional().items(Joi.string().min(1).max(255)),
  sort: Joi.number().required(),
  speciesId: Joi.string()
});

const listQuery = Joi.object().keys({
  page: Joi.number().min(1).default(1),
  perPage: Joi.number().min(0).default(20),
  q: Joi.string(),
  scientificName: Joi.string()
});

const addLinks = (bird) => {
  bird.links = {
    self: href(`/birds/${bird.id}`)
  };
  if (bird.subspecies > 0) bird.links.subspecies = href(`/birds/${bird.id}/subspecies`);
  if (bird.speciesId) bird.links.species = href(`/birds/${bird.speciesId}`);
  return bird;
};

router.get('/', async (req, res, next) => {
  const validate = Joi.validate(req.query, listQuery);

  if (validate.error !== null) return next(Boom.badRequest(validate.message));
  req.query = validate.value;

  const perPage = req.query.perPage;
  const page = req.query.page;
  const query = req.query.q;
  const scientificName = req.query.scientificName;

  let results;

  try {
    results = await Promise.all([
      birds.all({
        query: query,
        scientificName: scientificName,
        page: page,
        perPage: perPage
      }),
      birds.count()
    ]);
  } catch (ex) {
    return next(ex);
  }

  res.json({
    page: page,
    perPage: perPage,
    total: results[1],
    links: paginationLinks(req, results[1]),
    data: results[0].map(addLinks)
  });
});

router.get('/:id', async (req, res, next) => {
  let bird;

  try {
    bird = await birds.find(req.params.id);
  } catch (ex) {
    return next(ex);
  }

  if (bird !== undefined) {
    return res.json(addLinks(bird));
  } else {
    next();
  }
});

router.get('/:id/subspecies', async (req, res, next) => {
  const id = req.params.id;
  const validate = Joi.validate(req.query, listQuery);

  if (validate.error !== null) return next(Boom.badRequest(validate.message));
  req.query = validate.value;

  const perPage = req.query.perPage;
  const page = req.query.page;

  let results;

  try {
    results = await Promise.all([
      birds.subspecies(id, {
        page: page,
        perPage: perPage
      }),
      birds.countSubspecies(id)
    ]);
  } catch (ex) {
    return next(ex);
  }

  res.json({
    perPage: perPage,
    page: page,
    total: results[1],
    links: paginationLinks(req, results[1]),
    data: results[0].map((b) => {
      delete b.subspecies;
      return addLinks(b);
    })
  });
});

router.post('/', async (req, res, next) => {
  const result = Joi.validate(req.body, postSchema);

  if (result.error !== null) return next(Boom.badRequest(result.message));

  let bird;

  try {
    bird = await birds.create(req.body);
  } catch (ex) {
    return next(ex);
  }

  res.status(201).json(bird);
});

router.delete('/:id', async (req, res, next) => {
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
