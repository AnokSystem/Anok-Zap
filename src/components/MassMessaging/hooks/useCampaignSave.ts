
import { useToast } from "@/hooks/use-toast";
import { nocodbService } from '@/services/nocodb';
import { CampaignData } from '../types';
import { useClientId } from './useClientId';

export const useCampaignSave = () => {
  const { toast } = useToast();
  const { getClientId } = useClientId();

  const saveCampaignToNocoDB = async (
    campaignData: CampaignData, 
    processedCampaigns: any[], 
    instances: any[]
  ) => {
    try {
      console.log('💾 Salvando campanha no NocoDB...');
      
      const clientId = getClientId();
      console.log('🏢 Client ID identificado:', clientId);
      
      // Preparar dados corretamente para o NocoDB
      const logData = {
        campaign_id: `campanha_${Date.now()}`,
        campaign_name: `Campanha ${new Date().toLocaleString('pt-BR')}`,
        instance_id: campaignData.instance,
        instance_name: instances.find(i => i.name === campaignData.instance)?.name || campaignData.instance,
        message_type: campaignData.messages[0]?.type || 'text',
        recipient_count: campaignData.recipients.length,
        sent_count: 0,
        error_count: 0,
        delay: campaignData.delay,
        status: 'iniciado',
        start_time: new Date().toISOString(),
        notification_phone: campaignData.notificationPhone,
        data_json: JSON.stringify({
          messages: campaignData.messages,
          recipients: campaignData.recipients,
          processedCampaigns: processedCampaigns
        }),
        client_id: clientId
      };
      
      console.log('📋 Dados formatados para NocoDB:', logData);
      
      // Usar o método correto do nocodbService
      const success = await nocodbService.saveMassMessagingLog(logData);
      
      if (success) {
        console.log('✅ Campanha salva no NocoDB com sucesso para cliente:', clientId);
        toast({
          title: "Sucesso",
          description: "Campanha registrada no banco de dados",
        });
        return true;
      } else {
        console.log('❌ Falha ao salvar campanha no NocoDB');
        toast({
          title: "Aviso",
          description: "Problema ao registrar no banco, mas disparo continuará",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao salvar campanha no NocoDB:', error);
      toast({
        title: "Aviso",
        description: "Problema ao registrar no banco, mas disparo continuará",
        variant: "destructive",
      });
      return false;
    }
  };

  return { saveCampaignToNocoDB };
};
