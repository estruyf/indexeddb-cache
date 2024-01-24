import { IStoreObject } from "../models";

export class CacheService {
  private readonly storeName = "CacheStore";
  private db: IDBDatabase | null = null;

  constructor(private dbName: string, private dbVersion: number = 1, private verbose: boolean = false) {
    this.db = null;
  }

  /**
   * Initialize the database
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
        db.createObjectStore(this.storeName)
      };
    });
  }

  /**
   * Retrieve data from the cache
   * @param cacheKey 
   */
  public async get<T>(cacheKey: string): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(`Database doesn't exist.`);
        return;
      }

      const store = this.db.transaction([this.storeName]).objectStore(this.storeName);
      const request = store.get(cacheKey);
      
      request.onerror = reject.bind(null, `Error getting cached data ${cacheKey}`);

      request.onsuccess = (event: Event) => {
        if (request.result){
          const result = request.result;

          const storeObj: IStoreObject<T> = JSON.parse(result);
          if (new Date(storeObj.expiration) <= new Date()) {
            this.delete(cacheKey);
            resolve(undefined);
          }

          resolve(storeObj.value as T);
        }
        else {
          reject(`Nothing found for ${cacheKey}`);
        }
      }
    });
  }

  /**
   * Add data to the cache
   * @param cacheKey 
   * @param data 
   * @param expire
   */
  public async put(cacheKey: string, data: any, expire?: Date): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(`Database doesn't exist.`);
        return;
      }

      const store = this.db.transaction([this.storeName], 'readwrite').objectStore(this.storeName);
      const request = store.put(this.createPersistable(data, expire), cacheKey);

      request.onerror = err => { 
        this.log(`Failed to store data cache: ${err}`); 
        resolve(false); 
      };

      request.onsuccess = err => { 
        this.log(`Successfully stored ${cacheKey} cache data`); 
        resolve(true); 
      };
    });
  }

  /**
   * Delete the key from the cache
   * @param cacheKey 
   */
  public async delete(cacheKey: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(`Database doesn't exist.`);
        return;
      }

      const store = this.db.transaction([this.storeName], 'readwrite').objectStore(this.storeName);
      const request = store.delete(cacheKey);
      request.onerror = err => { 
        this.log(`Failed to delete cache: ${err}`); 
        reject(`Failed to delete cache: ${err}`); 
      };
      request.onsuccess = err => { 
        this.log(`Successfully stored ${cacheKey} cache data`);
        resolve(); 
      };
    });
  }

  /**
   * Flush the whole cache store
   */
  public async flush(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(`Database doesn't exist.`);
        return;
      }

      const store = this.db.transaction([this.storeName], 'readwrite').objectStore(this.storeName);
      const request = store.clear();
      request.onerror = err => { 
        this.log(`Failed to clear cache: ${err}`); 
        reject(`Failed to clear cache: ${err}`); 
      };
      request.onsuccess = err => { 
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
      expire = new Date();
      expire.setTime(expire.getTime() + 1 * 3600000);
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