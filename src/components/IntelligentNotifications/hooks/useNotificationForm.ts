
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { minioService } from '@/services/minio';
import { nocodbService } from '@/services/nocodb';
import { Message, NotificationRule } from '../types';

const initialFormState: Partial<NotificationRule> = {
  eventType: '',
  userRole: '',
  platform: '',
  profileName: '',
  instanceId: '',
  messages: [{ id: '1', type: 'text', content: '', delay: 0 }],
};

export const useNotificationForm = (onRulesUpdate: () => void) => {
  const { toast } = useToast();
  const [newRule, setNewRule] = useState<Partial<NotificationRule>>(initialFormState);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [createdWebhookUrl, setCreatedWebhookUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEditRule = (rule: any) => {
    try {
      console.log('📝 Iniciando edição da regra:', rule);
      
      // Parse dos dados JSON para preencher o formulário
      let parsedData: any = {};
      
      if (rule['Dados Completos (JSON)']) {
        try {
          parsedData = JSON.parse(rule['Dados Completos (JSON)']);
          console.log('✅ Dados JSON parseados:', parsedData);
        } catch (e) {
          console.error('❌ Erro ao fazer parse do JSON:', e);
          parsedData = {};
        }
      }
      
      const editRule = {
        eventType: parsedData.eventType || rule['Tipo de Evento'] || '',
        userRole: parsedData.userRole || rule['Função do Usuário'] || rule['Papel do Usuário'] || '',
        platform: parsedData.platform || rule['Plataforma'] || '',
        profileName: parsedData.profileName || rule['Perfil Hotmart'] || '',
        instanceId: parsedData.instance || rule['ID da Instância'] || '',
        messages: parsedData.messages || [{ id: '1', type: 'text', content: '', delay: 0 }],
      };
      
      console.log('📋 Dados carregados para edição:', editRule);
      
      setNewRule(editRule);
      setEditingRule(rule);
      
      toast({
        title: "Modo de Edição Ativado",
        description: "Regra carregada para edição. Modifique os campos e clique em 'Atualizar Notificação'.",
      });
    } catch (error) {
      console.error('❌ Erro ao editar regra:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados da regra para edição",
        variant: "destructive",
      });
    }
  };

  const cancelEdit = () => {
    console.log('❌ Cancelando edição');
    setEditingRule(null);
    setNewRule(initialFormState);
    
    toast({
      title: "Edição Cancelada",
      description: "Formulário limpo e pronto para nova notificação",
    });
  };

  const addMessage = () => {
    if (!newRule.messages || newRule.messages.length >= 5) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'text',
      content: '',
      delay: 0
    };
    
    setNewRule(prev => ({
      ...prev,
      messages: [...(prev.messages || []), newMessage]
    }));
  };

  const removeMessage = (messageId: string) => {
    setNewRule(prev => ({
      ...prev,
      messages: prev.messages?.filter(msg => msg.id !== messageId) || []
    }));
  };

  const updateMessage = (messageId: string, updates: Partial<Message>) => {
    setNewRule(prev => ({
      ...prev,
      messages: prev.messages?.map(msg => 
        msg.id === messageId ? { ...msg, ...updates } : msg
      ) || []
    }));
  };

  const handleFileUpload = async (messageId: string, file: File) => {
    try {
      setIsLoading(true);
      const fileUrl = await minioService.uploadFile(file);
      updateMessage(messageId, { file, fileUrl });
      toast({
        title: "Sucesso",
        description: "Arquivo enviado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao enviar arquivo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getWebhookUrl = (eventType: string): string => {
    const webhookUrls = {
      'purchase-approved': 'https://webhook.novahagencia.com.br/webhook/4759af4e-61f0-47b8-b2c0-d730000ca2b5',
      'awaiting-payment': 'https://webhook.novahagencia.com.br/webhook/5f5fd8b0-0733-4cfc-b5e7-319462991065',
      'cart-abandoned': 'https://webhook.novahagencia.com.br/webhook/6631e496-f119-48a4-b198-7d1d5010bbf7'
    };
    return webhookUrls[eventType] || '';
  };

  const saveRule = async () => {
    if (!newRule.eventType || !newRule.instanceId || !newRule.userRole || !newRule.platform || !newRule.profileName || !newRule.messages?.length) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const webhookUrl = getWebhookUrl(newRule.eventType!);
      
      const notificationData = {
        eventType: newRule.eventType!,
        instance: newRule.instanceId!,
        userRole: newRule.userRole!,
        platform: newRule.platform!,
        profileName: newRule.profileName!,
        messages: newRule.messages,
        webhookUrl,
        timestamp: new Date().toISOString(),
        // Se estamos editando, incluir o ID da notificação
        ...(editingRule && { ruleId: editingRule.ID || editingRule.id })
      };

      console.log(editingRule ? '📝 Atualizando notificação:' : '➕ Criando notificação:', notificationData);

      // Salvar no NocoDB - o serviço já trata criação/atualização
      const success = await nocodbService.saveHotmartNotification(notificationData);
      
      if (!success) {
        throw new Error('Falha ao salvar no banco de dados');
      }

      // Mostrar URL do webhook criado apenas para novas notificações
      if (!editingRule) {
        setCreatedWebhookUrl(webhookUrl);
      }

      // Limpar formulário
      setNewRule(initialFormState);
      setEditingRule(null);
      
      // Recarregar as regras
      await onRulesUpdate();

      toast({
        title: "✅ Sucesso",
        description: editingRule ? 
          "Notificação atualizada com sucesso no banco de dados!" : 
          "Notificação criada com sucesso! Use a URL do webhook exibida acima.",
      });
      
      console.log(editingRule ? '✅ Notificação atualizada com sucesso' : '✅ Notificação criada com sucesso');
      
    } catch (error) {
      console.error('❌ Erro ao salvar notificação:', error);
      toast({
        title: "❌ Erro",
        description: editingRule ? 
          "Falha ao atualizar notificação no banco de dados" : 
          "Falha ao criar notificação no banco de dados",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    newRule,
    setNewRule,
    editingRule,
    createdWebhookUrl,
    setCreatedWebhookUrl,
    isLoading,
    handleEditRule,
    cancelEdit,
    addMessage,
    removeMessage,
    updateMessage,
    handleFileUpload,
    saveRule
  };
};
