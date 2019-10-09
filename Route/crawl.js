'use strict'
const express = require("express");
const router = express.Router();
const models = require("../models");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const env = process.env.NODE_ENV || "development";
const config = require("../config/config.js")[env];
const Queue = require('bull');
const crawlQueue = new Queue("crawler-queue", config.redisURL);
const bodyParser = require('body-parser')


router.use(bodyParser.json())
router.use((req, res, next) =>{
  const api = req.get("X-API-KEY");
  if (api == config.api_key)
    next()
  else
    res.status(401).send("Invalid Auth");
})

/*
Get All Routere
 */
router.get('/', async (req, res) => {
  try {
    let limit = req.query.limit || 5
    let offset = req.query.offset || 0
    let data = await models.Crawl.findAndCountAll({
      limit,
      offset
    })
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).send("Error" + e)
  }
});


/*
Get All for URL Pattern
 */
router.get('/:url', async (req, res) => {
  try {
    let limit = req.query.limit || 5
    let offset = req.query.offset || 0
    // let url = req.params.url
    let data = await models.Crawl.findAndCountAll({
      where: {
        url: {
          [Op.like]: `%${req.params.url}%`
        }
      },
      limit,
      offset
    })
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).send("Error" + e)
  }
});

/* Add a new JOB */
router.post('/', async (req, res) => {
  try {
    console.log(req.body.url);
    let job = await crawlQueue.add('crawler', {
      "url": req.body.url
    })
    res.json(job);
  } catch (e) {
    console.error(e);
    res.status(500).send("Error" + e)
  }
});



module.exports = router
