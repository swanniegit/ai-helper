/**
 * Enhanced Debug Logger
 * Provides structured logging for easier debugging
 */

export class DebugLogger {
  private static isDevelopment = process.env.NODE_ENV === 'development';
  
  static info(context: string, message: string, data?: any) {
    if (this.isDevelopment) {
      console.log(`🔍 [${context}] ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  }
  
  static error(context: string, message: string, error?: any) {
    console.error(`❌ [${context}] ${message}`, error);
  }
  
  static warn(context: string, message: string, data?: any) {
    if (this.isDevelopment) {
      console.warn(`⚠️ [${context}] ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  }
  
  static success(context: string, message: string, data?: any) {
    if (this.isDevelopment) {
      console.log(`✅ [${context}] ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  }
  
  static api(method: string, url: string, status: number, duration?: number) {
    const emoji = status >= 400 ? '❌' : status >= 300 ? '🔄' : '✅';
    const time = duration ? ` (${duration}ms)` : '';
    console.log(`${emoji} [API] ${method} ${url} - ${status}${time}`);
  }
  
  static database(operation: string, table: string, success: boolean, error?: any) {
    const emoji = success ? '✅' : '❌';
    console.log(`${emoji} [DB] ${operation} on ${table}`, error ? error : '');
  }
}