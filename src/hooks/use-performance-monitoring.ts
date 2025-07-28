import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

const sendMetricsToAnalytics = (
  metrics: Partial<PerformanceMetrics>,
  path: string,
) => {
  // Replace this with your actual analytics service
  console.log("Performance metrics for", path, metrics);

  // If you have a backend endpoint:
  // fetch('/api/metrics', {
  //   method: 'POST',
  //   body: JSON.stringify({ metrics, path }),
  // });
};

export function usePerformanceMonitoring() {
  const location = useLocation();

  useEffect(() => {
    if ("PerformanceObserver" in window) {
      // First Contentful Paint
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        if (entries.length > 0) {
          const fcp = entries[0];
          sendMetricsToAnalytics({ fcp: fcp.startTime }, location.pathname);
        }
      }).observe({ entryTypes: ["paint"] });

      // Largest Contentful Paint
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        if (entries.length > 0) {
          const lcp = entries[entries.length - 1];
          sendMetricsToAnalytics({ lcp: lcp.startTime }, location.pathname);
        }
      }).observe({ entryTypes: ["largest-contentful-paint"] });

      // First Input Delay
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        if (entries.length > 0) {
          const fid = entries[0];
          sendMetricsToAnalytics(
            { fid: fid.processingStart - fid.startTime },
            location.pathname,
          );
        }
      }).observe({ entryTypes: ["first-input"] });

      // Cumulative Layout Shift
      new PerformanceObserver((entryList) => {
        let cls = 0;
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            cls += (entry as any).value;
          }
        }
        sendMetricsToAnalytics({ cls }, location.pathname);
      }).observe({ entryTypes: ["layout-shift"] });

      // Time to First Byte
      const navigation = performance.getEntriesByType(
        "navigation",
      )[0] as PerformanceNavigationTiming;
      if (navigation) {
        const ttfb = navigation.responseStart - navigation.requestStart;
        sendMetricsToAnalytics({ ttfb }, location.pathname);
      }
    }
  }, [location.pathname]);
}
