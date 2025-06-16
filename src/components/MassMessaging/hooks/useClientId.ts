
import { useCallback } from 'react';

export const useClientId = () => {
  const getClientId = useCallback((): string => {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return user.client_id || user.Email?.split('@')[0] || 'default';
  }, []);

  return { getClientId };
};
