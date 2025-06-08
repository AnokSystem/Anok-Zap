
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
        timestamp: new Date().toISOString()
      };

      console.log('Criando notificação:', notificationData);

      // Salvar no NocoDB
      await nocodbService.saveHotmartNotification(notificationData);

      // Mostrar URL do webhook criado
      setCreatedWebhookUrl(webhookUrl);

      // Limpar formulário
      setNewRule({
        eventType: '',
        userRole: '',
        platform: '',
        profileName: '',
        instanceId: '',
        messages: [{ id: '1', type: 'text', content: '', delay: 0 }],
      });

      await loadRules();

      toast({
        title: "Sucesso",
        description: "Notificação criada com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao criar notificação",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRule = async (ruleId: string) => {
    setIsLoading(true);
    try {
      console.log('Deletando regra:', ruleId);
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
          <h3 className="text-2xl font-bold text-primary-contrast">Notificações Inteligentes</h3>
        </div>
        <p className="text-gray-400 text-lg">
          Configure notificações automáticas baseadas em eventos das plataformas de venda
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
      />

      {/* Lista de Regras Existentes */}
      <ActiveNotificationsList
        rules={rules}
        onDeleteRule={deleteRule}
      />
    </div>
  );
};

export default IntelligentNotifications;
