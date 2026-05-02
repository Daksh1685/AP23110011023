import { useEffect } from 'react';
import { Log } from '../log';

interface UsePageTrackingOptions {
  pageName: string;
  packageName?: 'page' | 'component';
}

export const usePageTracking = ({
  pageName,
  packageName = 'page'
}: UsePageTrackingOptions): void => {
  useEffect(() => {
    const logPageView = async () => {
      try {
        await Log('frontend', 'info', packageName, `Page viewed: ${pageName}`);
      } catch (error) {
        console.error('Failed to log page view:', error);
      }
    };

    logPageView();
  }, [pageName, packageName]);
};
