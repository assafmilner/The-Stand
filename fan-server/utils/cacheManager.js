// fan-server/utils/cacheManager.js
class CacheManager {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 1000 * 60 * 10; // 10 minutes
    this.maxSize = 1000; // Maximum cache entries
    
    // Auto cleanup every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  set(key, data, ttl = this.defaultTTL) {
    // If cache is full, remove oldest entries
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  delete(key) {
    return this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  cleanup() {
    const now = Date.now();
    let deletedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      console.log(`🧹 Cache cleanup: ${deletedCount} expired entries removed`);
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.hitRate || 0
    };
  }

  // Simple method to cache recent chats
  getCachedRecentChats(userId) {
    return this.get(`recent_chats:${userId}`);
  }

  setCachedRecentChats(userId, chats) {
    this.set(`recent_chats:${userId}`, chats, 1000 * 60 * 5); // 5 minutes
  }

  invalidateUserChats(userId) {
    this.delete(`recent_chats:${userId}`);
  }
}

// Export singleton instance
module.exports = new CacheManager();