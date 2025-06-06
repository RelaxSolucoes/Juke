import { useRef, useCallback } from 'react';
import { RateLimiter } from '../utils/validation';

interface UseRateLimitOptions {
  maxRequests?: number;
  windowMs?: number;
  keyPrefix?: string;
}

interface UseRateLimitReturn {
  isAllowed: (key?: string) => boolean;
  executeWithLimit: <T extends (...args: any[]) => any>(
    fn: T,
    key?: string
  ) => (...args: Parameters<T>) => ReturnType<T> | null;
  reset: (key?: string) => void;
}

/**
 * Hook for rate limiting actions
 * Useful for preventing spam on search, API calls, etc.
 */
export const useRateLimit = (options: UseRateLimitOptions = {}): UseRateLimitReturn => {
  const {
    maxRequests = 10,
    windowMs = 60000, // 1 minute
    keyPrefix = 'default'
  } = options;

  const rateLimiterRef = useRef<RateLimiter>(
    new RateLimiter(maxRequests, windowMs)
  );

  const isAllowed = useCallback((key = keyPrefix): boolean => {
    return rateLimiterRef.current.isAllowed(key);
  }, [keyPrefix]);

  const executeWithLimit = useCallback(<T extends (...args: any[]) => any>(
    fn: T,
    key = keyPrefix
  ) => {
    return (...args: Parameters<T>): ReturnType<T> | null => {
      if (isAllowed(key)) {
        return fn(...args);
      }
      console.warn(`Rate limit exceeded for key: ${key}`);
      return null;
    };
  }, [isAllowed, keyPrefix]);

  const reset = useCallback((key?: string): void => {
    rateLimiterRef.current.reset(key || keyPrefix);
  }, [keyPrefix]);

  return {
    isAllowed,
    executeWithLimit,
    reset
  };
}; 