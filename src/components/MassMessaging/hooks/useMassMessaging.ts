
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { evolutionApiService } from '@/services/evolutionApi';
import { Message, CampaignData } from '../types';
import { VariableProcessor } from '../utils/variableProcessor';
import { useClientId } from './useClientId';
import { useCampaignValidation } from './useCampaignValidation';
import { useMessageProcessor } from './useMessageProcessor';
import { useCampaignSave } from './useCampaignSave';
import { useSavedContacts } from './useSavedContacts';

export const useMassMessaging = () => {
  const { toast } = useToast();
  const { getClientId } = useClientId();
  const { validateMessages } = useCampaignValidation();
  const { processMessagesWithVariables } = useMessageProcessor();
  const { saveCampaignToNocoDB } = useCampaignSave();
  const { checkForSavedContacts } = useSavedContacts();

  const [instances, setInstances] = useState<any[]>([]);
  const [selectedInstance, setSelectedInstance] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', type: 'text', content: '' }
  ]);
  const [recipients, setRecipients] = useState('');
  const [delay, setDelay] = useState([5]);
  const [notificationPhone, setNotificationPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadInstances();
    checkForSavedContacts(setRecipients, setSelectedInstance);
  }, []);

  const loadInstances = async () => {
    try {
      const instancesData = await evolutionApiService.getInstances();
      setInstances(instancesData);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao carregar instâncias do WhatsApp",
        variant: "destructive",
      });
    }
  };

  const handleSendCampaign = async () => {
    if (!selectedInstance || messages.length === 0 || !recipients.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    // Validar variáveis nas mensagens
    if (!validateMessages(messages)) {
      return;
    }

    const clientId = getClientId();
    console.log('🏢 Iniciando campanha para cliente:', clientId);

    setIsLoading(true);
    try {
      const recipientList = recipients.split('\n').filter(r => r.trim());
      
      // Processar mensagens com variáveis para cada contato
      const processedCampaigns = processMessagesWithVariables(messages, recipientList);
      
      // Preparar dados da campanha
      const campaignData: CampaignData = {
        instance: selectedInstance,
        messages: messages.map(msg => ({
          ...msg,
          fileUrl: msg.fileUrl || '',
          caption: msg.caption || ''
        })),
        recipients: recipientList,
        delay: delay[0],
        notificationPhone
      };

      // Salvar no NocoDB ANTES de enviar para o webhook
      console.log('💾 Salvando campanha no NocoDB...');
      const savedToNocoDB = await saveCampaignToNocoDB(campaignData, processedCampaigns, instances);

      // Adicionar dados processados para o webhook
      const enhancedCampaignData = {
        ...campaignData,
        processedCampaigns: processedCampaigns,
        variablesUsed: messages.some(msg => 
          (msg.type === 'text' && VariableProcessor.getAvailableVariables().some(v => msg.content.includes(v))) ||
          (msg.caption && VariableProcessor.getAvailableVariables().some(v => msg.caption.includes(v)))
        ),
        savedToNocoDB,
        client_id: clientId
      };

      console.log('📡 Enviando dados para webhook n8n:', enhancedCampaignData);

      // Enviar para webhook n8n
      const response = await fetch('https://webhook.novahagencia.com.br/webhook/bb39433b-a53b-484c-8721-f9a66d54f821', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(enhancedCampaignData),
      });

      if (!response.ok) {
        throw new Error(`Falha ao enviar para webhook: ${response.status}`);
      }

      console.log('✅ Webhook enviado com sucesso');

      toast({
        title: "Campanha Iniciada",
        description: `Campanha iniciada com ${processedCampaigns.length} mensagens${savedToNocoDB ? ' e registrada no banco' : ''} para cliente ${clientId}`,
      });

      // Reset form
      setMessages([{ id: '1', type: 'text', content: '' }]);
      setRecipients('');
      setNotificationPhone('');
    } catch (error) {
      console.error('❌ Erro ao iniciar campanha:', error);
      toast({
        title: "Erro",
        description: "Falha ao iniciar campanha. Verifique os logs do console.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
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
  };
};
