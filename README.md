# IndexedDB Caching Solution

Cache solution which makes use of `IndexedDB` storage in the browser to avoid reaching the size limits of `localStorage` and `sessionStorage`.

## Installation

```bash
# NPM
npm i @estruyf/icache

# pnpm
pnpm i @estruyf/icache

# Yarn
yarn add @estruyf/icache
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

#### init

The `init` method will initialize the cache. This will create the `IndexedDB` database and the required tables.

```typescript
const cache = new CacheService(`EventCache`);
await cache.init();
```

#### get

The `get` method will read the data from the cache.

```typescript
// When the cache key is not found, it will throw an error
const eventData = await cache.get<string>(`YourCacheKey`);

// If you want, you can also tell the service to not throw an error when the cache key is not found
const eventData = await cache.get<string>(`YourCacheKey`, false);
```

#### put

The `put` method will write data to the cache. You can also define an expiration date for the data.

```typescript
// If no expiration date is defined, the data will be stored for 1 hour
await cache.put(`YourCacheKey`, <data>);

// If you want to define an expiration date, you can do it as follows
await cache.put(`YourCacheKey`, <data>, DateHelper.dateAdd(Date(), DateInterval.minute, 1));
```

#### delete

The `delete` method will remove the data from the cache.

```typescript
await cache.delete(`YourCacheKey`);
```

#### flush

The `flush` method will remove all the data from the cache.

```typescript
await cache.flush();
```

### DateHelper

The `DateHelper` is a helper class which you can use to calculate the expiration date of your cache.

```typescript
import { DateHelper, DateInterval } from '@estruyf/icache';

// Add 1 minute to the current date
const expirationDate = DateHelper.dateAdd(Date(), DateInterval.minute, 1);
```

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
