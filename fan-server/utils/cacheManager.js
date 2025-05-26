// fan-server/utils/cacheManager.js - ENHANCED VERSION
class CacheManager {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 1000 * 60 * 5; // 5 minutes default
    this.maxSize = 1000; // Maximum cache entries
    this.cleanupInterval = 1000 * 60 * 2; // Cleanup every 2 minutes
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      cleanups: 0
    };
    
    // Start automatic cleanup
    this.startCleanup();
  }

  // Get value from cache
  get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    const now = Date.now();
    const isExpired = now - entry.timestamp > entry.ttl;
    
    if (isExpired) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    // Update access time for LRU
    entry.lastAccessed = now;
    this.stats.hits++;
    return entry.data;
  }

  // Set value in cache
  set(key, data, ttl = this.defaultTTL) {
    // Enforce max size with LRU eviction
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      lastAccessed: now,
      ttl
    });
    
    this.stats.sets++;
    return true;
  }

  // Check if key exists and is valid
  has(key) {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  // Delete specific key
  invalidate(key) {
    const deleted = this.cache.delete(key);
    if (deleted) this.stats.deletes++;
    return deleted;
  }

  // Delete all keys matching a pattern
  invalidatePattern(pattern) {
    let deletedCount = 0;
    
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }
    
    this.stats.deletes += deletedCount;
    return deletedCount;
  }

  // Clear all cache
  clear() {
    const size = this.cache.size;
    this.cache.clear();
    this.stats.deletes += size;
    return size;
  }

  // Get cache statistics
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0 
      ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
      : 0;
      
    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      size: this.cache.size,
      maxSize: this.maxSize
    };
  }

  // Reset statistics
  resetStats() {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      cleanups: 0
    };
  }

  // Get all cached keys (for debugging)
  getKeys() {
    return Array.from(this.cache.keys());
  }

  // Get cache size
  size() {
    return this.cache.size;
  }

  // Evict least recently used items
  evictLRU() {
    let oldestKey = null;
    let oldestTime = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.deletes++;
    }
  }

  // Clean up expired entries
  cleanup() {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }
    
    this.stats.cleanups++;
    this.stats.deletes += cleanedCount;
    
    if (cleanedCount > 0) {
      console.log(`🧹 Cache cleanup: removed ${cleanedCount} expired entries`);
    }
    
    return cleanedCount;
  }

  // Start automatic cleanup
  startCleanup() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
  }

  // Stop automatic cleanup
  stopCleanup() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  // Update TTL for existing entry
  updateTTL(key, newTTL) {
    const entry = this.cache.get(key);
    if (entry) {
      entry.ttl = newTTL;
      entry.timestamp = Date.now(); // Reset timestamp
      return true;
    }
    return false;
  }

  // Get remaining TTL for a key
  getRemainingTTL(key) {
    const entry = this.cache.get(key);
    if (!entry) return 0;
    
    const elapsed = Date.now() - entry.timestamp;
    const remaining = entry.ttl - elapsed;
    return Math.max(0, remaining);
  }

  // Batch operations
  setMany(entries) {
    let setCount = 0;
    for (const [key, { data, ttl }] of entries) {
      if (this.set(key, data, ttl)) {
        setCount++;
      }
    }
    return setCount;
  }

  getMany(keys) {
    const results = {};
    for (const key of keys) {
      const value = this.get(key);
      if (value !== null) {
        results[key] = value;
      }
    }
    return results;
  }

  // Cache warming - preload data
  warm(key, dataFunction, ttl = this.defaultTTL) {
    if (!this.has(key)) {
      try {
        const data = dataFunction();
        if (data !== null && data !== undefined) {
          this.set(key, data, ttl);
          return true;
        }
      } catch (error) {
        console.error(`Cache warming failed for key ${key}:`, error);
      }
    }
    return false;
  }

  // Memory usage estimation (rough)
  getMemoryUsage() {
    let totalSize = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      // Rough estimation
      totalSize += key.length * 2; // String keys
      totalSize += JSON.stringify(entry.data).length * 2; // Data
      totalSize += 64; // Metadata overhead
    }
    
    return {
      entries: this.cache.size,
      estimatedBytes: totalSize,
      estimatedMB: (totalSize / 1024 / 1024).toFixed(2)
    };
  }

  // Export cache for persistence (optional)
  export() {
    const entries = [];
    for (const [key, entry] of this.cache.entries()) {
      entries.push({
        key,
        data: entry.data,
        timestamp: entry.timestamp,
        ttl: entry.ttl
      });
    }
    return entries;
  }

  // Import cache from persistence (optional)
  import(entries) {
    const now = Date.now();
    let importedCount = 0;
    
    for (const entry of entries) {
      // Check if entry is still valid
      if (now - entry.timestamp < entry.ttl) {
        this.cache.set(entry.key, {
          data: entry.data,
          timestamp: entry.timestamp,
          lastAccessed: now,
          ttl: entry.ttl
        });
        importedCount++;
      }
    }
    
    return importedCount;
  }

  // Shutdown cleanup
  shutdown() {
    this.stopCleanup();
    this.clear();
    console.log('🔄 Cache manager shutdown complete');
  }
}

// Create and export singleton instance
const cacheManager = new CacheManager();

// Graceful shutdown handling
process.on('SIGTERM', () => {
  cacheManager.shutdown();
});

process.on('SIGINT', () => {
  cacheManager.shutdown();
});

module.exports = cacheManager;