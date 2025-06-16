
import { useState, useEffect } from 'react';
import { nocodbService } from '@/services/nocodb';

interface Disparo {
  id: string;
  campaignName: string;
  instanceName: string;
  recipientCount: number;
  status: 'enviado' | 'pendente' | 'erro' | 'enviando' | 'concluido' | 'cancelado';
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
      
      const data = await nocodbService.getRecentDisparos(limit);
      
      if (data && data.length > 0) {
        const transformedDisparos: Disparo[] = data.map((item: any) => ({
          id: item.Id || item.id || String(Math.random()),
          campaignName: item.campaign_name || 'Campanha sem nome',
          instanceName: item.instance_name || 'Instância não identificada',
          recipientCount: item.recipient_count || 0,
          status: mapStatus(item.status),
          createdAt: item.start_time || item.CreatedAt || new Date().toISOString(),
          messageType: item.message_type || 'text'
        }));
        
        setDisparos(transformedDisparos);
        setError(null);
        console.log(`✅ ${transformedDisparos.length} disparos carregados`);
      } else {
        console.log('⚠️ Nenhum disparo encontrado, usando dados mock');
        // Fallback para dados mock se não houver dados reais
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
          }
        ];
        setDisparos(mockDisparos.slice(0, limit));
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

  const mapStatus = (status: string): 'enviado' | 'pendente' | 'erro' | 'enviando' | 'concluido' | 'cancelado' => {
    switch (status) {
      case 'concluido':
      case 'finalizado':
        return 'enviado';
      case 'iniciado':
      case 'enviando':
        return 'pendente';
      case 'erro':
      case 'falha':
        return 'erro';
      case 'cancelado':
        return 'erro';
      default:
        return 'pendente';
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
