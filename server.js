const express = require("express");
const dotenv = require("dotenv");
const redis = require("redis");

dotenv.config();

// Redis 클라이언트 생성
const redisClient = redis.createClient({
    url: `redis://${process.env.REDIS_NAME}:${process.env.REDIS_PW}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/0`,
    legacyMode: true,
});

redisClient.on('connect', () => {
    console.info('Redis connected!!');
});

redisClient.on('error', (err) => {
    console.error('Redis Client Error', err);
});

redisClient.connect().then();

// 1. String 명령어 사용 예시
redisClient.set('key', '123');
redisClient.get('key', (err, value) => {
    if (err) console.error(err);
    else console.log('Key:', value); // "123" 출력
});

redisClient.rename('key', 'kkey');
redisClient.get('kkey', (err, value) => {
    if (err) console.error(err);
    else console.log('Renamed Key:', value); // "123" 출력
});

redisClient.exists('kkey', (err, exists) => {
    if (err) console.error(err);
    if (exists) {
        redisClient.del('kkey', (err) => {
            if (err) console.error(err);
            console.log('Key kkey deleted');
        });
    }
});

// 2. List 자료형 사용 예시 (중복 문제 해결)
redisClient.rPush('fruitsList', 'apple', 'orange', 'pineapple', (err) => {
    if (err) console.error(err);
});
redisClient.lPush('fruitsList', 'banana', 'pear', (err) => {
    if (err) console.error(err);
});
redisClient.lRange('fruitsList', 0, -1, (err, fruits) => {
    if (err) console.error(err);
    else console.log('Fruits:', fruits); // ['pear', 'banana', 'apple', 'orange', 'pineapple'] 출력
});

// 3. Hash 자료형 사용 예시
redisClient.hSet('friends', 'name', 'nyong', 'age', 30);
redisClient.hGetAll('friends', (err, friendData) => {
    if (err) console.error(err);
    else console.log('Friend:', friendData); // {name: 'nyong', age: '30'} 출력
});

// 4. Set 자료형 사용 예시
redisClient.sAdd('fruitsSet', 'apple', 'orange', 'pear', 'banana');
redisClient.sMembers('fruitsSet', (err, fruits) => {
    if (err) console.error(err);
    else console.log('Fruits Set:', fruits); // 중복 제거된 값 출력
});

// 5. Sorted Set 자료형 사용 예시 (zAdd 문제 해결)
redisClient.zAdd('fruitsSortedSet', [
    { score: 1, value: 'apple' },
    { score: 2, value: 'orange' },
    { score: 3, value: 'pear' },
    { score: 4, value: 'banana' },
    { score: 5, value: 'grape' }
], (err, reply) => {
    if (err) {
        console.error('Sorted Set Error:', err);
    } else {
        redisClient.zRange('fruitsSortedSet', 0, -1, (err, sortedFruits) => {
            if (err) console.error(err);
            else console.log('Sorted Fruits:', sortedFruits); // ['apple', 'orange', 'pear', 'banana', 'grape'] 출력
        });
    }
});

// 6. 트랜잭션 (multi/exec)
(async () => {
    try {
        const transaction = redisClient.multi();
        transaction.set('key', 'value');
        transaction.get('key');  // 존재하는 키를 사용하도록 수정
        const results = await transaction.exec();
        console.log('Transaction Results:', results);
    } catch (error) {
        console.error('Transaction Error:', error);
    }
})();



// Redis 클라이언트 생성 (Promise 기반, legacyMode 비활성화)
const redisClient = redis.createClient({
    url : `redis://${process.env.REDIS_NAME}:${process.env.REDIS_PW}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/0`,
    legacyMode : false,  // 콜백 방식 비활성화
});

redisClient.on('connect', () => {
    console.info('Redis connected!!');
});

redisClient.on('error', (err) => {
    console.error('Redis Client Error', err);
});

redisClient.connect().then(async () => {
    // Promise 기반의 Redis 명령어 사용

    // 1. String 예시
    await redisClient.set('key', '123');
    const value = await redisClient.get('key');
    console.log('Key:', value);

    // 2. List 예시
    await redisClient.rPush('fruitsList', 'apple', 'orange', 'pineapple');
    await redisClient.lPush('fruitsList', 'banana', 'pear');
    const fruits = await redisClient.lRange('fruitsList', 0, -1);
    console.log('Fruits:', fruits);

    // 3. Hash 예시
    await redisClient.hSet('friends', 'name', 'nyong', 'age', 30);
    const friendData = await redisClient.hGetAll('friends');
    console.log('Friend:', friendData);

    // 4. Set 예시
    await redisClient.sAdd('fruitsSet', 'apple', 'orange', 'pear', 'banana', 'apple');
    const fruitsSet = await redisClient.sMembers('fruitsSet');
    console.log('Fruits Set:', fruitsSet);

    // 5. Sorted Set 예시
    await redisClient.zAdd('fruitsSortedSet', [
        { score: 1, value: 'apple' },
        { score: 2, value: 'orange' },
        { score: 3, value: 'pear' },
        { score: 4, value: 'banana' },
        { score: 5, value: 'grape' }
    ]);
    const sortedFruits = await redisClient.zRange('fruitsSortedSet', 0, -1);
    console.log('Sorted Fruits:', sortedFruits);

    // 6. 트랜잭션 예시
    const transaction = redisClient.multi();
    transaction.set('key', 'value');
    transaction.get('another-key');  // 존재하는 키 사용
    const results = await transaction.exec();
    console.log('Transaction Results:', results);
}).catch(console.error);
