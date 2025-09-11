import { useState, useEffect } from 'react';

interface NotificationState {
  [key: string]: number;
}

export const useNotificationStorage = () => {
  const [visitedPages, setVisitedPages] = useState<Set<string>>(new Set());

  const markPageAsVisited = (page: string) => {
    setVisitedPages(prev => new Set([...prev, page]));
    localStorage.setItem('visitedPages', JSON.stringify([...visitedPages, page]));
  };

  const isPageVisited = (page: string) => {
    return visitedPages.has(page);
  };

  const clearPageVisit = (page: string) => {
    setVisitedPages(prev => {
      const newSet = new Set(prev);
      newSet.delete(page);
      return newSet;
    });
    const updated = [...visitedPages].filter(p => p !== page);
    localStorage.setItem('visitedPages', JSON.stringify(updated));
  };

  useEffect(() => {
    const stored = localStorage.getItem('visitedPages');
    if (stored) {
      try {
        const pages = JSON.parse(stored);
        setVisitedPages(new Set(pages));
      } catch (error) {
        console.error('Error loading visited pages:', error);
      }
    }
  }, []);

  return { markPageAsVisited, isPageVisited, clearPageVisit };
};