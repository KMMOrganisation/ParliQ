import React from 'react';
import { ApiService } from '../services/api';

interface SystemStatus {
  status: string;
  videosIngested: number;
  entitiesExtracted: number;
}

export function useSystemStatus() {
  const [status, setStatus] = React.useState<SystemStatus>({
    status: 'loading',
    videosIngested: 0,
    entitiesExtracted: 0
  });

  React.useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await ApiService.getSystemStatus();
        setStatus(data);
      } catch (error) {
        console.error('Failed to fetch system status:', error);
        setStatus({
          status: 'error',
          videosIngested: 0,
          entitiesExtracted: 0
        });
      }
    };

    fetchStatus();
    
    // Refresh status every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return status;
}