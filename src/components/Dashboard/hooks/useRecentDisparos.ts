
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
  sentCount?: number;
}

export const useRecentDisparos = (limit: number = 10) => {
  const [disparos, setDisparos] = useState<Disparo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDisparos = async () => {
    try {
      setIsLoading(true);
      console.log('📨 Buscando TODOS os disparos recentes do NocoDB...');
      
      // Usar o método específico que acessa a tabela correta
      const data = await nocodbService.getRecentDisparos(limit);
      
      if (data && data.length > 0) {
        console.log('📋 Dados brutos recebidos do NocoDB:', data);
        
        const transformedDisparos: Disparo[] = data.map((item: any) => {
          console.log('🔍 Processando item:', item);
          
          // Mapear todos os possíveis campos para campanha
          const campaignName = item.campaign_name || 
                             item.Campaign_name || 
                             item.CampaignName || 
                             item.nome_campanha ||
                             item.campanha ||
                             `Campanha ${item.Id || item.id || 'N/A'}`;
          
          // Mapear todos os possíveis campos para instância
          const instanceName = item.instance_name || 
                              item.Instance_name || 
                              item.InstanceName ||
                              item.instance_id || 
                              item.Instance_id ||
                              item.instanceId ||
                              item.instancia ||
                              'Instância não identificada';
          
          // Mapear todos os possíveis campos para contagem de destinatários
          const recipientCount = Number(item.recipient_count || 
                                       item.Recipient_count ||
                                       item.RecipientCount ||
                                       item.total_recipients ||
                                       item.destinatarios ||
                                       item.sent_count ||
                                       item.Sent_count ||
                                       0);
          
          // Mapear todos os possíveis campos para contagem enviados
          const sentCount = Number(item.sent_count || 
                                  item.Sent_count ||
                                  item.SentCount ||
                                  item.enviados ||
                                  item.recipient_count ||
                                  0);
          
          // Mapear status
          const status = mapStatus(item.status || item.Status || 'pendente');
          
          // Mapear data de criação
          const createdAt = item.start_time || 
                           item.Start_time ||
                           item.CreatedAt || 
                           item.created_at || 
                           item.Created_at ||
                           item.data_criacao ||
                           new Date().toISOString();
          
          return {
            id: String(item.Id || item.id || Math.random()),
            campaignName,
            instanceName,
            recipientCount,
            sentCount,
            status,
            createdAt,
            messageType: item.message_type || item.Message_type || item.tipo_mensagem || 'text'
          };
        });
        
        console.log('✅ Disparos transformados:', transformedDisparos);
        setDisparos(transformedDisparos);
        setError(null);
      } else {
        console.log('⚠️ Nenhum disparo encontrado na tabela específica');
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

  const mapStatus = (status: string): 'enviado' | 'pendente' | 'erro' | 'enviando' | 'concluido' | 'cancelado' => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'concluido':
      case 'finalizado':
      case 'completed':
      case 'complete':
        return 'concluido';
      case 'iniciado':
      case 'enviando':
      case 'sending':
      case 'em_andamento':
        return 'enviando';
      case 'erro':
      case 'falha':
      case 'error':
      case 'failed':
        return 'erro';
      case 'cancelado':
      case 'cancelled':
      case 'canceled':
        return 'cancelado';
      case 'enviado':
      case 'sent':
        return 'enviado';
      default:
        return 'pendente';
    }
  };

  useEffect(() => {
    fetchDisparos();
    
    // Atualizar dados a cada 15 segundos para sincronização mais rápida
    const interval = setInterval(fetchDisparos, 15000);
    
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
