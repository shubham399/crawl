'use strict'
const Queue = require('bull');
const models = require("./models");
const env = process.env.NODE_ENV || "development";
const config = require("./config/config.js")[env];
const app = require("./crawl.js");
const Arena = require('bull-arena');
const express = require("express");
const expressApp = express()
const startURL = process.argv[2] || config.defaultStartURL;
const serverPort = process.env.PORT || 8000
const appRoute = require("./Route/crawl.js")
/** Queue Process Handler */
var crawlQueue = new Queue("crawler-queue", config.redisURL);


/** Queue Process Handler */
crawlQueue.process("crawler", config.concurrentCount, async function(job) {
  try {
    job.progress(5);
    let url = job.data.url;
    let crawled = null;
    let visisted = await app.getURLfromDB(url);
    job.progress(25);
    if (visisted == null) {
      job.progress(50);
      crawled = await app.crawl(url);
      crawled.map(x => crawlQueue.add("crawler", {
        "url": x
      }))
    }
    job.progress(100);
    return crawled ? crawled : "Already Visited";
  } catch (err) {
    console.error(err);
    throw err;
  }
});


/** Start the Dashboard  at 4567*/
const arena = Arena({
  queues: [{
    "name": "crawler-queue",
    "hostId": "Crawler",
    "url": config.redisURL

  }]
}, {
  disableListen: true
});


function initRoutes() {
  expressApp.all("/", (req, res) => res.send("UP"))
  expressApp.use('/arena', arena);
  expressApp.use('/crawl', appRoute);
}


/** Sync DB before starting */
models.sequelize.sync({
  force: config.resetdb
}).then(() => {
  /* Add the Starting URL  in the queue */
  // crawlQueue.add('crawler', {
  //   "url": startURL
  // })
  initRoutes();
})

expressApp.listen(serverPort, () => console.log(`Crawl is listening on port ${serverPort}!`))
