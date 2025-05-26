// fan-server/utils/performanceMonitor.js - PERFORMANCE MONITORING
const os = require('os');
const mongoose = require('mongoose');

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: 0,
      errors: 0,
      responseTimeSum: 0,
      activeConnections: 0,
      dbQueries: 0,
      cacheHits: 0,
      cacheMisses: 0,
      socketConnections: 0,
      messagesPerSecond: 0,
      lastReset: Date.now()
    };
    
    this.recentResponseTimes = [];
    this.maxResponseTimeHistory = 100; // Keep last 100 response times
    this.alertThresholds = {
      responseTime: 1000, // 1 second
      errorRate: 0.05, // 5%
      memoryUsage: 0.85, // 85%
      dbResponseTime: 500 // 500ms
    };
    
    this.startMonitoring();
  }

  // Middleware to track request performance
  trackRequest() {
    return (req, res, next) => {
      const startTime = Date.now();
      this.metrics.requests++;
      
      // Track response time
      const originalSend = res.send;
      res.send = (body) => {
        const responseTime = Date.now() - startTime;
        this.recordResponseTime(responseTime);
        
        // Track errors (4xx and 5xx status codes)
        if (res.statusCode >= 400) {
          this.metrics.errors++;
        }
        
        return originalSend.call(res, body);
      };
      
      next();
    };
  }

  // Record response time
  recordResponseTime(time) {
    this.metrics.responseTimeSum += time;
    this.recentResponseTimes.push(time);
    
    // Keep only recent response times
    if (this.recentResponseTimes.length > this.maxResponseTimeHistory) {
      this.recentResponseTimes.shift();
    }
    
    // Alert on slow response
    if (time > this.alertThresholds.responseTime) {
      console.warn(`⚠️ Slow response detected: ${time}ms`);
    }
  }

  // Track database query performance
  trackDbQuery(queryType, duration) {
    this.metrics.dbQueries++;
    
    if (duration > this.alertThresholds.dbResponseTime) {
      console.warn(`⚠️ Slow DB query (${queryType}): ${duration}ms`);
    }
  }

  // Track cache performance
  trackCacheHit() {
    this.metrics.cacheHits++;
  }

  trackCacheMiss() {
    this.metrics.cacheMisses++;
  }

  // Track socket connections
  trackSocketConnection(isConnected) {
    if (isConnected) {
      this.metrics.socketConnections++;
    } else {
      this.metrics.socketConnections = Math.max(0, this.metrics.socketConnections - 1);
    }
  }

  // Track message rate
  trackMessage() {
    this.metrics.messagesPerSecond++;
  }

  // Get current performance metrics
  getMetrics() {
    const now = Date.now();
    const timeElapsed = (now - this.metrics.lastReset) / 1000; // seconds
    
    const avgResponseTime = this.metrics.requests > 0 
      ? this.metrics.responseTimeSum / this.metrics.requests 
      : 0;
    
    const errorRate = this.metrics.requests > 0 
      ? this.metrics.errors / this.metrics.requests 
      : 0;
    
    const cacheHitRate = (this.metrics.cacheHits + this.metrics.cacheMisses) > 0
      ? this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses)
      : 0;

    return {
      requests: {
        total: this.metrics.requests,
        perSecond: timeElapsed > 0 ? this.metrics.requests / timeElapsed : 0,
        errors: this.metrics.errors,
        errorRate: errorRate
      },
      responseTime: {
        average: Math.round(avgResponseTime),
        recent: this.recentResponseTimes.slice(-10), // Last 10 response times
        p95: this.calculatePercentile(this.recentResponseTimes, 0.95),
        p99: this.calculatePercentile(this.recentResponseTimes, 0.99)
      },
      database: {
        queries: this.metrics.dbQueries,
        queriesPerSecond: timeElapsed > 0 ? this.metrics.dbQueries / timeElapsed : 0,
        connections: mongoose.connection.readyState
      },
      cache: {
        hits: this.metrics.cacheHits,
        misses: this.metrics.cacheMisses,
        hitRate: cacheHitRate
      },
      socket: {
        activeConnections: this.metrics.socketConnections
      },
      messaging: {
        messagesPerSecond: timeElapsed > 0 ? this.metrics.messagesPerSecond / timeElapsed : 0
      },
      system: this.getSystemMetrics(),
      uptime: process.uptime(),
      timestamp: now
    };
  }

  // Calculate percentile from array of values
  calculatePercentile(values, percentile) {
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * percentile) - 1;
    return Math.round(sorted[index] || 0);
  }

  // Get system metrics
  getSystemMetrics() {
    const memUsage = process.memoryUsage();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    
    return {
      memory: {
        used: Math.round(memUsage.rss / 1024 / 1024), // MB
        heap: {
          used: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
          total: Math.round(memUsage.heapTotal / 1024 / 1024) // MB
        },
        system: {
          used: Math.round(usedMem / 1024 / 1024), // MB
          total: Math.round(totalMem / 1024 / 1024), // MB
          usage: usedMem / totalMem
        }
      },
      cpu: {
        usage: process.cpuUsage(),
        loadAverage: os.loadavg()
      },
      platform: os.platform(),
      nodeVersion: process.version
    };
  }

  // Check for performance alerts
  checkAlerts() {
    const metrics = this.getMetrics();
    const alerts = [];

    // High error rate
    if (metrics.requests.errorRate > this.alertThresholds.errorRate) {
      alerts.push({
        type: 'HIGH_ERROR_RATE',
        message: `Error rate is ${(metrics.requests.errorRate * 100).toFixed(2)}%`,
        severity: 'warning'
      });
    }

    // High response time
    if (metrics.responseTime.average > this.alertThresholds.responseTime) {
      alerts.push({
        type: 'SLOW_RESPONSE',
        message: `Average response time is ${metrics.responseTime.average}ms`,
        severity: 'warning'
      });
    }

    // High memory usage
    if (metrics.system.memory.system.usage > this.alertThresholds.memoryUsage) {
      alerts.push({
        type: 'HIGH_MEMORY_USAGE',
        message: `Memory usage is ${(metrics.system.memory.system.usage * 100).toFixed(2)}%`,
        severity: 'critical'
      });
    }

    // Database connection issues
    if (metrics.database.connections !== 1) { // 1 = connected
      alerts.push({
        type: 'DB_CONNECTION_ISSUE',
        message: 'Database connection issue detected',
        severity: 'critical'
      });
    }

    return alerts;
  }

  // Reset metrics (call this periodically)
  resetMetrics() {
    this.metrics = {
      requests: 0,
      errors: 0,
      responseTimeSum: 0,
      activeConnections: this.metrics.activeConnections,
      dbQueries: 0,
      cacheHits: 0,
      cacheMisses: 0,
      socketConnections: this.metrics.socketConnections,
      messagesPerSecond: 0,
      lastReset: Date.now()
    };
    this.recentResponseTimes = [];
  }

  // Start monitoring (periodic checks and cleanup)
  startMonitoring() {
    // Reset metrics every hour
    setInterval(() => {
      const alerts = this.checkAlerts();
      if (alerts.length > 0) {
        console.log('🚨 Performance Alerts:', alerts);
      }
      
      // Log current metrics
      const metrics = this.getMetrics();
      console.log('📊 Performance Metrics:', {
        requests: `${metrics.requests.total} (${metrics.requests.perSecond.toFixed(2)}/sec)`,
        avgResponseTime: `${metrics.responseTime.average}ms`,
        errorRate: `${(metrics.requests.errorRate * 100).toFixed(2)}%`,
        cacheHitRate: `${(metrics.cache.hitRate * 100).toFixed(2)}%`,
        memoryUsage: `${metrics.system.memory.used}MB`,
        socketConnections: metrics.socket.activeConnections
      });
      
      this.resetMetrics();
    }, 60 * 60 * 1000); // Every hour

    // Garbage collection monitoring
    if (global.gc) {
      const originalGC = global.gc;
      global.gc = () => {
        const before = process.memoryUsage();
        const result = originalGC();
        const after = process.memoryUsage();
        const freed = before.heapUsed - after.heapUsed;
        
        if (freed > 0) {
          console.log(`🗑️ GC freed ${Math.round(freed / 1024 / 1024)}MB`);
        }
        
        return result;
      };
    }

    console.log('📊 Performance monitoring started');
  }

  // Generate performance report
  generateReport() {
    const metrics = this.getMetrics();
    const alerts = this.checkAlerts();
    
    return {
      summary: {
        status: alerts.length === 0 ? 'healthy' : 'issues_detected',
        uptime: `${Math.floor(metrics.uptime / 3600)}h ${Math.floor((metrics.uptime % 3600) / 60)}m`,
        totalRequests: metrics.requests.total,
        averageResponseTime: `${metrics.responseTime.average}ms`,
        errorRate: `${(metrics.requests.errorRate * 100).toFixed(2)}%`
      },
      metrics,
      alerts,
      recommendations: this.generateRecommendations(metrics, alerts)
    };
  }

  // Generate performance recommendations
  generateRecommendations(metrics, alerts) {
    const recommendations = [];

    if (metrics.requests.errorRate > 0.01) { // 1%
      recommendations.push({
        category: 'errors',
        message: 'Consider implementing better error handling and monitoring',
        priority: 'medium'
      });
    }

    if (metrics.cache.hitRate < 0.8) { // 80%
      recommendations.push({
        category: 'cache',
        message: 'Cache hit rate is low. Review caching strategy',
        priority: 'medium'
      });
    }

    if (metrics.responseTime.p95 > 2000) { // 2 seconds
      recommendations.push({
        category: 'performance',
        message: '95th percentile response time is high. Consider optimizing slow endpoints',
        priority: 'high'
      });
    }

    if (metrics.system.memory.system.usage > 0.7) { // 70%
      recommendations.push({
        category: 'memory',
        message: 'Memory usage is high. Consider implementing memory optimization',
        priority: 'medium'
      });
    }

    return recommendations;
  }
}

// Database query monitoring middleware
const mongooseQueryMonitor = () => {
  mongoose.plugin((schema) => {
    schema.pre(/^find/, function() {
      this._startTime = Date.now();
    });

    schema.post(/^find/, function() {
      if (this._startTime && global.performanceMonitor) {
        const duration = Date.now() - this._startTime;
        global.performanceMonitor.trackDbQuery('find', duration);
      }
    });

    schema.pre('save', function() {
      this._startTime = Date.now();
    });

    schema.post('save', function() {
      if (this._startTime && global.performanceMonitor) {
        const duration = Date.now() - this._startTime;
        global.performanceMonitor.trackDbQuery('save', duration);
      }
    });
  });
};

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Make it globally available
global.performanceMonitor = performanceMonitor;

module.exports = {
  performanceMonitor,
  mongooseQueryMonitor
};