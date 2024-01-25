import { DateInterval } from "../enums";
import { DateHelper } from "../helpers";
import { IStoreObject } from "../models";

/**
 * Represents a cache service that provides methods for storing and retrieving data from an IndexedDB database.
 */
export class CacheService {
  private readonly storeName = "CacheStore";
  private db: IDBDatabase | null = null;

  /**
   * Constructs a new instance of the CacheService class.
   * @param dbName The name of the database.
   * @param dbVersion The version of the database (default is 1).
   * @param verbose Specifies whether to enable verbose logging (default is false).
   */
  constructor(
    private dbName: string,
    private dbVersion: number = 1,
    private verbose: boolean = false
  ) {
    this.db = null;
  }

  /**
   * Initializes the cache service by opening the IndexedDB database and creating the object store if needed.
   * @returns A promise that resolves to a boolean indicating whether the initialization was successful.
   */
  public async init(): Promise<boolean> {
    if (this.db) {
      return true;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = reject.bind(null, false);

      request.onsuccess = () => {
        this.db = request.result;
        resolve(true);
      };

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = request.result;
        if (db.objectStoreNames.contains(this.storeName)) {
          this.log(`Clearing out version ${event.oldVersion} cache`);
          db.deleteObjectStore(this.storeName);
        }

        this.log(`Creating version ${event.newVersion} cache`);
        db.createObjectStore(this.storeName);
      };
    });
  }

  /**
   * Retrieves the cached value associated with the specified cache key.
   *
   * @template T - The type of the cached value.
   * @param cacheKey - The key used to identify the cached value.
   * @param throwError - Optional. Specifies whether to throw an error if the cached value is not found. Default is true.
   * @returns A promise that resolves to the cached value if found, or undefined if not found.
   * @throws An error if the database doesn't exist or if throwError is true and the cached value is not found.
   */
  public async get<T>(
    cacheKey: string,
    throwError: boolean = true
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(`Database doesn't exist.`);
        return;
      }

      const store = this.db
        .transaction([this.storeName])
        .objectStore(this.storeName);
      const request = store.get(cacheKey);

      request.onerror = reject.bind(
        null,
        `Error getting cached data ${cacheKey}`
      );

      request.onsuccess = (_: Event) => {
        if (request.result) {
          const result = request.result;

          const storeObj: IStoreObject<T> = JSON.parse(result);
          if (new Date(storeObj.expiration) <= new Date()) {
            this.delete(cacheKey);
            resolve(undefined);
          }

          resolve(storeObj.value as T);
        } else {
          if (throwError) {
            reject(`Nothing found for ${cacheKey}`);
            return;
          }
          resolve(undefined);
        }
      };
    });
  }

  /**
   * Stores data in the cache with the specified cache key.
   *
   * @param cacheKey - The key to identify the cached data.
   * @param data - The data to be stored in the cache.
   * @param expire - Optional. The expiration date for the cached data. If not specified, the data will expire in 1 hour.
   * @returns A promise that resolves to a boolean indicating whether the data was successfully stored in the cache.
   */
  public async put(
    cacheKey: string,
    data: any,
    expire?: Date
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(`Database doesn't exist.`);
        return;
      }

      const store = this.db
        .transaction([this.storeName], "readwrite")
        .objectStore(this.storeName);
      const request = store.put(this.createPersistable(data, expire), cacheKey);

      request.onerror = (err) => {
        this.log(`Failed to store data cache: ${err}`);
        resolve(false);
      };

      request.onsuccess = (err) => {
        this.log(`Successfully stored ${cacheKey} cache data`);
        resolve(true);
      };
    });
  }

  /**
   * Deletes a cache entry with the specified cache key.
   *
   * @param cacheKey - The key of the cache entry to delete.
   * @returns A promise that resolves when the cache entry is successfully deleted, or rejects with an error message if the deletion fails.
   */
  public async delete(cacheKey: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(`Database doesn't exist.`);
        return;
      }

      const store = this.db
        .transaction([this.storeName], "readwrite")
        .objectStore(this.storeName);
      const request = store.delete(cacheKey);
      request.onerror = (err) => {
        this.log(`Failed to delete cache: ${err}`);
        reject(`Failed to delete cache: ${err}`);
      };
      request.onsuccess = (err) => {
        this.log(`Successfully stored ${cacheKey} cache data`);
        resolve();
      };
    });
  }

  /**
   * Flushes the cache by clearing all data from the IndexedDB store.
   *
   * @returns A promise that resolves when the cache is successfully cleared, or rejects with an error message if the database doesn't exist or clearing the cache fails.
   */
  public async flush(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(`Database doesn't exist.`);
        return;
      }

      const store = this.db
        .transaction([this.storeName], "readwrite")
        .objectStore(this.storeName);
      const request = store.clear();
      request.onerror = (err) => {
        this.log(`Failed to clear cache: ${err}`);
        reject(`Failed to clear cache: ${err}`);
      };
      request.onsuccess = (err) => {
        this.log(`Successfully cleared cache store`);
        resolve();
      };
    });
  }

  /**
   * Creates a presistable object for the store
   * @param data
   * @param expire
   */
  private createPersistable(data: any, expire?: Date): string {
    if (typeof expire === "undefined") {
      // Create expiration date - 1 hour
      expire = DateHelper.dateAdd(Date(), DateInterval.hour, 1);
    }

    return JSON.stringify({ value: data, expiration: expire });
  }

  /**
   * Logging
   * @param message
   */
  private log(message: string) {
    if (this.verbose) {
      console.log(message);
    }
  }
}
