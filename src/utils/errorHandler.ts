import { Log } from '../log';

export class ApiErrorHandler {
  static async handleError(
    error: unknown,
    context: string,
    packageName: 'api' | 'component' | 'hook' | 'page' | 'state' | 'style' | 'auth' | 'config' | 'middleware' | 'utils'
  ): Promise<void> {
    try {
      const errorMessage = this.extractErrorMessage(error);
      const fullMessage = `${context}: ${errorMessage}`;

      await Log('frontend', 'error', packageName, fullMessage);
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }

  static extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === 'object' && error !== null) {
      if ('message' in error) {
        return String(error.message);
      }
      return JSON.stringify(error);
    }

    return String(error);
  }

  static async handleNetworkError(endpoint: string): Promise<void> {
    try {
      await Log('frontend', 'error', 'api', `Network error: Unable to connect to ${endpoint}`);
    } catch (error) {
      console.error('Failed to log network error:', error);
    }
  }

  static async handleValidationError(fieldName: string, reason: string): Promise<void> {
    try {
      await Log('frontend', 'warn', 'component', `Validation error in ${fieldName}: ${reason}`);
    } catch (error) {
      console.error('Failed to log validation error:', error);
    }
  }
}
