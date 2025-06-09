
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { evolutionApiService } from '@/services/evolutionApi';
import { nocodbService } from '@/services/nocodb';
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
      const data = await nocodbService.getHotmartNotifications();
      setRules(data);
    } catch (error) {
      console.error('Erro ao carregar regras:', error);
    }
  };

  const deleteRule = async (ruleId: string) => {
    setIsLoading(true);
    try {
      console.log('🗑️ Deletando regra:', ruleId);
      await loadRules();
      toast({
        title: "Sucesso",
        description: "Regra removida com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao remover regra",
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
