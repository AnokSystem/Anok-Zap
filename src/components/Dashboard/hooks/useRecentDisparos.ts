
import { useState, useEffect } from 'react';
import { nocodbService } from '@/services/nocodb';

interface Disparo {
  id: string;
  campaignName: string;
  instanceName: string;
  recipientCount: number;
  status: 'enviado' | 'pendente' | 'erro';
  createdAt: string;
  messageType: string;
}

export const useRecentDisparos = (limit: number = 10) => {
  const [disparos, setDisparos] = useState<Disparo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDisparos = async () => {
    try {
      setIsLoading(true);
      console.log('📨 Buscando disparos recentes...');
      
      // Dados mock por enquanto - substituir pela integração real com NocoDB
      const mockDisparos: Disparo[] = [
        {
          id: '1',
          campaignName: 'Campanha Promocional',
          instanceName: 'WhatsApp Principal',
          recipientCount: 150,
          status: 'enviado',
          createdAt: new Date().toISOString(),
          messageType: 'text'
        },
        {
          id: '2',
          campaignName: 'Newsletter Semanal',
          instanceName: 'WhatsApp Secundário',
          recipientCount: 89,
          status: 'pendente',
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          messageType: 'image'
        },
        {
          id: '3',
          campaignName: 'Lembrete de Evento',
          instanceName: 'WhatsApp Principal',
          recipientCount: 45,
          status: 'enviado',
          createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          messageType: 'text'
        }
      ];

      // TODO: Implementar busca real dos dados do NocoDB
      // const baseId = nocodbService.getTargetBaseId();
      // if (baseId) {
      //   const tableId = await nocodbService.getTableId(baseId, 'MassMessagingLogs');
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
      //       setDisparos(data.list || []);
      //     }
      //   }
      // }

      setDisparos(mockDisparos.slice(0, limit));
      setError(null);
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
    
    // Atualizar dados a cada 30 segundos
    const interval = setInterval(fetchDisparos, 30000);
    
    return () => clearInterval(interval);
  }, [limit]);

  return {
    disparos,
    isLoading,
    error,
    refetch: fetchDisparos
  };
};
