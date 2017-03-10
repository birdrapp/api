const birdList = require('../models/birdList');
const express = require('express');

let router = new express.Router();

router.get('/', async (req, res) => {
  const lists = await birdList.all();
  res.json({
    data: lists
  });
});

module.exports = router;
