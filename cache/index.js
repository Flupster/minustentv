const Redis = require('ioredis');

const redis = new Redis({ keyPrefix: 'mtv:' });

module.exports = redis;