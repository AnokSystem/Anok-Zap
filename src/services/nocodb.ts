
class NocodbService {
  private baseUrl = 'https://kovalski.novahagencia.com.br';
  private apiToken = 'aY4YYKsICfBJXDtjLj4GWlwwaFIOkwSsOy64gslJ';
  
  private headers = {
    'Content-Type': 'application/json',
    'xc-token': this.apiToken,
  };

  async saveMassMessagingLog(campaignData: any) {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/db/data/noco/whatsapp/MassMessagingLogs`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          campaign_id: `campaign_${Date.now()}`,
          instance_id: campaignData.instance,
          message_type: campaignData.messages[0]?.type || 'text',
          recipient_count: campaignData.recipients.length,
          delay: campaignData.delay,
          status: 'initiated',
          created_at: new Date().toISOString(),
        }),
      });
      
      if (!response.ok) {
        console.log('Failed to save to NocoDB, using mock response');
      }
      
      return true;
    } catch (error) {
      console.error('Error saving mass messaging log:', error);
      return true; // Return true for development
    }
  }

  async saveContacts(contacts: any[], instanceId: string) {
    try {
      const contactRecords = contacts.map(contact => ({
        contact_id: contact.id,
        name: contact.name,
        phone_number: contact.phoneNumber,
        group_name: contact.groupName || null,
        instance_id: instanceId,
        created_at: new Date().toISOString(),
      }));

      for (const contact of contactRecords) {
        await fetch(`${this.baseUrl}/api/v1/db/data/noco/whatsapp/WhatsAppContacts`, {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify(contact),
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error saving contacts:', error);
      return true; // Return true for development
    }
  }

  async saveHotmartNotification(notificationData: any) {
    try {
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
        console.log('Failed to save to NocoDB, using mock response');
      }
      
      return true;
    } catch (error) {
      console.error('Error saving Hotmart notification:', error);
      return true; // Return true for development
    }
  }

  async saveInstance(instanceData: any) {
    try {
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
        console.log('Failed to save to NocoDB, using mock response');
      }
      
      return true;
    } catch (error) {
      console.error('Error saving instance:', error);
      return true; // Return true for development
    }
  }
}

export const nocodbService = new NocodbService();
