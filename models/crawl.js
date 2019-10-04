"use strict";
module.exports = (sequelize, Sequelize) => {
  var Crawl = sequelize.define("Crawl", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    url: {
      type: Sequelize.STRING,
      unique: true
    },
    count: {
      type: Sequelize.INTEGER
    },
    params: {
      type: Sequelize.JSON,
    }
  });
  return Crawl;
};
