const birdList = require('../models/birdList');
const Boom = require('boom');
const express = require('express');
const href = require('../lib/href');
const Joi = require('joi');
const paginationLinks = require('../lib/pagination_links');

let router = new express.Router();

const addLinks = (list) => {
  list.links = {
    self: href(`/v1/bird-lists/${list.id}`)
  }
  return list;
}

const listQuery = Joi.object().keys({
  page: Joi.number().min(1).default(1),
  perPage: Joi.number().min(0).default(20)
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
    data: results[0].map(addLinks)
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

module.exports = router;
