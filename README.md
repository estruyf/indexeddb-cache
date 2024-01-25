# IndexedDB Caching Solution

Cache solution which makes use of `IndexedDB` storage in the browser to avoid reaching the size limits of `localStorage` and `sessionStorage`.

## Installation

```shell
npm i @estruyf/icache
```

## Usage

You can start using the cache service as follows:

```typescript
import { CacheService, DateHelper, DateInterval } from '@estruyf/icache';

const cache = new CacheService(`EventCache`);
await cache.init();

// Write data to the cache
await cache.put(`YourCacheKey`, <data>, DateHelper.dateAdd(Date(), DateInterval.minute, 1));

// Read data from the cache
const eventData = await cache.get(`YourCacheKey`);
```

### CacheService

The `CacheService` is the main class which you will use to interact with the cache. It has the following methods:

- `init`: initializes the cache service
- `get`: gets data from the cache
- `put`: adds data to the cache
- `delete`: removes data from the cache
- `flush`: clears the cache

### DateHelper

The `DateHelper` is a helper class which you can use to calculate the expiration date of your cache. It has the following methods:

- `dateAdd`: adds a certain interval to a date

### DateInterval

The `DateInterval` is an enum which you can use to define the interval you want to add to a date.

- `second`
- `minute`
- `hour`
- `day`
- `week`
- `month`
- `quarter`
- `year`

## Changelog

Check it out here: [changelog](./changelog)

## Feedback

If you have feedback or issues, feel free to report them on the issue list of this project: [estruyf/indexeddb-cache](https://github.com/estruyf/indexeddb-cache/issues).

[![Visitors](https://api.visitorbadge.io/api/visitors?path=https%3A%2F%2Fgithub.com%2Festruyf%2Findexeddb-cache&countColor=%23263759)](https://visitorbadge.io/status?path=https%3A%2F%2Fgithub.com%2Festruyf%2Findexeddb-cache)
