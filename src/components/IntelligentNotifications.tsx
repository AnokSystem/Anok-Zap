import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Bell, Plus, Trash2, Upload, Settings, Zap, MessageSquare, Clock } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { nocodbService } from '@/services/nocodb';
import { minioService } from '@/services/minio';
import { evolutionApiService } from '@/services/evolutionApi';

interface Message {
  id: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'document';
  content: string;
  file?: File;
  fileUrl?: string;
  delay: number; // tempo em minutos
}

interface NotificationRule {
  id: string;
  eventType: string;
  userRole: string; // produtor ou afiliado
  platform: string; // Hotmart, Braip, Kiwfy, Monetize
  profileName: string;
  instanceId: string;
  messages: Message[];
  webhookUrl: string;
}

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

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'purchase-approved': return 'Compra Aprovada';
      case 'awaiting-payment': return 'Aguardando Pagamento';
      case 'cart-abandoned': return 'Carrinho Abandonado';
      default: return type;
    }
  };

  const getPlatformLabel = (platform: string) => {
    switch (platform) {
      case 'hotmart': return 'Hotmart';
      case 'braip': return 'Braip';
      case 'kiwfy': return 'Kiwfy';
      case 'monetize': return 'Monetize';
      default: return platform;
    }
  };

  const getRoleLabel = (role: string) => {
    return role === 'producer' ? 'Produtor' : 'Afiliado';
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
        <div className="card-glass p-6 border-green-500/30">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h4 className="font-semibold text-primary-contrast text-lg">Notificação Criada!</h4>
              <p className="text-sm text-gray-400 mt-1">
                Use esta URL no webhook da plataforma
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-200 font-medium text-sm">URL do Webhook</Label>
            <div className="p-3 bg-gray-700/30 rounded-lg border border-gray-600/50 flex items-center justify-between">
              <p className="text-sm text-gray-300 break-all">
                {createdWebhookUrl}
              </p>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(createdWebhookUrl);
                  toast({
                    title: "Copiado!",
                    description: "URL copiada para a área de transferência",
                  });
                }}
                size="sm"
                variant="outline"
                className="ml-2 bg-gray-700/50 border-gray-600 text-gray-200"
              >
                Copiar
              </Button>
            </div>
            <Button
              onClick={() => setCreatedWebhookUrl('')}
              size="sm"
              variant="ghost"
              className="text-gray-400 hover:text-gray-200"
            >
              Fechar
            </Button>
          </div>
        </div>
      )}

      {/* Configuração de Nova Regra */}
      <div className="card-glass p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-purple-accent/20 rounded-lg flex items-center justify-center">
            <Plus className="w-5 h-5 text-purple-accent" />
          </div>
          <div>
            <h4 className="font-semibold text-primary-contrast text-lg">Nova Notificação</h4>
            <p className="text-sm text-gray-400 mt-1">
              Configure uma nova regra de notificação automática
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Configurações básicas - Primeira linha */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-gray-200 font-medium text-sm">Instância WhatsApp *</Label>
              <Select
                value={newRule.instanceId}
                onValueChange={(value) => setNewRule(prev => ({ ...prev, instanceId: value }))}
              >
                <SelectTrigger className="bg-gray-700/50 border-gray-600 text-gray-200 focus:border-purple-accent">
                  <SelectValue placeholder="Selecione a instância" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {instances.map((instance) => (
                    <SelectItem key={instance.id} value={instance.id} className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700">
                      {instance.name} ({instance.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-200 font-medium text-sm">Tipo de Evento *</Label>
              <Select
                value={newRule.eventType}
                onValueChange={(value) => setNewRule(prev => ({ ...prev, eventType: value }))}
              >
                <SelectTrigger className="bg-gray-700/50 border-gray-600 text-gray-200 focus:border-purple-accent">
                  <SelectValue placeholder="Selecione o evento" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="purchase-approved" className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700">Compra Aprovada</SelectItem>
                  <SelectItem value="awaiting-payment" className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700">Aguardando Pagamento</SelectItem>
                  <SelectItem value="cart-abandoned" className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700">Carrinho Abandonado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-200 font-medium text-sm">Você é *</Label>
              <Select
                value={newRule.userRole}
                onValueChange={(value) => setNewRule(prev => ({ ...prev, userRole: value }))}
              >
                <SelectTrigger className="bg-gray-700/50 border-gray-600 text-gray-200 focus:border-purple-accent">
                  <SelectValue placeholder="Selecione seu papel" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="producer" className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700">Produtor</SelectItem>
                  <SelectItem value="affiliate" className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700">Afiliado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Segunda linha */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-gray-200 font-medium text-sm">Plataforma *</Label>
              <Select
                value={newRule.platform}
                onValueChange={(value) => setNewRule(prev => ({ ...prev, platform: value }))}
              >
                <SelectTrigger className="bg-gray-700/50 border-gray-600 text-gray-200 focus:border-purple-accent">
                  <SelectValue placeholder="Selecione a plataforma" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="hotmart" className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700">Hotmart</SelectItem>
                  <SelectItem value="braip" className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700">Braip</SelectItem>
                  <SelectItem value="kiwfy" className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700">Kiwfy</SelectItem>
                  <SelectItem value="monetize" className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700">Monetize</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-200 font-medium text-sm">Nome do Perfil *</Label>
              <Input
                value={newRule.profileName || ''}
                onChange={(e) => setNewRule(prev => ({ ...prev, profileName: e.target.value }))}
                placeholder="Nome cadastrado na plataforma"
                className="input-form"
              />
            </div>
          </div>

          {/* Mensagens */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-gray-200 font-medium text-sm">Mensagens (até 5)</Label>
              {(newRule.messages?.length || 0) < 5 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addMessage}
                  className="bg-gray-700/50 border-gray-600 text-gray-200 hover:bg-gray-600/50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Mensagem
                </Button>
              )}
            </div>

            {newRule.messages?.map((message, index) => (
              <div key={message.id} className="p-4 bg-gray-700/30 rounded-lg border border-gray-600/50">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-200 font-medium">Mensagem {index + 1}</Label>
                    {(newRule.messages?.length || 0) > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMessage(message.id)}
                        className="text-gray-400 hover:text-gray-200 hover:bg-gray-600/50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-gray-200 font-medium text-sm">Tipo</Label>
                      <Select
                        value={message.type}
                        onValueChange={(value: any) => updateMessage(message.id, { type: value })}
                      >
                        <SelectTrigger className="bg-gray-700/50 border-gray-600 text-gray-200 focus:border-purple-accent">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="text" className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700">Texto</SelectItem>
                          <SelectItem value="image" className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700">Imagem</SelectItem>
                          <SelectItem value="video" className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700">Vídeo</SelectItem>
                          <SelectItem value="audio" className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700">Áudio</SelectItem>
                          <SelectItem value="document" className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700">Documento</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-gray-200 font-medium text-sm flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Delay (minutos)
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        value={message.delay}
                        onChange={(e) => updateMessage(message.id, { delay: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                        className="input-form"
                      />
                    </div>

                    {message.type !== 'text' && (
                      <div>
                        <Label className="text-gray-200 font-medium text-sm">Arquivo</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="file"
                            accept={message.type === 'audio' ? '.mp3,.wav,.ogg' : 
                                   message.type === 'video' ? '.mp4,.avi,.mov' :
                                   message.type === 'image' ? '.jpg,.png,.gif,.jpeg' : 
                                   '.pdf,.doc,.docx,.txt'}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(message.id, file);
                            }}
                            className="input-form"
                          />
                          <Upload className="w-4 h-4 text-gray-200" />
                        </div>
                        {message.fileUrl && (
                          <p className="text-sm text-gray-200 mt-1">✓ Arquivo enviado</p>
                        )}
                      </div>
                    )}
                  </div>

                  {message.type === 'text' && (
                    <div>
                      <Label className="text-gray-200 font-medium text-sm">Conteúdo</Label>
                      <Textarea
                        value={message.content}
                        onChange={(e) => updateMessage(message.id, { content: e.target.value })}
                        placeholder="Digite sua mensagem..."
                        className="min-h-[100px] input-form"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Botão Salvar */}
          <div className="pt-4">
            <Button
              onClick={saveRule}
              disabled={isLoading}
              className="w-full btn-primary h-12"
            >
              <div className="flex items-center justify-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>{isLoading ? 'Criando...' : 'Criar Notificação'}</span>
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* Lista de Regras Existentes */}
      {rules.length > 0 && (
        <div className="card-glass p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-purple-accent/20 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-purple-accent" />
            </div>
            <div>
              <h4 className="font-semibold text-primary-contrast text-lg">Notificações Ativas</h4>
              <p className="text-sm text-gray-400 mt-1">
                {rules.length} regras configuradas
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {rules.map((rule) => (
              <div key={rule.id} className="p-4 bg-gray-700/30 rounded-lg border border-gray-600/50 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Badge className="bg-purple-accent/20 text-purple-accent border-purple-accent/30">
                    {getEventTypeLabel(rule.eventType)}
                  </Badge>
                  <span className="text-gray-200">{getPlatformLabel(rule.platform || '')}</span>
                  <span className="text-sm text-gray-400">
                    {rule.profileName || 'Perfil não definido'}
                  </span>
                  <span className="text-sm text-gray-400">
                    {getRoleLabel(rule.userRole || '')}
                  </span>
                  <span className="text-sm text-gray-400">Instância: {rule.instanceId}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteRule(rule.id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default IntelligentNotifications;
