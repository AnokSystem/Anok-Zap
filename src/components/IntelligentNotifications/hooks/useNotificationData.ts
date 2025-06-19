
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { evolutionApiService } from '@/services/evolutionApi';
import { nocodbService } from '@/services/nocodb';
import { userContextService } from '@/services/userContextService';
import { NotificationRule } from '../types';

export const useNotificationData = () => {
  const { toast } = useToast();
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [instances, setInstances] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadInstances();
    loadRules();
    
    // Verificar se há uma notificação para editar no sessionStorage
    const editNotificationData = sessionStorage.getItem('editNotification');
    if (editNotificationData) {
      try {
        const notification = JSON.parse(editNotificationData);
        console.log('📝 Dados de edição encontrados no sessionStorage:', notification);
        
        // Disparar evento customizado para que o useNotificationForm possa pegar os dados
        window.dispatchEvent(new CustomEvent('loadEditNotification', { 
          detail: notification 
        }));
        
        // Limpar o sessionStorage
        sessionStorage.removeItem('editNotification');
      } catch (error) {
        console.error('❌ Erro ao processar dados de edição:', error);
      }
    }
  }, []);

  const loadInstances = async () => {
    try {
      console.log('🔄 Carregando instâncias...');
      const data = await evolutionApiService.getInstances();
      console.log('✅ Instâncias carregadas:', data);
      setInstances(data);
    } catch (error) {
      console.error('Erro ao carregar instâncias:', error);
      // Fallback para desenvolvimento
      setInstances([
        { id: 'inst1', name: 'Instância Principal', status: 'conectado' },
        { id: 'inst2', name: 'Instância Secundária', status: 'conectado' }
      ]);
    }
  };

  const loadRules = async () => {
    try {
      // Verificar se o usuário está autenticado antes de buscar dados
      if (!userContextService.isAuthenticated()) {
        console.log('❌ Usuário não autenticado - negando acesso às notificações inteligentes');
        setRules([]);
        return;
      }

      const userId = userContextService.getUserId();
      const clientId = userContextService.getClientId();
      console.log('🔔 Buscando notificações inteligentes para usuário autenticado:', { userId, clientId });
      console.log('🔍 BUSCA - userId:', userId, 'clientId:', clientId);
      
      const data = await nocodbService.getHotmartNotifications();
      console.log('📋 BUSCA - Dados retornados do NocoDB:', data);
      console.log('📊 BUSCA - Total de notificações encontradas:', data?.length || 0);
      
      if (data && data.length > 0) {
        // Log dos primeiros registros para debug
        console.log('🔍 BUSCA - Primeiro registro para análise:', data[0]);
        console.log('🔍 BUSCA - Campos disponíveis:', Object.keys(data[0] || {}));
        
        // Aplicar filtragem usando os mesmos campos que são salvos
        const userFilteredData = data.filter(item => {
          // CORREÇÃO: Usar os mesmos campos que são salvos no notificationSaveService
          const recordUserId = item['userId'] || item['user_id'] || item['ID do Usuário'] || item['UserId'];
          const recordClientId = item['client_id'] || item['ClientId'];
          
          console.log('🔍 FILTRO - Analisando notificação:', {
            itemId: item.id || item.ID,
            recordUserId,
            recordClientId,
            currentUserId: userId,
            currentClientId: clientId
          });
          
          // Verificar se a notificação pertence ao usuário atual
          const belongsToUser = recordUserId === userId || recordClientId === clientId || recordUserId === clientId;
          
          console.log('📋 FILTRO - Resultado:', {
            belongsToUser,
            reason: belongsToUser ? 'INCLUÍDA' : 'EXCLUÍDA'
          });
          
          return belongsToUser;
        });

        console.log(`✅ ${userFilteredData.length} notificações inteligentes filtradas para usuário ${userId}/${clientId}`);
        
        // Log das notificações filtradas
        userFilteredData.forEach((item, index) => {
          console.log(`📌 Notificação ${index + 1}:`, {
            id: item.id || item.ID,
            eventType: item.eventType || item['eventType'] || item['Tipo de Evento'],
            userId: item.userId || item['userId'] || item['ID do Usuário'],
            clientId: item.client_id || item['ClientId']
          });
        });
        
        setRules(userFilteredData);
      } else {
        console.log('⚠️ Nenhuma notificação encontrada no NocoDB');
        setRules([]);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar regras:', error);
      setRules([]);
    }
  };

  const deleteRule = async (ruleId: string) => {
    setIsLoading(true);
    try {
      console.log('🗑️ Deletando regra:', ruleId);
      
      // Verificar se o usuário tem permissão para deletar esta regra
      const userId = userContextService.getUserId();
      const clientId = userContextService.getClientId();
      const rule = rules.find(r => r.id === ruleId);
      
      if (!rule) {
        throw new Error('Regra não encontrada');
      }
      
      // CORREÇÃO: Usar os mesmos campos para verificação
      const recordUserId = rule['userId'] || rule['user_id'] || rule['ID do Usuário'] || rule['UserId'];
      const recordClientId = rule['client_id'] || rule['ClientId'];
      
      if (recordUserId !== userId && recordClientId !== clientId && recordUserId !== clientId) {
        throw new Error('Você não tem permissão para deletar esta regra');
      }
      
      // Aqui você pode implementar a lógica de deleção real
      // await nocodbService.deleteNotification(baseId, ruleId);
      
      await loadRules();
      toast({
        title: "Sucesso",
        description: "Regra removida com sucesso",
      });
    } catch (error) {
      console.error('❌ Erro ao deletar regra:', error);
      toast({
        title: "Erro",
        description: error.message || "Falha ao remover regra",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    rules,
    instances,
    isLoading,
    setIsLoading,
    loadRules,
    deleteRule
  };
};
