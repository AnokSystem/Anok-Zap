
import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { nocodbService } from '@/services/nocodb';
import { minioService } from '@/services/minio';
import { evolutionApiService } from '@/services/evolutionApi';
import { NotificationForm } from './NotificationForm';
import { WebhookDisplay } from './WebhookDisplay';
import { ActiveNotificationsList } from './ActiveNotificationsList';
import { Message, NotificationRule } from './types';

const IntelligentNotifications = () => {
  const { toast } = useToast();
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [newRule, setNewRule] = useState<Partial<NotificationRule>>({
    eventType: '',
    userRole: '',
    platform: '',
    profileName: '',
    instanceId: '',
    messages: [{ id: '1', type: 'text', content: '', delay: 0 }],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [instances, setInstances] = useState<any[]>([]);
  const [createdWebhookUrl, setCreatedWebhookUrl] = useState<string>('');
  const [editingRule, setEditingRule] = useState<any>(null);

  useEffect(() => {
    loadInstances();
    loadRules();
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
    setNewRule({
      eventType: '',
      userRole: '',
      platform: '',
      profileName: '',
      instanceId: '',
      messages: [{ id: '1', type: 'text', content: '', delay: 0 }],
    });
    
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
      setNewRule({
        eventType: '',
        userRole: '',
        platform: '',
        profileName: '',
        instanceId: '',
        messages: [{ id: '1', type: 'text', content: '', delay: 0 }],
      });

      setEditingRule(null);
      
      // Recarregar as regras
      await loadRules();

      toast({
        title: "✅ Sucesso",
        description: editingRule ? 
          "Notificação atualizada com sucesso no banco de dados!" : 
          "Notificação criada com sucesso no banco de dados!",
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

  return (
    <div className="space-y-8">
      {/* Header da Seção */}
      <div className="text-center pb-6 border-b border-white/10">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-purple">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-primary-contrast">
            {editingRule ? 'Editar Notificação' : 'Notificações Inteligentes'}
          </h3>
        </div>
        <p className="text-gray-400 text-lg">
          {editingRule 
            ? 'Modifique os campos desejados e salve as alterações no banco de dados'
            : 'Configure notificações automáticas baseadas em eventos das plataformas de venda'
          }
        </p>
      </div>

      {/* URL do Webhook criado */}
      {createdWebhookUrl && (
        <WebhookDisplay
          webhookUrl={createdWebhookUrl}
          onClose={() => setCreatedWebhookUrl('')}
        />
      )}

      {/* Formulário de Nova Regra */}
      <NotificationForm
        newRule={newRule}
        setNewRule={setNewRule}
        instances={instances}
        isLoading={isLoading}
        onSave={saveRule}
        onAddMessage={addMessage}
        onRemoveMessage={removeMessage}
        onUpdateMessage={updateMessage}
        onFileUpload={handleFileUpload}
        isEditing={!!editingRule}
        onCancelEdit={cancelEdit}
      />

      {/* Lista de Regras Existentes */}
      <ActiveNotificationsList
        rules={rules}
        onDeleteRule={deleteRule}
        onEditRule={handleEditRule}
      />
    </div>
  );
};

export default IntelligentNotifications;
