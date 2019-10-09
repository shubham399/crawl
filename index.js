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
  let url = job.data.url;
  let crawled = null;
  let visisted = await app.getURLfromDB(url);
  if (visisted == null) {
    crawled = await app.crawl(url);
    crawled.map(x => crawlQueue.add("crawler", {
      "url": x
    }))
  }
  return crawled ? crawled : "Already Visited";
});


const redis = config.redisURL.split("://")
const host = redis[1].substring(0, redis[1].indexOf(':'))
const port = redis[1].substring(redis[1].indexOf(':') + 1)
/** Start the Dashboard  at 4567*/
const arena = Arena({
  queues: [{
    "name": "crawler-queue",
    "hostId": "Crawler",
    "redis": {
      "port": port,
      "host": host
    }
  }]
}, {
  disableListen: true
});


function initRoutes() {
  expressApp.use('/', appRoute);
  expressApp.use('/arena', arena);
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
