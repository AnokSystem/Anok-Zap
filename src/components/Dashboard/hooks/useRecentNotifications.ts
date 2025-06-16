
import { useState, useEffect } from 'react';
import { nocodbService } from '@/services/nocodb';

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
      console.log('🔔 Buscando notificações recentes...');
      
      // Dados mock por enquanto - substituir pela integração real com NocoDB
      const mockNotifications: Notification[] = [
        {
          id: '1',
          eventType: 'purchase',
          platform: 'hotmart',
          clientName: 'João Silva',
          clientEmail: 'joao@email.com',
          value: 197.00,
          createdAt: new Date().toISOString(),
          productName: 'Curso de Marketing Digital'
        },
        {
          id: '2',
          eventType: 'subscription',
          platform: 'eduzz',
          clientName: 'Maria Santos',
          clientEmail: 'maria@email.com',
          value: 47.00,
          createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          productName: 'Assinatura Premium'
        },
        {
          id: '3',
          eventType: 'cancel',
          platform: 'hotmart',
          clientName: 'Pedro Costa',
          clientEmail: 'pedro@email.com',
          createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          productName: 'Curso de Programação'
        }
      ];

      // TODO: Implementar busca real dos dados do NocoDB
      // const baseId = nocodbService.getTargetBaseId();
      // if (baseId) {
      //   const tableId = await nocodbService.getTableId(baseId, 'NotificacoesHotmart');
      //   if (tableId) {
      //     const response = await fetch(
      //       `${nocodbService.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}?limit=${limit}&sort=-created_at`,
      //       {
      //         headers: nocodbService.headers,
      //       }
      //     );
      //     
      //     if (response.ok) {
      //       const data = await response.json();
      //       setNotifications(data.list || []);
      //     }
      //   }
      // }

      setNotifications(mockNotifications.slice(0, limit));
      setError(null);
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
    
    // Atualizar dados a cada 30 segundos
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, [limit]);

  return {
    notifications,
    isLoading,
    error,
    refetch: fetchNotifications
  };
};
