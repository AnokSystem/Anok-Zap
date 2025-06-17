
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
  const [selectedInstances, setSelectedInstances] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', type: 'text', content: '' }
  ]);
  const [recipients, setRecipients] = useState('');
  const [delay, setDelay] = useState([5]);
  const [notificationPhone, setNotificationPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadInstances();
    checkForSavedContacts(setRecipients, (instanceId) => {
      // Manter compatibilidade com a função antiga que esperava um instanceId único
      if (instanceId) {
        setSelectedInstances([instanceId]);
      }
    });
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

  // Função para randomizar a atribuição de instâncias aos destinatários
  const randomizeInstanceAssignment = (recipientList: string[], selectedInstanceIds: string[]) => {
    const assignments: { [key: string]: string } = {};
    
    recipientList.forEach((recipient, index) => {
      // Usar índice baseado no recipient para garantir consistência na randomização
      const randomIndex = Math.abs(recipient.hashCode ? recipient.hashCode() : index) % selectedInstanceIds.length;
      assignments[recipient] = selectedInstanceIds[randomIndex];
    });
    
    return assignments;
  };

  const handleSendCampaign = async () => {
    if (selectedInstances.length === 0 || messages.length === 0 || !recipients.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, selecione pelo menos uma instância e preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    // Validar se todas as instâncias selecionadas estão conectadas
    const connectedInstances = instances.filter(instance => 
      selectedInstances.includes(instance.id) && instance.status === 'conectado'
    );

    if (connectedInstances.length === 0) {
      toast({
        title: "Erro",
        description: "Nenhuma das instâncias selecionadas está conectada",
        variant: "destructive",
      });
      return;
    }

    if (connectedInstances.length < selectedInstances.length) {
      toast({
        title: "Aviso",
        description: `Apenas ${connectedInstances.length} de ${selectedInstances.length} instâncias estão conectadas e serão utilizadas`,
      });
    }

    // Validar variáveis nas mensagens
    if (!validateMessages(messages)) {
      return;
    }

    const clientId = getClientId();
    console.log('🏢 Iniciando campanha para cliente:', clientId);
    console.log('📱 Instâncias selecionadas:', connectedInstances.map(i => i.name));

    setIsLoading(true);
    try {
      const recipientList = recipients.split('\n').filter(r => r.trim());
      
      // Randomizar atribuição de instâncias
      const instanceAssignments = randomizeInstanceAssignment(recipientList, connectedInstances.map(i => i.id));
      console.log('🎲 Atribuições randomizadas:', instanceAssignments);
      
      // Processar mensagens com variáveis para cada contato
      const processedCampaigns = processMessagesWithVariables(messages, recipientList);
      
      // Gerar ID único para a campanha
      const campaignId = `campanha_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Preparar dados da campanha com informações de múltiplas instâncias
      const campaignData: CampaignData = {
        campaign_id: campaignId,
        instance: connectedInstances[0].id, // Instância principal para compatibilidade
        instances: connectedInstances.map(i => i.id), // Lista de todas as instâncias
        instance_assignments: instanceAssignments, // Mapeamento recipient -> instância
        messages: messages.map(msg => ({
          ...msg,
          fileUrl: msg.fileUrl || '',
          caption: msg.caption || ''
        })),
        recipients: recipientList,
        delay: delay[0],
        notificationPhone,
        status: 'enviando'
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
        client_id: clientId,
        // Expor serviços de atualização para o webhook
        updateContactsReached: `${window.location.origin}/api/update-contacts-reached/${campaignId}`,
        finalizeCampaign: `${window.location.origin}/api/finalize-campaign/${campaignId}`,
        // Informações sobre randomização
        randomization_enabled: connectedInstances.length > 1,
        total_instances: connectedInstances.length
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

      const instancesText = connectedInstances.length > 1 
        ? `${connectedInstances.length} instâncias (randomizado)`
        : connectedInstances[0].name;

      toast({
        title: "Campanha Iniciada",
        description: `Campanha ${campaignId} iniciada com 0/${recipientList.length} contatos. Usando: ${instancesText}`,
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
  };
};

// Extensão do String prototype para criar um hash simples
declare global {
  interface String {
    hashCode(): number;
  }
}

String.prototype.hashCode = function() {
  let hash = 0;
  if (this.length === 0) return hash;
  for (let i = 0; i < this.length; i++) {
    const char = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};
