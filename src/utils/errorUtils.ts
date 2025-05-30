
import { toast } from "sonner";

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleApiError = (error: any, fallbackMessage = "An error occurred") => {
  console.error('API Error:', error);
  
  if (error?.message) {
    toast.error(error.message);
    return error.message;
  }
  
  if (typeof error === 'string') {
    toast.error(error);
    return error;
  }
  
  toast.error(fallbackMessage);
  return fallbackMessage;
};

export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delay = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxAttempts) {
        throw error;
      }
      
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError;
};

export const isNetworkError = (error: any): boolean => {
  return (
    error?.code === 'NETWORK_ERROR' ||
    error?.name === 'NetworkError' ||
    error?.message?.includes('network') ||
    error?.message?.includes('fetch')
  );
};
