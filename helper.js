'use strict'
const cheerio = require('cheerio');
const axios = require('axios');
//TODO: move these  values to Config.
const MAX_REQUESTS_COUNT = 5;
const INTERVAL_MS = 10;
let PENDING_REQUESTS = 0;

// create new axios instance
const api = axios.create({});
/**
 * Axios Request Interceptor
 */
api.interceptors.request.use(function(config) {
  return new Promise((resolve, reject) => {
    let interval = setInterval(() => {
      if (PENDING_REQUESTS < MAX_REQUESTS_COUNT) {
        PENDING_REQUESTS++
        clearInterval(interval)
        resolve(config)
      }
    }, INTERVAL_MS)
  })
})
/**
 * Axios Response Interceptor
 */
api.interceptors.response.use(function(response) {
  PENDING_REQUESTS = Math.max(0, PENDING_REQUESTS - 1)
  return Promise.resolve(response)
}, function(error) {
  PENDING_REQUESTS = Math.max(0, PENDING_REQUESTS - 1)
  return Promise.reject(error)
});
/**
get protocol host and path from uri
*/

const getFormatedURL = (url) => {
  let splittedURL = url.split('://'),
    protocol = splittedURL[0],
    host = splittedURL[1].split('/')[0],
    pathArr = splittedURL[1].split('/');
  pathArr.shift(); // remove the first element as that will be the host
  let path = pathArr.join("/");
  let returnObj = {
    protocol,
    host,
    path
  }
  return returnObj;
}

/**
 * Get all the links from a page
 */
const getAllLinks = async function(url) {
  try {
    let {
      protocol,
      host,
      path
    } = getFormatedURL(url);
    let response = await axios.get(url);
    if (response.status >= 200 && response.status <= 300) {
      let $ = cheerio.load(response.data);
      let array = $('a').toArray().map(x => x.attribs.href).map(x => {
        if (x[0] == '/') {
          return protocol + "://" + host + x
        } else {
          return x
        }
      });
      return Array.from(new Set(array))
    }
  } catch (err) {
    console.log(err);
  }
}

/**
 * Get all the links from a page
 */
const filteredLinks = async function(url) {
  try {
    let links = await getAllLinks(url);
    let {
      protocol,
      host,
      path
    } = getFormatedURL(url);
    let x = Array.from(new Set(links.filter(x => x.includes(host))));
    console.log(x);
    return x;
  } catch (err) {
    console.error("Error:" + err);
  }
}

exports.getLinks = filteredLinks
