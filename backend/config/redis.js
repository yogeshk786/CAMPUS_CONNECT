const redis = require('redis');

// 1. Create the client using the URL from your .env file
const redisClient = redis.createClient({
  url: process.env.REDIS_URL
});

// 2. Set up event listeners so we know if it breaks
redisClient.on('error', (err) => console.log('❌ Redis Client Error:', err));
redisClient.on('connect', () => console.log('🚀 Redis Cache Connected Successfully!'));

// 3. Connect to the database
const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error('Failed to connect to Redis:', err.message);
  }
};

// Start the connection
connectRedis();

// Export it so we can use it in our controllers later
module.exports = redisClient;