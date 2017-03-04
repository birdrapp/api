const db = require("./db");
const express = require("express");
const bodyParser = require('body-parser');

const app = express();

// Allow POSTing of JSON data
app.use(bodyParser.json());

app.get('/', async function (req, res) {
  let birds;

  try {
    birds = await db.listBirds();
  } catch (ex) {
    return res.sendStatus(500);
  }

  res.json({
    data: birds
  });
});

app.get('/:id', async function (req, res) {
  let bird;

  try {
    bird = await db.getBird(req.params.id);
  } catch (ex) {
    return res.sendStatus(500);
  }

  if (bird !== undefined) {
    return res.json({
      data: bird
    });
  }

  res.sendStatus(404);
});

app.post("/", async function (req, res) {
  bird = await db.createBird(req.body);

  res.status(201).json({
    data: bird
  });
});

app.delete("/:id", async function (req, res) {
  let deleted;

  try {
    deleted = await db.deleteBird(req.params.id);
  } catch (ex) {
    return res.sendStatus(500);
  }

  if (deleted === true) {
    res.sendStatus(204);
  } else {
    res.sendStatus(404);
  }
});

module.exports = app;
