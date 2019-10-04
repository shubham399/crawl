const models = require("./models");
var env = process.env.NODE_ENV || "development";
var config = require("./config/config.js")[env];
const crawl = require("./crawl.js").crawl;




models.sequelize.sync({
  force: config.resetdb
}).then((val)=>{
crawl("https://gen.medium.com/getting-lost-in-the-subtlety-of-the-landscape-fd482179acde").then(console.log).catch(console.err)
});
