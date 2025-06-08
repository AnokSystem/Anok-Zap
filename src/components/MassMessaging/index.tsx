
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from 'lucide-react';
import { useMassMessaging } from './hooks/useMassMessaging';
import { InstanceSelector } from './components/InstanceSelector';
import { MessageEditor } from './components/MessageEditor';
import { RecipientManager } from './components/RecipientManager';
import { CampaignSettings } from './components/CampaignSettings';

const MassMessaging = () => {
  const {
    instances,
    selectedInstance,
    setSelectedInstance,
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
    <div className="space-y-6">
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <MessageSquare className="w-5 h-5 text-purple-400" />
            <span>Campanha de Disparo em Massa</span>
          </CardTitle>
          <CardDescription className="text-gray-300">
            Envie mensagens em lote para múltiplos contatos do WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <InstanceSelector
            instances={instances}
            selectedInstance={selectedInstance}
            onInstanceChange={setSelectedInstance}
          />

          <MessageEditor
            messages={messages}
            onMessagesChange={setMessages}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />

          <RecipientManager
            recipients={recipients}
            onRecipientsChange={setRecipients}
          />

          <CampaignSettings
            delay={delay}
            onDelayChange={setDelay}
            notificationPhone={notificationPhone}
            onNotificationPhoneChange={setNotificationPhone}
            onSendCampaign={handleSendCampaign}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default MassMessaging;
