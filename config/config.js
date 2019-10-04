module.exports = {
  development: {
    connection_url: "postgres://cloud:scape@localhost:5432/crawl",
    resetdb: true,
    redisURL: 'redis://127.0.0.1:6379'
  },
  test: {
    connection_url: process.env.DATABASE_URL,
    resetdb: false,
    redisURL: process.env.REDIS_URL || 'redis://127.0.0.1:6379'

  },
  production: {
    connection_url: process.env.DATABASE_URL,
    resetdb: false,
    redisURL: process.env.REDIS_URL

  }
};
