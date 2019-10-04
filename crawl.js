const helper = require("./helper.js");
const models = require("./models");
var env = process.env.NODE_ENV || "development";
var config = require("./config/config.js")[env];

function removeQueryParam(unPrasedURL) {
  return unPrasedURL.substring(0, unPrasedURL.indexOf('?') == -1 ? unPrasedURL.length : unPrasedURL.indexOf('?')).substring(0, unPrasedURL.indexOf('#') == -1 ? unPrasedURL.length : unPrasedURL.indexOf('#'));
}

function getParamsKeys(unPrasedURL) {
  return unPrasedURL.substring(unPrasedURL.indexOf('?') + 1).split('&').map(x => x.split('=')).map(x => x[0]);
}

const getParsedURLs = async function(unPrasedURL) {
  try {
    console.log(unPrasedURL);
    let url = removeQueryParam(unPrasedURL)
    let params = unPrasedURL.indexOf('?') == -1 ? null : getParamsKeys(unPrasedURL)
    let currentDBVal = await visitedURL(url)
    if (!currentDBVal) {
      return {
        url,
        count: 1,
        params
      }
    } else {

      return {
        url,
        count: currentDBVal.count + 1,
        params: params ? params.concat(currentDBVal.params) : null
      }
    }
  } catch (error) {
    console.error(error);
  }
}

const upsertINDB = async function(url) {
  let parsedURL = await getParsedURLs(url)
  return await models.Crawl.upsert(parsedURL)
}

const crawl = async function(url) {
  let val = await helper.getLinks(url);
  console.log(val);
  val.map(upsertINDB)
  return val.map(removeQueryParam);
}


const visitedURL = async function(url) {
  let oneCrawl = (await models.Crawl.findOne({
    where: {
      url
    }
  }));
  return oneCrawl != null ? oneCrawl.dataValues : null;
}


exports.crawl = crawl
exports.visitedURL = visitedURL
