const _ = require('lodash');
const href = require('./href');
const qs = require('querystring');

module.exports = (req, total) => {
  const nextQs = _.clone(req.query);
  const prevQs = _.clone(req.query);

  nextQs.page = req.query.page + 1;
  prevQs.page = req.query.page - 1;

  const path = req.path === '/' ? '' : req.path;

  return {
    next: req.query.page * req.query.perPage >= total ? null : href(req.baseUrl + path + '?' + qs.stringify(nextQs)),
    previous: req.query.page === 1 ? null : href(req.baseUrl + path + '?' + qs.stringify(prevQs))
  }
}
