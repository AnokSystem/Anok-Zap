
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { evolutionApiService } from '@/services/evolutionApi';
import { nocodbService } from '@/services/nocodb';
import { Message, CampaignData } from '../types';
import { VariableProcessor } from '../utils/variableProcessor';

export const useMassMessaging = () => {
  const { toast } = useToast();
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
    checkForSavedContacts();
  }, []);

  const checkForSavedContacts = () => {
    console.log('Verificando contatos salvos no localStorage...');
    
    const savedContacts = localStorage.getItem('massMessagingContacts');
    const savedInstance = localStorage.getItem('massMessagingInstance');
    
    console.log('Contatos salvos encontrados:', !!savedContacts);
    console.log('Instância salva encontrada:', !!savedInstance);
    
    if (savedContacts) {
      console.log('Importando contatos:', savedContacts);
      setRecipients(savedContacts);
      
      localStorage.removeItem('massMessagingContacts');
      
      if (savedInstance) {
        console.log('Definindo instância:', savedInstance);
        setSelectedInstance(savedInstance);
        localStorage.removeItem('massMessagingInstance');
      }
      
      toast({
        title: "Contatos Importados",
        description: "Contatos foram importados da página de gerenciamento de contatos",
      });
    } else {
      console.log('Nenhum contato salvo encontrado');
    }
  };

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

  const processMessagesWithVariables = (messages: Message[], recipients: string[]) => {
    return recipients.map(recipient => {
      // Extrair nome e telefone do formato "telefone - nome" ou apenas "telefone"
      const [phoneNumber, ...nameParts] = recipient.split(' - ');
      const contactName = nameParts.length > 0 ? nameParts.join(' - ') : phoneNumber;
      
      const contactData = {
        name: contactName,
        phoneNumber: phoneNumber.trim()
      };
      
      // Processar cada mensagem com as variáveis do contato
      const processedMessages = messages.map(message => ({
        ...message,
        content: message.type === 'text' 
          ? VariableProcessor.processMessage(message.content, contactData)
          : message.content,
        // Preservar fileUrl para todos os tipos de mensagem
        fileUrl: message.fileUrl || '',
        file: message.file
      }));
      
      return {
        contact: contactData,
        messages: processedMessages
      };
    });
  };

  const validateMessages = (messages: Message[]): boolean => {
    for (const message of messages) {
      if (message.type === 'text') {
        const validation = VariableProcessor.validateMessage(message.content);
        if (!validation.isValid) {
          toast({
            title: "Erro de Validação",
            description: `Mensagem ${messages.indexOf(message) + 1}: ${validation.errors.join(', ')}`,
            variant: "destructive",
          });
          return false;
        }
      }
    }
    return true;
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

    setIsLoading(true);
    try {
      const recipientList = recipients.split('\n').filter(r => r.trim());
      
      // Processar mensagens com variáveis para cada contato
      const processedCampaigns = processMessagesWithVariables(messages, recipientList);
      
      // Preparar dados da campanha para o webhook com fileUrl preservado
      const campaignData: CampaignData = {
        instance: selectedInstance,
        messages: messages.map(msg => ({
          ...msg,
          // Garantir que fileUrl seja enviado
          fileUrl: msg.fileUrl || ''
        })),
        recipients: recipientList,
        delay: delay[0],
        notificationPhone
      };

      // Adicionar dados processados para o webhook
      const enhancedCampaignData = {
        ...campaignData,
        processedCampaigns: processedCampaigns,
        variablesUsed: messages.some(msg => 
          msg.type === 'text' && VariableProcessor.getAvailableVariables().some(v => msg.content.includes(v))
        )
      };

      console.log('Dados enviados para webhook:', enhancedCampaignData);

      // Enviar para webhook n8n
      const response = await fetch('https://webhook.novahagencia.com.br/webhook/bb39433b-a53b-484c-8721-f9a66d54f821', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(enhancedCampaignData),
      });

      if (!response.ok) {
        throw new Error('Falha ao enviar para webhook');
      }

      // Salvar no NocoDB
      await nocodbService.saveMassMessagingLog({
        ...campaignData,
        processedMessages: processedCampaigns.length
      });

      toast({
        title: "Campanha Iniciada",
        description: `Campanha iniciada com ${processedCampaigns.length} mensagens personalizadas`,
      });

      // Reset form
      setMessages([{ id: '1', type: 'text', content: '' }]);
      setRecipients('');
      setNotificationPhone('');
    } catch (error) {
      console.error('Erro ao iniciar campanha:', error);
      toast({
        title: "Erro",
        description: "Falha ao iniciar campanha",
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
