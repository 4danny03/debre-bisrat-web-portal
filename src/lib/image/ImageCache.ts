/**
 * Image caching service
 * Provides LRU caching for images to improve performance
 */
export class ImageCache {
  private static instance: ImageCache;
  private cache: Map<string, { data: string; timestamp: number }> = new Map();
  private maxSize: number;
  private maxAge: number; // milliseconds

  private constructor(maxSize = 100, maxAge = 24 * 60 * 60 * 1000) {
    // Default: 100 images, 24 hours
    this.maxSize = maxSize;
    this.maxAge = maxAge;
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ImageCache {
    if (!ImageCache.instance) {
      ImageCache.instance = new ImageCache();
    }
    return ImageCache.instance;
  }

  /**
   * Set cache configuration
   */
  public configure(maxSize: number, maxAge: number): void {
    this.maxSize = maxSize;
    this.maxAge = maxAge;
  }

  /**
   * Get image from cache
   */
  public get(key: string): string | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if item is expired
    if (Date.now() - item.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }

    // Move to front of LRU (by deleting and re-adding)
    this.cache.delete(key);
    this.cache.set(key, { ...item, timestamp: Date.now() });

    return item.data;
  }

  /**
   * Store image in cache
   */
  public set(key: string, data: string): void {
    // Enforce cache size limit (LRU eviction)
    if (this.cache.size >= this.maxSize) {
      // Find oldest entry
      let oldestKey = key;
      let oldestTime = Date.now();

      this.cache.forEach((item, itemKey) => {
        if (item.timestamp < oldestTime) {
          oldestKey = itemKey;
          oldestTime = item.timestamp;
        }
      });

      // Remove oldest entry
      if (oldestKey !== key) {
        this.cache.delete(oldestKey);
      }
    }

    // Add new entry
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Remove image from cache
   */
  public remove(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear entire cache
   */
  public clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  public getStats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.hitCount / (this.hitCount + this.missCount) || 0,
    };
  }

  // Cache performance tracking
  private hitCount = 0;
  private missCount = 0;

  /**
   * Record cache hit
   */
  public recordHit(): void {
    this.hitCount++;
  }

  /**
   * Record cache miss
   */
  public recordMiss(): void {
    this.missCount++;
  }
}

// Export singleton instance
export const imageCache = ImageCache.getInstance();
