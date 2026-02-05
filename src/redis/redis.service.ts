import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CacheItemsInterface } from 'src/common/utils/interfaces';

@Injectable()
export class RedisService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async cacheSingle(key: string, data: string, ttl?: number): Promise<string> {
    const result = await this.cacheManager.set(key, data, ttl);
    return result;
  }

  async cacheMultiple(items: CacheItemsInterface[], ttl?: number) {
    const pipeline = [];

    for (const item of items) {
      const key = item.key;
      const data = item.data;
      pipeline.push(this.cacheManager.set(key, data, ttl));
    }
    await Promise.all(pipeline);
  }

  async getCachedItem(key: string): Promise<string | undefined> {
    const item: string | undefined = await this.cacheManager.get(key);
    return item;
  }

  async getCachedItems(keys: string[]) {
    const items = [];
    for (const key of keys) {
      const product = await this.cacheManager.get(key);
      if (product) {
        items.push(product);
      }
    }
    return items;
  }

  async removeFromCache(key: string) {
    await this.cacheManager.del(key);
  }

  async removeMultipleFromCache(keys: string[]) {
    const pipeline = [];
    for (const key of keys) {
      pipeline.push(this.cacheManager.del(key));
    }
    await Promise.all(pipeline);
  }
}
