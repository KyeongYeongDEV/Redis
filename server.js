const express = require("express");
const dotenv = require("dotenv");
const redis = require("redis");

dotenv.config();


//로컬 redis 연결
// const redisClient = redis.createClient({ legacyMode : true }) // legacy 모드 반드시 설정하기
// redisClient.on('connect', () => {
//     console.info('Redis connected!!');
// });
// redisClient.on('error', (err) => {
//     console.error("Redis Client Error", err);
// });
// redisClient.connect().then(); //redis v4 연결 (비동기)
// const redisCli = redisClient.v4; // 기본 redisClient 객체는 콜백기반인데 v4버젼은 프로미스 기반이라 사용


// redis cloud 연결
const redisClient = redis.createClient({
    url : `redis://${process.env.REDIS_NAME}:${process.env.REDIS_PW}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/0`,
    legacyMode : true,
});

redisClient.on('connect', () => {
    console.info('Redis connected!!');
});

redisClient.on('error', (err) => {
    console.error('Redis Client Error', err);
});

redisClient.connect().then();
const redisCli = redisClient.v4;
//

//CRUD
redisClient.set('key', '123');

redisClient.get('key', (err, value) => {
    console.log(value);
});

redisClient.rename('key', 'kkey');
redisClient.get('kkey', (err, value) => {
    console.log(value);
});

const n = redisClient.exists('kkey');
if(n) redisClient.del('kkey');

