const DB_NAME = 'streetfinds-image-cache';
const DB_VERSION = 1;
const STORE_NAME = 'thumbnails';
const MAX_CACHE_SIZE = 50 * 1024 * 1024;
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

interface CacheEntry {
  id: string;
  blob: Blob;
  timestamp: number;
  size: number;
}

class ImageCacheManager {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });

    return this.initPromise;
  }

  async get(id: string): Promise<string | null> {
    await this.init();
    if (!this.db) return null;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        const entry = request.result as CacheEntry | undefined;
        if (!entry) {
          resolve(null);
          return;
        }

        if (Date.now() - entry.timestamp > CACHE_TTL) {
          this.delete(id);
          resolve(null);
          return;
        }

        resolve(URL.createObjectURL(entry.blob));
      };

      request.onerror = () => resolve(null);
    });
  }

  async set(id: string, blob: Blob): Promise<void> {
    await this.init();
    if (!this.db) return;

    await this.ensureSpace(blob.size);

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const entry: CacheEntry = {
        id,
        blob,
        timestamp: Date.now(),
        size: blob.size,
      };

      const request = store.put(entry);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async delete(id: string): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      store.delete(id);
      transaction.oncomplete = () => resolve();
    });
  }

  private async ensureSpace(neededBytes: number): Promise<void> {
    await this.init();
    if (!this.db) return;

    const totalSize = await this.getTotalSize();
    if (totalSize + neededBytes <= MAX_CACHE_SIZE) return;

    const entries = await this.getAllEntriesSortedByTime();
    let freedSpace = 0;
    const targetFree = neededBytes + (MAX_CACHE_SIZE * 0.2);

    for (const entry of entries) {
      if (totalSize - freedSpace + neededBytes <= MAX_CACHE_SIZE - targetFree) break;
      await this.delete(entry.id);
      freedSpace += entry.size;
    }
  }

  private async getTotalSize(): Promise<number> {
    await this.init();
    if (!this.db) return 0;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const entries = request.result as CacheEntry[];
        const total = entries.reduce((sum, entry) => sum + entry.size, 0);
        resolve(total);
      };

      request.onerror = () => resolve(0);
    });
  }

  private async getAllEntriesSortedByTime(): Promise<CacheEntry[]> {
    await this.init();
    if (!this.db) return [];

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('timestamp');
      const request = index.getAll();

      request.onsuccess = () => {
        resolve(request.result as CacheEntry[]);
      };

      request.onerror = () => resolve([]);
    });
  }
}

export const imageCache = new ImageCacheManager();

export async function getCachedImageUrl(
  itemId: string,
  imageUrl: string,
  fetchUrl: string
): Promise<string> {
  const cached = await imageCache.get(itemId);
  if (cached) return cached;

  try {
    const response = await fetch(fetchUrl);
    if (!response.ok) return imageUrl;

    const blob = await response.blob();
    await imageCache.set(itemId, blob);
    return URL.createObjectURL(blob);
  } catch {
    return imageUrl;
  }
}
