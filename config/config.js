module.exports = {
  development: {
    connection_url: "postgres://cloud:scape@localhost:5432/crawl",
    resetdb: true,
    redisURL: 'redis://127.0.0.1:6379',
    concurrentCount : 5,
    defaultStartURL: 'https://shubhkumar.in'
  },
  test: {
    connection_url: process.env.DATABASE_URL,
    resetdb: false,
    redisURL: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
    concurrentCount : parseInt(process.env.CONCURRENT_COUNT) || 5,
    defaultStartURL: process.env.START_URL || 'https://shubhkumar.in'

  },
  production: {
    connection_url: process.env.DATABASE_URL,
    resetdb: false,
    redisURL: process.env.REDIS_URL,
    concurrentCount :parseInt(process.env.CONCURRENT_COUNT),
    defaultStartURL: process.env.START_URL || 'https://shubhkumar.in'

  }
};
