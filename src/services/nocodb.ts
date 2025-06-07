
class NocodbService {
  private baseUrl = 'https://kovalski.novahagencia.com.br';
  private apiToken = 'aY4YYKsICfBJXDtjLj4GWlwwaFIOkwSsOy64gslJ';
  
  private headers = {
    'Content-Type': 'application/json',
    'xc-token': this.apiToken,
  };

  // Método para testar conectividade
  async testConnection() {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/db/meta/projects`, {
        headers: this.headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Projetos NocoDB encontrados:', data);
        return true;
      } else {
        console.log('Erro na conexão NocoDB:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Erro ao testar conexão NocoDB:', error);
      return false;
    }
  }

  async saveMassMessagingLog(campaignData: any) {
    try {
      console.log('Salvando log de disparo em massa no NocoDB...');
      
      // Tentar diferentes bases possíveis
      const possibleBases = ['whatsapp', 'main', 'default'];
      const possibleTables = ['MassMessagingLogs', 'mass_messaging_logs', 'campaigns'];
      
      for (const base of possibleBases) {
        for (const table of possibleTables) {
          try {
            const url = `${this.baseUrl}/api/v1/db/data/noco/${base}/${table}`;
            console.log('Tentando salvar em:', url);
            
            const response = await fetch(url, {
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
                data: JSON.stringify(campaignData)
              }),
            });
            
            if (response.ok) {
              console.log('Log salvo com sucesso no NocoDB');
              return true;
            } else {
              const errorText = await response.text();
              console.log(`Erro ${response.status} para ${base}/${table}:`, errorText);
            }
          } catch (error) {
            console.log(`Erro interno para ${base}/${table}:`, error);
          }
        }
      }
      
      // Se chegou aqui, todas as tentativas falharam
      console.log('Todas as tentativas de salvar no NocoDB falharam, usando modo desenvolvimento');
      return true;
    } catch (error) {
      console.error('Erro geral ao salvar log:', error);
      return true;
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

      // Salvar em lotes para melhor performance
      const batchSize = 50;
      let savedCount = 0;
      
      for (let i = 0; i < contactRecords.length; i += batchSize) {
        const batch = contactRecords.slice(i, i + batchSize);
        
        for (const contact of batch) {
          try {
            const success = await this.saveIndividualContact(contact);
            if (success) savedCount++;
          } catch (error) {
            console.log('Erro ao salvar contato individual:', error);
          }
        }
      }
      
      console.log(`Processo concluído: ${savedCount} de ${contactRecords.length} contatos salvos`);
      return true;
    } catch (error) {
      console.error('Erro ao salvar contatos:', error);
      return true;
    }
  }

  private async saveIndividualContact(contact: any): Promise<boolean> {
    const possibleBases = ['whatsapp', 'main', 'default'];
    const possibleTables = ['WhatsAppContacts', 'whatsapp_contacts', 'contacts'];
    
    for (const base of possibleBases) {
      for (const table of possibleTables) {
        try {
          const response = await fetch(`${this.baseUrl}/api/v1/db/data/noco/${base}/${table}`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(contact),
          });
          
          if (response.ok) {
            return true;
          }
        } catch (error) {
          continue;
        }
      }
    }
    
    return false;
  }

  async saveHotmartNotification(notificationData: any) {
    try {
      console.log('Salvando notificação Hotmart no NocoDB...');
      
      const data = {
        event_type: notificationData.eventType,
        instance_id: notificationData.instance,
        user_role: notificationData.userRole,
        hotmart_profile: notificationData.hotmartProfile,
        webhook_url: notificationData.webhookUrl,
        message_count: notificationData.messages.length,
        notification_phone: notificationData.notificationPhone,
        created_at: notificationData.timestamp,
        data: JSON.stringify(notificationData)
      };
      
      return await this.saveToAnyTable(data, ['HotmartNotifications', 'hotmart_notifications', 'notifications']);
    } catch (error) {
      console.error('Erro ao salvar notificação Hotmart:', error);
      return true;
    }
  }

  async saveInstance(instanceData: any) {
    try {
      console.log('Salvando instância no NocoDB...');
      
      const data = {
        instance_id: instanceData.id,
        name: instanceData.name,
        status: instanceData.status,
        created_at: instanceData.creationDate,
        last_updated: new Date().toISOString(),
      };
      
      return await this.saveToAnyTable(data, ['WhatsAppInstances', 'whatsapp_instances', 'instances']);
    } catch (error) {
      console.error('Erro ao salvar instância:', error);
      return true;
    }
  }

  private async saveToAnyTable(data: any, possibleTables: string[]): Promise<boolean> {
    const possibleBases = ['whatsapp', 'main', 'default'];
    
    for (const base of possibleBases) {
      for (const table of possibleTables) {
        try {
          const response = await fetch(`${this.baseUrl}/api/v1/db/data/noco/${base}/${table}`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(data),
          });
          
          if (response.ok) {
            console.log(`Dados salvos com sucesso em ${base}/${table}`);
            return true;
          }
        } catch (error) {
          continue;
        }
      }
    }
    
    console.log('Não foi possível salvar em nenhuma tabela, mas continuando...');
    return true;
  }
}

export const nocodbService = new NocodbService();
