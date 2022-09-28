/* eslint-disable no-console */
const { createClient } = require('redis');
const { REDIS_URL } = require('../../src/config/constants');

async function connection() {
  const client = createClient({
    url: REDIS_URL,
  });
  await client.connect();

  client.on('error', (err) => console.log('Redis Client Error', err));
  client.on('connect', () => console.log('connected to redis successfully'));

  return client;
}

/**
 * Stores data to redis store.
 * @param key the key to use for storing the data
 * @param value the data to be stored
 * @param expiresIn time to delete the value in seconds default is 24hours
 */
async function addToRedis(key, value, expiresIn = 60 * 60 * 24) {
  const redisClient = await connection();
  try {
    return await redisClient.set(key, value, 'Ex', expiresIn);
  } catch (error) {
    console.log('error', error);
    throw new Error(error);
  }
}

/*
* delete data on  redis store.
* @param key the key to use for storing the data
*/
async function delInRedis(key) {
  const redisClient = await connection();
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    throw new Error(error);
  }
}

/**
* Gets data back from our redis store
* @param key the key used to store the value
*/
async function getFromRedis(key) {
  try {
    const redisClient = await connection();
    const value = await redisClient.get(key);
    return value;
  } catch (error) {
    throw new Error(error);
  }
}

module.exports = {
  addToRedis, delInRedis, getFromRedis, connection,
};
