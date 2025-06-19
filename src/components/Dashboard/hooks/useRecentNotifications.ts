
import { useState, useEffect } from 'react';
import { nocodbService } from '@/services/nocodb';
import { userContextService } from '@/services/userContextService';

interface Notification {
  id: string;
  eventType: string;
  platform: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
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
      
      // Buscar dados diretamente da tabela mzup2t8ygoiy5ub
      const baseId = nocodbService.getTargetBaseId();
      if (!baseId) {
        throw new Error('Base ID não encontrado');
      }

      const timestamp = Date.now();
      const response = await fetch(
        `${nocodbService.config.baseUrl}/api/v1/db/data/noco/${baseId}/mzup2t8ygoiy5ub?limit=${limit * 3}&sort=-CreatedAt&_t=${timestamp}`,
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

      // Filtrar por Cliente ID - campo específico para identificar o usuário
      const userFilteredData = allNotifications.filter(item => {
        const recordClientId = item['Cliente ID'] || item.client_id;
        
        // Verificar se pertence ao usuário atual
        const belongsToUser = recordClientId === userId || recordClientId === clientId;
        
        console.log('🔍 NOTIF RECENTES - Análise:', {
          recordId: item.Id || item.id,
          recordClientId,
          userId,
          clientId,
          belongsToUser
        });
        
        return belongsToUser;
      });

      if (userFilteredData.length > 0) {
        // Transformar os dados para o formato esperado pelo componente
        const transformedNotifications: Notification[] = userFilteredData
          .slice(0, limit) // Aplicar limite após filtrar
          .map((item: any) => ({
            id: item.Id || item.id || String(Math.random()),
            eventType: item.event_type || item['Tipo de Evento'] || 'purchase',
            platform: item.platform || item.Platform || item.Plataforma || 'hotmart',
            clientName: item.customer_name || item['Nome do Cliente'] || 'Cliente não identificado',
            clientEmail: item.customer_email || item['Email do Cliente'] || 'email@naoidentificado.com',
            clientPhone: item.customer_phone || item['Telefone do Cliente'] || item['Phone'] || '',
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
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchNotifications, 30000);
    
    // Escutar eventos de refresh do dashboard
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
