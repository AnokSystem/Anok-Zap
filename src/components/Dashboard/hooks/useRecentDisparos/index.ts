
import { useState, useEffect } from 'react';
import { nocodbService } from '@/services/nocodb';
import { userContextService } from '@/services/userContextService';
import { Disparo } from './types';
import { filterDisparosByUser } from './userFilter';
import { transformDisparosData } from './dataTransformer';

export const useRecentDisparos = (limit: number = 10) => {
  const [disparos, setDisparos] = useState<Disparo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDisparos = async () => {
    try {
      setIsLoading(true);
      
      // Ensure user is authenticated before fetching data
      if (!userContextService.isAuthenticated()) {
        console.log('❌ Usuário não autenticado - negando acesso aos disparos');
        setDisparos([]);
        setError('Usuário não autenticado');
        return;
      }

      const userId = userContextService.getUserId();
      const clientId = userContextService.getClientId();
      console.log('📨 Buscando disparos para usuário autenticado:', { userId, clientId });
      
      const data = await nocodbService.getRecentDisparos(limit);
      
      if (data && data.length > 0) {
        console.log('📋 Dados brutos recebidos do NocoDB:', data);
        
        // Apply strict client-side filtering for security - only show records belonging to current user
        const userFilteredData = filterDisparosByUser(data, userId, clientId);
        
        const transformedDisparos = transformDisparosData(userFilteredData);
        
        console.log(`✅ ${transformedDisparos.length} disparos filtrados para usuário ${userId}`);
        setDisparos(transformedDisparos);
        setError(null);
      } else {
        console.log('⚠️ Nenhum disparo encontrado para o usuário');
        setDisparos([]);
        setError(null);
      }
    } catch (err) {
      console.error('❌ Erro ao buscar disparos:', err);
      setError('Erro ao carregar disparos');
      setDisparos([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDisparos();
    
    // Atualizar dados a cada 10 segundos para sincronização mais rápida
    const interval = setInterval(fetchDisparos, 10000);
    
    // Escutar evento customizado de atualização do dashboard
    const handleDashboardRefresh = () => {
      console.log('🔄 Evento de refresh recebido, atualizando disparos...');
      fetchDisparos();
    };
    
    window.addEventListener('dashboardRefresh', handleDashboardRefresh);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('dashboardRefresh', handleDashboardRefresh);
    };
  }, [limit]);

  return {
    disparos,
    isLoading,
    error,
    refetch: fetchDisparos
  };
};
