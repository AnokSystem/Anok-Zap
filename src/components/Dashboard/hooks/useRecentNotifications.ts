
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
      
      const data = await nocodbService.getRecentNotifications(limit);
      
      if (data && data.length > 0) {
        const transformedNotifications: Notification[] = data.map((item: any) => ({
          id: item.Id || item.id || String(Math.random()),
          eventType: item.event_type || 'unknown',
          platform: item.platform || 'hotmart',
          clientName: item['Nome do Comprador'] || item.user_email?.split('@')[0] || 'Cliente não identificado',
          clientEmail: item['Email do Comprador'] || item.user_email || 'email@naoidentificado.com',
          value: item['Valor'] || item.value || 0,
          createdAt: item.event_date || item['Data da Compra'] || item.CreatedAt || new Date().toISOString(),
          productName: item['Nome do Produto'] || item.product_name || 'Produto não identificado'
        }));
        
        setNotifications(transformedNotifications);
        setError(null);
        console.log(`✅ ${transformedNotifications.length} notificações carregadas`);
      } else {
        console.log('⚠️ Nenhuma notificação encontrada, usando dados mock');
        // Fallback para dados mock se não houver dados reais
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
          }
        ];
        setNotifications(mockNotifications.slice(0, limit));
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
