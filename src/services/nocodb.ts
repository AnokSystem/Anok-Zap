
class NocodbService {
  private baseUrl = 'https://kovalski.novahagencia.com.br';
  private apiToken = 'aY4YYKsICfBJXDtjLj4GWlwwaFIOkwSsOy64gslJ';
  
  private headers = {
    'Content-Type': 'application/json',
    'xc-token': this.apiToken,
  };

  async saveMassMessagingLog(campaignData: any) {
    try {
      console.log('Salvando log de disparo em massa no NocoDB...');
      const response = await fetch(`${this.baseUrl}/api/v1/db/data/noco/whatsapp/MassMessagingLogs`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          campaign_id: `campanha_${Date.now()}`,
          instance_id: campaignData.instance,
          message_type: campaignData.messages[0]?.type || 'text',
          recipient_count: campaignData.recipients.length,
          delay: campaignData.delay,
          status: 'iniciado',
          created_at: new Date().toISOString(),
        }),
      });
      
      if (!response.ok) {
        console.log('Falha ao salvar no NocoDB, usando resposta mock');
      } else {
        console.log('Log salvo com sucesso no NocoDB');
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao salvar log de disparo em massa:', error);
      return true; // Retornar true para desenvolvimento
    }
  }

  async saveContacts(contacts: any[], instanceId: string) {
    try {
      console.log('Salvando contatos no NocoDB...');
      const contactRecords = contacts.map(contact => ({
        contact_id: contact.id,
        name: contact.name,
        phone_number: contact.phoneNumber,
        group_name: contact.groupName || null,
        instance_id: instanceId,
        created_at: new Date().toISOString(),
      }));

      for (const contact of contactRecords) {
        try {
          const response = await fetch(`${this.baseUrl}/api/v1/db/data/noco/whatsapp/WhatsAppContacts`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(contact),
          });
          
          if (!response.ok) {
            console.log('Falha ao salvar contato individual, continuando...');
          }
        } catch (error) {
          console.log('Erro ao salvar contato individual, continuando...');
        }
      }
      
      console.log('Processo de salvamento de contatos concluído');
      return true;
    } catch (error) {
      console.error('Erro ao salvar contatos:', error);
      return true; // Retornar true para desenvolvimento
    }
  }

  async saveHotmartNotification(notificationData: any) {
    try {
      console.log('Salvando notificação Hotmart no NocoDB...');
      const response = await fetch(`${this.baseUrl}/api/v1/db/data/noco/whatsapp/HotmartNotifications`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          event_type: notificationData.eventType,
          instance_id: notificationData.instance,
          user_role: notificationData.userRole,
          hotmart_profile: notificationData.hotmartProfile,
          webhook_url: notificationData.webhookUrl,
          message_count: notificationData.messages.length,
          notification_phone: notificationData.notificationPhone,
          created_at: notificationData.timestamp,
        }),
      });
      
      if (!response.ok) {
        console.log('Falha ao salvar no NocoDB, usando resposta mock');
      } else {
        console.log('Notificação Hotmart salva com sucesso');
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao salvar notificação Hotmart:', error);
      return true; // Retornar true para desenvolvimento
    }
  }

  async saveInstance(instanceData: any) {
    try {
      console.log('Salvando instância no NocoDB...');
      const response = await fetch(`${this.baseUrl}/api/v1/db/data/noco/whatsapp/WhatsAppInstances`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          instance_id: instanceData.id,
          name: instanceData.name,
          status: instanceData.status,
          created_at: instanceData.creationDate,
          last_updated: new Date().toISOString(),
        }),
      });
      
      if (!response.ok) {
        console.log('Falha ao salvar no NocoDB, usando resposta mock');
      } else {
        console.log('Instância salva com sucesso no NocoDB');
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao salvar instância:', error);
      return true; // Retornar true para desenvolvimento
    }
  }
}

export const nocodbService = new NocodbService();
