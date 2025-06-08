
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { evolutionApiService } from '@/services/evolutionApi';
import { nocodbService } from '@/services/nocodb';
import { Message, CampaignData } from '../types';

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

  const handleSendCampaign = async () => {
    if (!selectedInstance || messages.length === 0 || !recipients.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const campaignData: CampaignData = {
        instance: selectedInstance,
        messages: messages,
        recipients: recipients.split('\n').filter(r => r.trim()),
        delay: delay[0],
        notificationPhone
      };

      // Enviar para webhook n8n
      const response = await fetch('https://webhook.novahagencia.com.br/webhook/bb39433b-a53b-484c-8721-f9a66d54f821', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaignData),
      });

      if (!response.ok) {
        throw new Error('Falha ao enviar para webhook');
      }

      // Salvar no NocoDB
      await nocodbService.saveMassMessagingLog(campaignData);

      toast({
        title: "Campanha Iniciada",
        description: "Campanha de disparo em massa foi iniciada",
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
