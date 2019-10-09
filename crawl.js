'use strict'
const helper = require("./helper.js");
const models = require("./models");
var env = process.env.NODE_ENV || "development";
var config = require("./config/config.js")[env];

/** This function is to remove all queryParams and anchor in the URL eg: test?a=b&c or test#abcd*/
function removeQueryParamsAndAnchors(unPrasedURL) {
  return unPrasedURL.substring(0, unPrasedURL.indexOf('?') == -1 ? unPrasedURL.length : unPrasedURL.indexOf('?')).substring(0, unPrasedURL.indexOf('#') == -1 ? unPrasedURL.length : unPrasedURL.indexOf('#'));
}
/** This function is to get all queryParams keys*/
function getParamsKeys(unPrasedURL) {
  return unPrasedURL.substring(unPrasedURL.indexOf('?') + 1).split('&').map(x => x.split('=')).map(x => x[0]);
}

/** This function is used parse the URL and return the {host,count,params}. this function increment the count if URL is already visited and concat the paramskeys*/
const getParsedURLs = async function(unPrasedURL) {
  try {
    let url = removeQueryParamsAndAnchors(unPrasedURL)
    let params = unPrasedURL.indexOf('?') == -1 ? null : getParamsKeys(unPrasedURL)
    let currentDBVal = await getURLfromDB(url)
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

/** this function upsert the found URL in DB */
const upsertInDB = async function(url) {
  let parsedURL = await getParsedURLs(url)
  return await models.Crawl.upsert(parsedURL)
}


/** this function crawl the URL */
const crawl = async function(url) {
  let val = await helper.getLinks(url);
  val.map(upsertInDB)
  return Array.from(new Set(val.map(removeQueryParamsAndAnchors)));
}

/** this function is used  to the URL from DB*/
const getURLfromDB = async function(url) {
  let oneCrawl = (await models.Crawl.findOne({
    where: {
      url
    }
  }));
  return oneCrawl != null ? oneCrawl.dataValues : null;
}



/* Export Crawl and getURLfromDB */
exports.crawl = crawl
exports.getURLfromDB = getURLfromDB
