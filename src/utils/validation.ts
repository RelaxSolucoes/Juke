/**
 * Validation and sanitization utilities
 */

// Regex patterns for validation
const PATTERNS = {
  partyCode: /^[A-Z0-9]{6}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^https?:\/\/.+$/,
  spotifyUri: /^spotify:(track|album|artist|playlist):[a-zA-Z0-9]+$/,
};

// Input length limits
const LIMITS = {
  partyName: { min: 1, max: 100 },
  guestName: { min: 1, max: 50 },
  partyCode: { min: 6, max: 6 },
  searchQuery: { min: 1, max: 200 },
};

/**
 * Sanitize string input by removing dangerous characters
 * Preserva acentos e caracteres especiais do português
 */
export const sanitizeString = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/[^\w\s\-_.!?@#$%&*()+=àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ]/g, '') // Keep safe characters + acentos
    .substring(0, 500); // Limit length
};

/**
 * Validate party code format
 */
export const validatePartyCode = (code: string): boolean => {
  return PATTERNS.partyCode.test(code);
};

/**
 * Validate and sanitize party name
 */
export const validatePartyName = (name: string): { isValid: boolean; error?: string; sanitized: string } => {
  const sanitized = sanitizeString(name);
  
  if (sanitized.length < LIMITS.partyName.min) {
    return { isValid: false, error: 'Nome da festa é obrigatório', sanitized };
  }
  
  if (sanitized.length > LIMITS.partyName.max) {
    return { isValid: false, error: `Nome da festa deve ter no máximo ${LIMITS.partyName.max} caracteres`, sanitized };
  }
  
  return { isValid: true, sanitized };
};

/**
 * Validate and sanitize guest name
 */
export const validateGuestName = (name: string): { isValid: boolean; error?: string; sanitized: string } => {
  const sanitized = sanitizeString(name);
  
  if (sanitized.length < LIMITS.guestName.min) {
    return { isValid: false, error: 'Nome é obrigatório', sanitized };
  }
  
  if (sanitized.length > LIMITS.guestName.max) {
    return { isValid: false, error: `Nome deve ter no máximo ${LIMITS.guestName.max} caracteres`, sanitized };
  }
  
  return { isValid: true, sanitized };
};

/**
 * Validate search query
 */
export const validateSearchQuery = (query: string): { isValid: boolean; error?: string; sanitized: string } => {
  const sanitized = sanitizeString(query);
  
  if (sanitized.length < LIMITS.searchQuery.min) {
    return { isValid: false, error: 'Digite algo para buscar', sanitized };
  }
  
  if (sanitized.length > LIMITS.searchQuery.max) {
    return { isValid: false, error: `Busca deve ter no máximo ${LIMITS.searchQuery.max} caracteres`, sanitized };
  }
  
  return { isValid: true, sanitized };
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  return PATTERNS.email.test(email);
};

/**
 * Validate URL format
 */
export const validateUrl = (url: string): boolean => {
  return PATTERNS.url.test(url);
};

/**
 * Validate Spotify URI format
 */
export const validateSpotifyUri = (uri: string): boolean => {
  return PATTERNS.spotifyUri.test(uri);
};

/**
 * Rate limiting helper
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  constructor(
    private maxRequests: number = 10,
    private windowMs: number = 60000 // 1 minute
  ) {}
  
  isAllowed(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return true;
  }
  
  reset(key?: string): void {
    if (key) {
      this.requests.delete(key);
    } else {
      this.requests.clear();
    }
  }
}

/**
 * Error sanitization for user display
 */
export const sanitizeErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') {
    return sanitizeString(error).substring(0, 200);
  }
  
  if (error instanceof Error) {
    return sanitizeString(error.message).substring(0, 200);
  }
  
  return 'Ocorreu um erro inesperado';
};

/**
 * Input debouncing utility
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Safe JSON parsing
 */
export const safeJsonParse = <T>(json: string, fallback: T): T => {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}; 