const Queue = require('bull');
const models = require("./models");
const env = process.env.NODE_ENV || "development";
const config = require("./config/config.js")[env];
const app = require("./crawl.js")
const Arena = require('bull-arena');
const express = require("express");
const router = express.Router();
const startURL = process.argv[2] || "https://shubhkumar.in/"

var crawlQueue = new Queue('crawler-queue', config.redisURL);

crawlQueue.process( 5, async function(job){
  let url = job.data.url;
  let crawled = null;
  let visisted = await app.visitedURL(url);
  if(visisted == null)
  {
    console.log("Crawling... " + url);
    crawled = await app.crawl(url);
    console.log("crawled... " + url);
    crawled.map(x=> crawlQueue.add({"url":x}))
  }
  else{
    console.log("Already Crawled " +url+" skipping!!");
  }
  return crawled ? crawled : "Already Visited";
});


crawlQueue.add({"url":startURL})

const arena = Arena({
  queues: [
    {
    "name": "crawler-queue",
    "hostId": "Crawler",
  }
  ]
});
router.use('/', arena);
