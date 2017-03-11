const birdList = require('../models/birdList');
const Boom = require('boom');
const express = require('express');
const href = require('../lib/href');
const Joi = require('joi');
const paginationLinks = require('../lib/pagination_links');

let router = new express.Router();

const linker = (type) => {
  let path = '/';
  path += (type === 'bird' ? 'birds' : 'bird-lists');

  return (list) => {
    list.links = {
      self: href(`${path}/${list.id}`)
    }
    return list;
  };
}

const listQuery = Joi.object().keys({
  page: Joi.number().min(1).default(1),
  perPage: Joi.number().min(0).default(20)
});

const postSchema = Joi.object().keys({
  name: Joi.string().required().min(1).max(255),
  description: Joi.string().required()
});

router.get('/', async (req, res, next) => {
  const validate = Joi.validate(req.query, listQuery);

  if (validate.error !== null) return next(Boom.badRequest(validate.message));
  req.query = validate.value;

  const perPage = req.query.perPage;
  const page = req.query.page;

  let results;
  try {
    results = await Promise.all([
      birdList.all({
        page: page,
        perPage: perPage
      }),
      birdList.count()
    ]);
  } catch (ex) {
    return next(ex);
  }

  res.json({
    page: page,
    perPage: perPage,
    total: results[1],
    links: paginationLinks(req, results[1]),
    data: results[0].map(linker('bird-list'))
  });
});

router.get('/:id', async (req, res, next) => {
  let list;
  try {
    list = await birdList.find(req.params.id);
    if (list === undefined) return next();
  } catch (ex) {
    return next(ex);
  }

  res.json(list);
});

router.get('/:id/birds', async (req, res, next) => {
  const id = req.params.id;

  const validate = Joi.validate(req.query, listQuery);
  if (validate.error !== null) return next(Boom.badRequest(validate.message));
  req.query = validate.value;

  const perPage = req.query.perPage;
  const page = req.query.page;

  let results;
  try {
    results = await Promise.all([
      birdList.birds(id, {
        page: page,
        perPage: perPage
      }),
      birdList.find(id),
      birdList.countBirds(id)
    ]);
  } catch (ex) {
    return next(ex);
  }

  res.json({
    perPage: perPage,
    page: page,
    birdList: results[1],
    total: results[2],
    links: paginationLinks(req, results[2]),
    data: results[0].map(linker('bird'))
  });
});

router.post('/', async (req, res, next) => {
  const result = Joi.validate(req.body, postSchema);

  if (result.error !== null) return next(Boom.badRequest(result.message));

  let list;
  try {
    list = await birdList.create(req.body);
  } catch (ex) {
    return next(ex);
  }

  res.status(201).json(list);
});

router.delete('/:id', async (req, res, next) => {
  let numDeleted;

  try {
    numDeleted = await birdList.delete(req.params.id);
  } catch (ex) {
    return next(ex);
  }

  if (numDeleted > 0) {
    res.sendStatus(204);
  } else {
    next();
  }
});

module.exports = router;
