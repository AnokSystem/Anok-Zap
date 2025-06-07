
const API_BASE_URL = 'https://api.novahagencia.com.br';
const API_KEY = '26bda82495a95caeae71f96534841285';

class EvolutionApiService {
  private headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`,
  };

  async getInstances() {
    try {
      console.log('Buscando instâncias da Evolution API...');
      const response = await fetch(`${API_BASE_URL}/instance/fetchInstances`, {
        headers: this.headers,
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        console.error('Erro na API:', response.status, response.statusText);
        throw new Error('Falha ao buscar instâncias');
      }
      
      const data = await response.json();
      console.log('Dados recebidos:', data);
      
      return data.map((instance: any) => ({
        id: instance.instanceName || instance.name || instance.id,
        name: instance.instanceName || instance.name || instance.id,
        status: instance.connectionStatus || instance.status || 'disconnected',
        creationDate: instance.createdAt || new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Erro ao buscar instâncias:', error);
      // Retornar dados mock para desenvolvimento
      return [
        { id: 'instance1', name: 'WhatsApp Principal', status: 'connected', creationDate: new Date().toISOString() },
        { id: 'instance2', name: 'Bot de Marketing', status: 'disconnected', creationDate: new Date().toISOString() },
      ];
    }
  }

  async createInstance(name: string) {
    try {
      console.log('Criando instância:', name);
      const response = await fetch(`${API_BASE_URL}/instance/create`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          instanceName: name,
          integration: 'WHATSAPP-BAILEYS'
        }),
      });
      
      if (!response.ok) {
        console.error('Erro ao criar instância:', response.status);
        throw new Error('Falha ao criar instância');
      }
      
      const data = await response.json();
      console.log('Instância criada:', data);
      
      return {
        id: data.instanceName || name,
        name: data.instanceName || name,
        status: 'disconnected',
        creationDate: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Erro ao criar instância:', error);
      // Retornar dados mock para desenvolvimento
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
      console.log('Excluindo instância:', instanceId);
      const response = await fetch(`${API_BASE_URL}/instance/delete/${instanceId}`, {
        method: 'DELETE',
        headers: this.headers,
      });
      
      if (!response.ok) {
        console.error('Erro ao excluir instância:', response.status);
        throw new Error('Falha ao excluir instância');
      }
      
      console.log('Instância excluída com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao excluir instância:', error);
      return true; // Retornar true para desenvolvimento
    }
  }

  async generateQrCode(instanceId: string) {
    try {
      console.log('Gerando QR code para instância:', instanceId);
      const response = await fetch(`${API_BASE_URL}/instance/connect/${instanceId}`, {
        headers: this.headers,
      });
      
      if (!response.ok) {
        console.error('Erro ao gerar QR code:', response.status);
        throw new Error('Falha ao gerar código QR');
      }
      
      const data = await response.json();
      console.log('QR code gerado:', data);
      
      return data.qrcode || data.base64 || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    } catch (error) {
      console.error('Erro ao gerar QR code:', error);
      // Retornar QR code placeholder para desenvolvimento
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    }
  }

  async connectInstance(instanceId: string) {
    try {
      console.log('Conectando instância:', instanceId);
      const response = await fetch(`${API_BASE_URL}/instance/connectionState/${instanceId}`, {
        headers: this.headers,
      });
      
      if (!response.ok) {
        console.error('Erro ao conectar instância:', response.status);
        throw new Error('Falha ao conectar instância');
      }
      
      console.log('Instância conectada com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao conectar instância:', error);
      return true; // Retornar true para desenvolvimento
    }
  }

  async getGroups(instanceId: string) {
    try {
      console.log('Buscando grupos para instância:', instanceId);
      const response = await fetch(`${API_BASE_URL}/group/fetchAllGroups/${instanceId}`, {
        headers: this.headers,
      });
      
      if (!response.ok) {
        console.error('Erro ao buscar grupos:', response.status);
        throw new Error('Falha ao buscar grupos');
      }
      
      const data = await response.json();
      console.log('Grupos encontrados:', data);
      
      return data.map((group: any) => ({
        id: group.id,
        name: group.subject || group.name,
      }));
    } catch (error) {
      console.error('Erro ao buscar grupos:', error);
      // Retornar dados mock para desenvolvimento
      return [
        { id: 'group1', name: 'Equipe de Marketing' },
        { id: 'group2', name: 'Clientes' },
      ];
    }
  }

  async getAllContacts(instanceId: string) {
    try {
      console.log('Buscando todos os contatos para instância:', instanceId);
      const response = await fetch(`${API_BASE_URL}/chat/fetchAllContacts/${instanceId}`, {
        headers: this.headers,
      });
      
      if (!response.ok) {
        console.error('Erro ao buscar contatos:', response.status);
        throw new Error('Falha ao buscar contatos');
      }
      
      const data = await response.json();
      console.log('Contatos encontrados:', data);
      
      return data.map((contact: any) => ({
        id: contact.id || contact.remoteJid,
        name: contact.pushName || contact.name || 'Desconhecido',
        phoneNumber: contact.id || contact.remoteJid,
      }));
    } catch (error) {
      console.error('Erro ao buscar contatos:', error);
      // Retornar dados mock para desenvolvimento
      return [
        { id: '1', name: 'João Silva', phoneNumber: '+5511999999999' },
        { id: '2', name: 'Maria Santos', phoneNumber: '+5511888888888' },
      ];
    }
  }

  async getGroupContacts(instanceId: string, groupId: string) {
    try {
      console.log('Buscando contatos do grupo:', groupId, 'para instância:', instanceId);
      const response = await fetch(`${API_BASE_URL}/group/participants/${instanceId}?groupJid=${groupId}`, {
        headers: this.headers,
      });
      
      if (!response.ok) {
        console.error('Erro ao buscar contatos do grupo:', response.status);
        throw new Error('Falha ao buscar contatos do grupo');
      }
      
      const data = await response.json();
      console.log('Contatos do grupo encontrados:', data);
      
      return data.map((contact: any) => ({
        id: contact.id,
        name: contact.pushName || contact.name || 'Desconhecido',
        phoneNumber: contact.id,
        groupName: groupId,
      }));
    } catch (error) {
      console.error('Erro ao buscar contatos do grupo:', error);
      // Retornar dados mock para desenvolvimento
      return [
        { id: '1', name: 'Membro do Grupo 1', phoneNumber: '+5511999999999', groupName: 'Equipe de Marketing' },
        { id: '2', name: 'Membro do Grupo 2', phoneNumber: '+5511888888888', groupName: 'Equipe de Marketing' },
      ];
    }
  }

  async sendMessage(instanceId: string, phoneNumber: string, message: string) {
    try {
      console.log('Enviando mensagem:', { instanceId, phoneNumber, message });
      const response = await fetch(`${API_BASE_URL}/message/sendText/${instanceId}`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          number: phoneNumber,
          text: message,
        }),
      });
      
      if (!response.ok) {
        console.error('Erro ao enviar mensagem:', response.status);
        throw new Error('Falha ao enviar mensagem');
      }
      
      console.log('Mensagem enviada com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      return true; // Retornar true para desenvolvimento
    }
  }
}

export const evolutionApiService = new EvolutionApiService();
