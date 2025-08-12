import { useState, useEffect, useCallback } from 'react';
import { RequestData, generateDummyRequests, simulateRealtimeUpdate, generateStatusData, generateMonthlyData, generateDailyData, generateCategoryData } from '@/lib/dummyData';

export const useRealtimeData = () => {
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const initialData = generateDummyRequests(30);
    setRequests(initialData);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setRequests(current => {
        const updated = simulateRealtimeUpdate(current);
        if (updated.length !== current.length || updated[0]?.id !== current[0]?.id) {
          setLastUpdate(new Date());
        }
        return updated;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    processing: requests.filter(r => r.status === 'processing').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length
  };

  const [chartData, setChartData] = useState({
    monthly: [],
    daily: [],
    category: [],
    status: []
  });
  
  useEffect(() => {
    const newChartData = {
      monthly: generateMonthlyData(requests),
      daily: generateDailyData(requests),
      category: generateCategoryData(),
      status: generateStatusData(requests)
    };
    
    // Only update if data actually changed
    if (JSON.stringify(newChartData) !== JSON.stringify(chartData)) {
      setChartData(newChartData);
    }
  }, [requests, chartData]);

  const refreshData = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      const newData = generateDummyRequests(30);
      setRequests(newData);
      setLastUpdate(new Date());
      setIsLoading(false);
    }, 1000);
  }, []);

  return {
    requests: requests,
    stats,
    chartData,
    isLoading,
    lastUpdate,
    refreshData
  };
};