import { CacheService, DateHelper, DateInterval } from '@estruyf/icache';

const cache = new CacheService(`EventCache`);
await cache.init();

const data = {
    name: 'Alice',
    age: 25,
    hobbies: ['reading', 'coding', 'biking']
  };

// Write data to the cache
await cache.put(`People`, data, DateHelper.dateAdd(Date(), DateInterval.minute, 1));

// Read data from the cache
const cachedData = await cache.get(`People`);

if (cachedData) {
  console.log('Data retrieved successfully', value);
}