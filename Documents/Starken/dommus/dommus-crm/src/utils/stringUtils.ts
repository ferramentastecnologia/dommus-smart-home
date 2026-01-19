/**
 * Converts snake_case to camelCase
 */
export function snakeToCamel(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => snakeToCamel(item));
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  const camelCaseObj: Record<string, any> = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        camelCaseObj[camelKey] = snakeToCamel(obj[key]);
      } else if (Array.isArray(obj[key])) {
        camelCaseObj[camelKey] = obj[key].map((item: any) => 
          typeof item === 'object' && item !== null ? snakeToCamel(item) : item
        );
      } else {
        camelCaseObj[camelKey] = obj[key];
      }
    }
  }
  
  return camelCaseObj;
}

/**
 * Converts camelCase to snake_case
 */
export function camelToSnake(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => camelToSnake(item));
  }

  // Handle Date objects by converting them to ISO strings
  if (obj instanceof Date) {
    return obj.toISOString();
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  const snakeCaseObj: Record<string, any> = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      
      const value = obj[key];
      
      // Handle Date objects in properties
      if (value instanceof Date) {
        snakeCaseObj[snakeKey] = value.toISOString();
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        snakeCaseObj[snakeKey] = camelToSnake(value);
      } else if (Array.isArray(value)) {
        snakeCaseObj[snakeKey] = value.map((item: any) => 
          typeof item === 'object' && item !== null ? camelToSnake(item) : item
        );
      } else {
        snakeCaseObj[snakeKey] = value;
      }
    }
  }
  
  return snakeCaseObj;
} 