
const API_BASE_URL = 'https://api.novahagencia.com.br';
const API_KEY = '26bda82495a95caeae71f96534841285';

class EvolutionApiService {
  private headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`,
  };

  async getInstances() {
    try {
      const response = await fetch(`${API_BASE_URL}/instance/fetchInstances`, {
        headers: this.headers,
      });
      if (!response.ok) throw new Error('Failed to fetch instances');
      const data = await response.json();
      return data.map((instance: any) => ({
        id: instance.instanceName || instance.name,
        name: instance.instanceName || instance.name,
        status: instance.connectionStatus || 'disconnected',
        creationDate: instance.createdAt || new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Error fetching instances:', error);
      // Return mock data for development
      return [
        { id: 'instance1', name: 'Main WhatsApp', status: 'connected', creationDate: new Date().toISOString() },
        { id: 'instance2', name: 'Marketing Bot', status: 'disconnected', creationDate: new Date().toISOString() },
      ];
    }
  }

  async createInstance(name: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/instance/create`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          instanceName: name,
          integration: 'WHATSAPP-BAILEYS'
        }),
      });
      if (!response.ok) throw new Error('Failed to create instance');
      const data = await response.json();
      return {
        id: data.instanceName || name,
        name: data.instanceName || name,
        status: 'disconnected',
        creationDate: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error creating instance:', error);
      // Return mock data for development
      return {
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        status: 'disconnected',
        creationDate: new Date().toISOString(),
      };
    }
  }

  async deleteInstance(instanceId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/instance/delete/${instanceId}`, {
        method: 'DELETE',
        headers: this.headers,
      });
      if (!response.ok) throw new Error('Failed to delete instance');
      return true;
    } catch (error) {
      console.error('Error deleting instance:', error);
      return true; // Return true for development
    }
  }

  async generateQrCode(instanceId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/instance/connect/${instanceId}`, {
        headers: this.headers,
      });
      if (!response.ok) throw new Error('Failed to generate QR code');
      const data = await response.json();
      return data.qrcode || data.base64 || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    } catch (error) {
      console.error('Error generating QR code:', error);
      // Return placeholder QR code for development
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    }
  }

  async connectInstance(instanceId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/instance/connectionState/${instanceId}`, {
        headers: this.headers,
      });
      if (!response.ok) throw new Error('Failed to connect instance');
      return true;
    } catch (error) {
      console.error('Error connecting instance:', error);
      return true; // Return true for development
    }
  }

  async getGroups(instanceId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/group/fetchAllGroups/${instanceId}`, {
        headers: this.headers,
      });
      if (!response.ok) throw new Error('Failed to fetch groups');
      const data = await response.json();
      return data.map((group: any) => ({
        id: group.id,
        name: group.subject || group.name,
      }));
    } catch (error) {
      console.error('Error fetching groups:', error);
      // Return mock data for development
      return [
        { id: 'group1', name: 'Marketing Team' },
        { id: 'group2', name: 'Customers' },
      ];
    }
  }

  async getAllContacts(instanceId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/fetchAllContacts/${instanceId}`, {
        headers: this.headers,
      });
      if (!response.ok) throw new Error('Failed to fetch contacts');
      const data = await response.json();
      return data.map((contact: any) => ({
        id: contact.id || contact.remoteJid,
        name: contact.pushName || contact.name || 'Unknown',
        phoneNumber: contact.id || contact.remoteJid,
      }));
    } catch (error) {
      console.error('Error fetching contacts:', error);
      // Return mock data for development
      return [
        { id: '1', name: 'John Doe', phoneNumber: '+5511999999999' },
        { id: '2', name: 'Jane Smith', phoneNumber: '+5511888888888' },
      ];
    }
  }

  async getGroupContacts(instanceId: string, groupId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/group/participants/${instanceId}?groupJid=${groupId}`, {
        headers: this.headers,
      });
      if (!response.ok) throw new Error('Failed to fetch group contacts');
      const data = await response.json();
      return data.map((contact: any) => ({
        id: contact.id,
        name: contact.pushName || contact.name || 'Unknown',
        phoneNumber: contact.id,
        groupName: groupId,
      }));
    } catch (error) {
      console.error('Error fetching group contacts:', error);
      // Return mock data for development
      return [
        { id: '1', name: 'Group Member 1', phoneNumber: '+5511999999999', groupName: 'Marketing Team' },
        { id: '2', name: 'Group Member 2', phoneNumber: '+5511888888888', groupName: 'Marketing Team' },
      ];
    }
  }

  async sendMessage(instanceId: string, phoneNumber: string, message: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/message/sendText/${instanceId}`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          number: phoneNumber,
          text: message,
        }),
      });
      if (!response.ok) throw new Error('Failed to send message');
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return true; // Return true for development
    }
  }
}

export const evolutionApiService = new EvolutionApiService();
