import { CacheEntry } from '../types';

const DEFAULT_TTL = 5 * 60 * 1000;

class DataCache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private defaultTTL: number;

  constructor(ttl: number = DEFAULT_TTL) {
    this.defaultTTL = ttl;
  }

  set(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const cacheTTL = ttl ?? this.defaultTTL;
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + cacheTTL,
    };

    this.cache.set(key, entry);
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  getExpiredEntries(): string[] {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        expiredKeys.push(key);
      }
    }

    return expiredKeys;
  }

  clean(): void {
    const expiredKeys = this.getExpiredEntries();
    expiredKeys.forEach(key => this.cache.delete(key));
  }

  getStats(): { size: number; expired: number } {
    return {
      size: this.cache.size,
      expired: this.getExpiredEntries().length,
    };
  }

  getAll(): Map<string, T> {
    const result = new Map<string, T>();
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (now <= entry.expiresAt) {
        result.set(key, entry.data);
      }
    }

    return result;
  }
}

export default DataCache;
