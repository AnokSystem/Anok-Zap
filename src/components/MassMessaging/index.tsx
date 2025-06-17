
import React from 'react';
import { MessageSquare, Send, Users, Clock } from 'lucide-react';
import { useMassMessaging } from './hooks/useMassMessaging';
import { InstanceSelector } from './components/InstanceSelector';
import { MessageEditor } from './components/MessageEditor';
import { RecipientManager } from './components/RecipientManager';
import { CampaignSettings } from './components/CampaignSettings';

const MassMessaging = () => {
  const {
    instances,
    selectedInstances,
    setSelectedInstances,
    messages,
    setMessages,
    recipients,
    setRecipients,
    delay,
    setDelay,
    notificationPhone,
    setNotificationPhone,
    isLoading,
    setIsLoading,
    handleSendCampaign,
  } = useMassMessaging();

  return (
    <div className="space-y-8">
      {/* Header da Seção */}
      <div className="text-center pb-6 border-b border-white/10">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-purple">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-primary-contrast">Disparo em Massa</h3>
        </div>
        <p className="text-gray-400 text-lg">
          Envie mensagens para múltiplos contatos com randomização entre instâncias
        </p>
      </div>

      {/* Seleção de Instâncias */}
      <div className="card-glass p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-purple-accent/20 rounded-lg flex items-center justify-center">
            <Send className="w-5 h-5 text-purple-accent" />
          </div>
          <div>
            <h4 className="font-semibold text-primary-contrast text-lg">Configuração das Instâncias</h4>
            <p className="text-sm text-gray-400 mt-1">
              Selecione uma ou múltiplas instâncias para randomizar os envios
            </p>
          </div>
        </div>
        
        <InstanceSelector
          instances={instances}
          selectedInstances={selectedInstances}
          onInstancesChange={setSelectedInstances}
        />
      </div>

      {/* Editor de Mensagens */}
      <div className="card-glass p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-purple-accent/20 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-purple-accent" />
          </div>
          <div>
            <h4 className="font-semibold text-primary-contrast text-lg">Mensagens</h4>
            <p className="text-sm text-gray-400 mt-1">
              Configure as mensagens que serão enviadas
            </p>
          </div>
        </div>
        
        <MessageEditor
          messages={messages}
          onMessagesChange={setMessages}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      </div>

      {/* Gerenciamento de Destinatários */}
      <div className="card-glass p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-purple-accent/20 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-accent" />
          </div>
          <div>
            <h4 className="font-semibold text-primary-contrast text-lg">Destinatários</h4>
            <p className="text-sm text-gray-400 mt-1">
              Adicione os contatos que receberão as mensagens
            </p>
          </div>
        </div>
        
        <RecipientManager
          recipients={recipients}
          onRecipientsChange={setRecipients}
        />
      </div>

      {/* Configurações da Campanha */}
      <div className="card-glass p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-purple-accent/20 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-purple-accent" />
          </div>
          <div>
            <h4 className="font-semibold text-primary-contrast text-lg">Configurações de Envio</h4>
            <p className="text-sm text-gray-400 mt-1">
              Configure o intervalo entre envios e notificações
            </p>
          </div>
        </div>
        
        <CampaignSettings
          delay={delay}
          onDelayChange={setDelay}
          notificationPhone={notificationPhone}
          onNotificationPhoneChange={setNotificationPhone}
          onSendCampaign={handleSendCampaign}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default MassMessaging;
