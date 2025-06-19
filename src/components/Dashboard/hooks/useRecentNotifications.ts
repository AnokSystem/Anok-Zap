
import { useState, useEffect } from 'react';
import { nocodbService } from '@/services/nocodb';
import { userContextService } from '@/services/userContextService';

interface Notification {
  id: string;
  eventType: string;
  platform: string;
  clientName: string;
  clientEmail: string;
  value?: number;
  createdAt: string;
  productName?: string;
}

export const useRecentNotifications = (limit: number = 10) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      
      if (!userContextService.isAuthenticated()) {
        console.log('❌ Usuário não autenticado - negando acesso às notificações');
        setNotifications([]);
        setError('Usuário não autenticado');
        return;
      }

      const userId = userContextService.getUserId();
      const clientId = userContextService.getClientId();
      console.log('🔔 Buscando notificações para usuário autenticado:', { userId, clientId });
      
      // CORREÇÃO: Buscar dados diretamente da tabela mzup2t8ygoiy5ub
      const baseId = nocodbService.getTargetBaseId();
      if (!baseId) {
        throw new Error('Base ID não encontrado');
      }

      const timestamp = Date.now();
      const response = await fetch(
        `${nocodbService.config.baseUrl}/api/v1/db/data/noco/${baseId}/mzup2t8ygoiy5ub?limit=${limit}&sort=-CreatedAt&_t=${timestamp}`,
        {
          headers: {
            ...nocodbService.headers,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      const allNotifications = data.list || [];
      
      console.log(`📊 ${allNotifications.length} notificações encontradas na tabela mzup2t8ygoiy5ub`);
      
      if (allNotifications.length > 0) {
        console.log('📋 Campos disponíveis:', Object.keys(allNotifications[0]));
        console.log('📝 Primeiros registros:', allNotifications.slice(0, 3));
      }

      // CORREÇÃO: Filtrar por múltiplos campos de identificação do usuário
      const userFilteredData = allNotifications.filter(item => {
        const recordClientId = item.client_id || item['client_id'] || item['Cliente ID'] || item.ClientId;
        const recordUserId = item.user_id || item['user_id'] || item['ID do Usuário'] || item.UserId;
        
        // Verificar também no JSON
        let jsonUserId = null;
        try {
          const jsonData = item['Dados Completos (JSON)'];
          if (jsonData && typeof jsonData === 'string') {
            const parsed = JSON.parse(jsonData);
            jsonUserId = parsed.userId || parsed.user_id;
          }
        } catch (e) {
          // JSON inválido, ignorar
        }
        
        const belongsToUser = recordClientId === userId || 
                             recordClientId === clientId ||
                             recordUserId === userId ||
                             recordUserId === clientId ||
                             jsonUserId === userId ||
                             jsonUserId === clientId;
        
        console.log('🔍 NOTIF RECENTES - Análise:', {
          recordId: item.Id || item.id,
          recordClientId,
          recordUserId,
          jsonUserId,
          userId,
          clientId,
          belongsToUser
        });
        
        return belongsToUser;
      });

      if (userFilteredData.length > 0) {
        const transformedNotifications: Notification[] = userFilteredData.map((item: any) => ({
          id: item.Id || item.id || String(Math.random()),
          eventType: item.event_type || item['Tipo de Evento'] || 'unknown',
          platform: item.platform || item.Platform || item.Plataforma || 'hotmart',
          clientName: item.customer_name || item['Nome do Cliente'] || 'Cliente não identificado',
          clientEmail: item.customer_email || item['Email do Cliente'] || 'email@naoidentificado.com',
          value: parseFloat(item.value || item.Valor || '0'),
          createdAt: item.event_date || item.CreatedAt || item.created_at || new Date().toISOString(),
          productName: item.product_name || item['Nome do Produto'] || 'Produto não identificado'
        }));
        
        console.log(`✅ ${transformedNotifications.length} notificações filtradas para usuário ${userId}/${clientId}`);
        setNotifications(transformedNotifications);
        setError(null);
      } else {
        console.log('⚠️ Nenhuma notificação encontrada para o usuário');
        setNotifications([]);
        setError(null);
      }
    } catch (err) {
      console.error('❌ Erro ao buscar notificações:', err);
      setError('Erro ao carregar notificações');
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    const interval = setInterval(fetchNotifications, 30000);
    
    const handleDashboardRefresh = () => {
      console.log('🔄 Evento de refresh recebido, atualizando notificações...');
      fetchNotifications();
    };
    
    window.addEventListener('dashboardRefresh', handleDashboardRefresh);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('dashboardRefresh', handleDashboardRefresh);
    };
  }, [limit]);

  return {
    notifications,
    isLoading,
    error,
    refetch: fetchNotifications
  };
};
