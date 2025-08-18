// XSS Protection utilities
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/script/gi, 'scr1pt') // Neutralize script tags
    .replace(/eval\s*\(/gi, 'eval (') // Break eval calls
    .replace(/expression\s*\(/gi, 'expression (') // Break CSS expressions
    .trim();
}

export function sanitizeObject<T>(obj: T): T {
  if (typeof obj === 'string') {
    return sanitizeInput(obj) as T;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item)) as T;
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[sanitizeInput(key)] = sanitizeObject(value);
    }
    return sanitized as T;
  }
  
  return obj;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && !/<|>|script/i.test(email);
}

export function validateInput(input: string, maxLength: number = 1000): boolean {
  if (!input || typeof input !== 'string') return false;
  if (input.length > maxLength) return false;
  
  // Check for common XSS patterns
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /eval\s*\(/i,
    /expression\s*\(/i
  ];
  
  return !xssPatterns.some(pattern => pattern.test(input));
}