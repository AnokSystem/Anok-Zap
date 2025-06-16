
import { useState, useEffect } from 'react';
import { nocodbService } from '@/services/nocodb';

export const useDashboardInitialization = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  const initializeDashboard = async () => {
    try {
      setIsInitializing(true);
      setInitError(null);
      
      console.log('🚀 Inicializando Dashboard completo...');
      
      // Verificar conexão com NocoDB
      const connectionResult = await nocodbService.testConnection();
      
      if (!connectionResult.success) {
        throw new Error(connectionResult.error || 'Falha na conexão com NocoDB');
      }
      
      console.log('✅ Conexão com NocoDB estabelecida');
      
      // Inicializar tabelas do dashboard
      const dashboardService = (nocodbService as any).dashboardService;
      if (dashboardService && dashboardService.initializeTables) {
        const targetBaseId = nocodbService.getTargetBaseId();
        if (targetBaseId) {
          await dashboardService.initializeTables(targetBaseId);
        }
      }
      
      console.log('✅ Dashboard inicializado com sucesso');
      setIsInitialized(true);
      
    } catch (error) {
      console.error('❌ Erro ao inicializar dashboard:', error);
      setInitError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    initializeDashboard();
  }, []);

  return {
    isInitialized,
    isInitializing,
    initError,
    retryInitialization: initializeDashboard
  };
};
