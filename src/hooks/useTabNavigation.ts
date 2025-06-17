
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export const useTabNavigation = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const urlParams = new URLSearchParams();
    urlParams.set('tab', tab);
    setSearchParams(urlParams);
  };

  return {
    activeTab,
    handleTabChange
  };
};
