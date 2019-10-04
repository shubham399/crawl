module.exports = {
  development: { 
    connection_url: "postgres://cloud:scape@localhost:5432/crawl",
    resetdb: true
  },
  test: {
    connection_url: process.env.DATABASE_URL,
    resetdb: false
  },
  production: {
    connection_url: process.env.DATABASE_URL,
    resetdb: false
  }
};
