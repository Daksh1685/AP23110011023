import { Log } from '../log';

class LocalStorageService {
  private readonly prefix = 'notification_app_';

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(this.getKey(key), serialized);

      await Log('frontend', 'debug', 'utils', `LocalStorage: Set ${key}`);
    } catch (error) {
      await Log('frontend', 'warn', 'utils', `LocalStorage: Failed to set ${key}`);
      throw error;
    }
  }

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const item = localStorage.getItem(this.getKey(key));

      if (item === null) {
        return null;
      }

      await Log('frontend', 'debug', 'utils', `LocalStorage: Retrieved ${key}`);
      return JSON.parse(item) as T;
    } catch (error) {
      await Log('frontend', 'warn', 'utils', `LocalStorage: Failed to retrieve ${key}`);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(this.getKey(key));
      await Log('frontend', 'debug', 'utils', `LocalStorage: Removed ${key}`);
    } catch (error) {
      await Log('frontend', 'warn', 'utils', `LocalStorage: Failed to remove ${key}`);
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });

      await Log('frontend', 'debug', 'utils', 'LocalStorage: Cleared all app data');
    } catch (error) {
      await Log('frontend', 'warn', 'utils', 'LocalStorage: Failed to clear data');
    }
  }
}

export const localStorageService = new LocalStorageService();
