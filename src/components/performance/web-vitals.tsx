'use client';

import { useEffect } from 'react';
import { onCLS, onINP, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';

interface WebVitalsMetric {
  id: string;
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface PerformanceWithMemory extends Performance {
  memory?: PerformanceMemory;
}

// Type for gtag function
interface GtagWindow extends Window {
  gtag?: (
    command: string,
    targetId: string,
    config?: Record<string, unknown>
  ) => void;
}

function sendToAnalytics(metric: WebVitalsMetric) {
  // Send to Google Analytics 4
  if (typeof window !== 'undefined' && 'gtag' in window) {
    const gtagWindow = window as GtagWindow;
    gtagWindow.gtag?.('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_category: 'Web Vitals',
      event_label: metric.id,
      non_interaction: true,
    });
  }

  // Send to console for development
  console.log('Web Vital:', metric);

  // Example: Send to custom analytics endpoint
  // void fetch('/api/analytics/web-vitals', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(metric),
  // }).catch((error: Error) => console.error('Analytics error:', error));
}

export function WebVitals() {
  useEffect(() => {
    // Largest Contentful Paint (LCP)
    onLCP((metric: Metric) => {
      try {
        sendToAnalytics({
          id: metric.id,
          name: 'LCP',
          value: metric.value,
          rating: metric.rating,
        });
      } catch (error) {
        console.error('Error sending LCP metric:', error);
      }
    });

    // Interaction to Next Paint (INP)
    onINP((metric: Metric) => {
      try {
        sendToAnalytics({
          id: metric.id,
          name: 'INP',
          value: metric.value,
          rating: metric.rating,
        });
      } catch (error) {
        console.error('Error sending INP metric:', error);
      }
    });

    // Cumulative Layout Shift (CLS)
    onCLS((metric: Metric) => {
      try {
        sendToAnalytics({
          id: metric.id,
          name: 'CLS',
          value: metric.value,
          rating: metric.rating,
        });
      } catch (error) {
        console.error('Error sending CLS metric:', error);
      }
    });

    // First Contentful Paint (FCP)
    onFCP((metric: Metric) => {
      try {
        sendToAnalytics({
          id: metric.id,
          name: 'FCP',
          value: metric.value,
          rating: metric.rating,
        });
      } catch (error) {
        console.error('Error sending FCP metric:', error);
      }
    });

    // Time to First Byte (TTFB)
    onTTFB((metric: Metric) => {
      try {
        sendToAnalytics({
          id: metric.id,
          name: 'TTFB',
          value: metric.value,
          rating: metric.rating,
        });
      } catch (error) {
        console.error('Error sending TTFB metric:', error);
      }
    });
  }, []);

  // This component doesn't render anything
  return null;
}

// Performance monitoring hook
export function usePerformanceMonitoring() {
  useEffect(() => {
    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            console.warn('Long task detected:', {
              duration: entry.duration,
              startTime: entry.startTime,
            });
          }
        }
      });
      
      observer.observe({ entryTypes: ['longtask'] });
      
      return () => observer.disconnect();
    }
  }, []);

  useEffect(() => {
    // Monitor navigation timing
    if (typeof window !== 'undefined' && 'performance' in window && 'getEntriesByType' in performance) {
      const navigationEntries = performance.getEntriesByType('navigation');
      if (navigationEntries.length > 0) {
        const navigation = navigationEntries[0]! as PerformanceNavigationTiming;
        
        const metrics = {
          dns: navigation.domainLookupEnd - navigation.domainLookupStart,
          tcp: navigation.connectEnd - navigation.connectStart,
          request: navigation.responseStart - navigation.requestStart,
          response: navigation.responseEnd - navigation.responseStart,
          dom: navigation.domContentLoadedEventEnd - navigation.responseEnd,
          load: navigation.loadEventEnd - navigation.loadEventStart,
        };
        
        if (process.env.NODE_ENV === 'development') {
          console.log('Navigation Timing:', metrics);
        }
      }
    }
  }, []);
}

// Resource loading performance monitor
export function useResourceMonitoring() {
  useEffect(() => {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const resource = entry as PerformanceResourceTiming;
          
          // Log slow resources (> 1 second)
          if (resource.duration > 1000) {
            console.warn('Slow resource detected:', {
              name: resource.name,
              duration: resource.duration,
              size: resource.transferSize,
              type: resource.initiatorType,
            });
          }
        }
      });
      
      observer.observe({ entryTypes: ['resource'] });
      
      return () => observer.disconnect();
    }
  }, []);
}

// Memory usage monitoring
export function useMemoryMonitoring() {
  useEffect(() => {
    const checkMemory = () => {
      const performanceWithMemory = performance as PerformanceWithMemory;
      if (performanceWithMemory.memory) {
        const memory = performanceWithMemory.memory;
        const memoryUsage = {
          used: Math.round(memory.usedJSHeapSize / 1048576), // MB
          total: Math.round(memory.totalJSHeapSize / 1048576), // MB
          limit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
        };
        
        // Warn if memory usage is high
        if (memoryUsage.used / memoryUsage.limit > 0.8) {
          console.warn('High memory usage detected:', memoryUsage);
        }
        
        if (process.env.NODE_ENV === 'development') {
          console.log('Memory Usage:', memoryUsage);
        }
      }
    };
    
    // Check memory every 30 seconds
    const interval = setInterval(checkMemory, 30000);
    
    return () => clearInterval(interval);
  }, []);
}