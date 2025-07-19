/**
 * Client-side debugging helpers
 */

export const debugLog = (context: string, message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔍 [${context}] ${message}`, data || '');
  }
};

export const debugError = (context: string, error: any) => {
  console.error(`❌ [${context}]`, error);
};

export const debugAPI = async (url: string, options?: RequestInit) => {
  const startTime = Date.now();
  debugLog('API', `${options?.method || 'GET'} ${url}`);
  
  try {
    const response = await fetch(url, options);
    const duration = Date.now() - startTime;
    debugLog('API', `${response.status} ${url} (${duration}ms)`);
    return response;
  } catch (error) {
    debugError('API', `Failed ${url}: ${error}`);
    throw error;
  }
};