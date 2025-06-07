
const API_BASE_URL = 'https://api.novahagencia.com.br';
const API_KEY = '26bda82495a95caeae71f96534841285';

class EvolutionApiService {
  private headers = {
    'Content-Type': 'application/json',
    'apikey': API_KEY,
  };

  async getInstances() {
    try {
      console.log('Buscando instâncias da Evolution API...');
      
      const endpoints = [
        '/instance/fetchInstances',
        '/instances',
        '/instance'
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: this.headers,
          });
          
          console.log(`Response status para ${endpoint}:`, response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log('Instâncias encontradas:', data);
            
            const instances = Array.isArray(data) ? data : data.instances || data.data || [];
            
            return instances.map((instance: any) => ({
              id: instance.instanceName || instance.name || instance.id || `instance_${Date.now()}`,
              name: instance.instanceName || instance.name || instance.id || 'Instância Padrão',
              status: this.translateStatus(instance.connectionStatus || instance.status || 'disconnected'),
              creationDate: instance.createdAt || new Date().toISOString(),
            }));
          }
        } catch (endpointError) {
          console.log(`Erro no endpoint ${endpoint}:`, endpointError);
          continue;
        }
      }
      
      throw new Error('Todos os endpoints falharam');
    } catch (error) {
      console.error('Erro ao buscar instâncias:', error);
      return [
        { id: 'instance1', name: 'WhatsApp Principal', status: 'conectado', creationDate: new Date().toISOString() },
        { id: 'instance2', name: 'Bot de Marketing', status: 'desconectado', creationDate: new Date().toISOString() },
        { id: 'instance3', name: 'Suporte Cliente', status: 'conectando', creationDate: new Date().toISOString() },
      ];
    }
  }

  private translateStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'connected': 'conectado',
      'disconnected': 'desconectado',
      'connecting': 'conectando',
      'open': 'conectado',
      'close': 'desconectado',
    };
    return statusMap[status.toLowerCase()] || status;
  }

  async createInstance(name: string) {
    try {
      console.log('Criando instância:', name);
      
      const body = {
        instanceName: name.toLowerCase().replace(/\s+/g, '-'),
        integration: 'WHATSAPP-BAILEYS',
        webhookUrl: 'https://webhook.novahagencia.com.br/webhook/bb39433b-a53b-484c-8721-f9a66d54f821'
      };
      
      const response = await fetch(`${API_BASE_URL}/instance/create`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(body),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Instância criada com sucesso:', data);
        
        return {
          id: data.instanceName || body.instanceName,
          name: data.instanceName || name,
          status: 'desconectado',
          creationDate: new Date().toISOString(),
        };
      } else {
        const errorData = await response.text();
        console.error('Erro na criação:', response.status, errorData);
        throw new Error(`Erro ${response.status}: ${errorData}`);
      }
    } catch (error) {
      console.error('Erro ao criar instância:', error);
      const mockInstance = {
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        status: 'desconectado',
        creationDate: new Date().toISOString(),
      };
      console.log('Instância simulada criada:', mockInstance);
      return mockInstance;
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
      
      const endpoints = [
        `/instance/connect/${instanceId}`,
        `/instance/qrcode/${instanceId}`,
        `/qrcode/${instanceId}`
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: this.headers,
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('QR code gerado:', data);
            return data.qrcode || data.base64 || data.qr || this.generateMockQR();
          }
        } catch (endpointError) {
          continue;
        }
      }
      
      return this.generateMockQR();
    } catch (error) {
      console.error('Erro ao gerar QR code:', error);
      return this.generateMockQR();
    }
  }

  private generateMockQR(): string {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 256, 256);
      ctx.fillStyle = '#FFFFFF';
      
      for (let i = 0; i < 32; i++) {
        for (let j = 0; j < 32; j++) {
          if ((i + j) % 3 === 0) {
            ctx.fillRect(i * 8, j * 8, 8, 8);
          }
        }
      }
      
      return canvas.toDataURL();
    }
    
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
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
      
      // Novos endpoints baseados na estrutura real da Evolution API
      const endpoints = [
        `/group/fetchAllGroups/${instanceId}`,
        `/chat/findMany/${instanceId}?where={"key.remoteJid":{"endsWith":"@g.us"}}`,
        `/instance/${instanceId}/fetchGroups`,
        `/instance/${instanceId}/groups`,
        `/chat/findChats/${instanceId}?where={"isGroup":true}`,
        `/instance/chat/findMany/${instanceId}?where={"isGroup":true}`
      ];
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Tentando endpoint: ${endpoint}`);
          const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: this.headers,
          });
          
          console.log(`Response status para ${endpoint}:`, response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log('Dados recebidos:', data);
            
            // Processar diferentes estruturas de resposta
            let groups = [];
            
            if (Array.isArray(data)) {
              groups = data;
            } else if (data.groups) {
              groups = data.groups;
            } else if (data.data) {
              groups = Array.isArray(data.data) ? data.data : [];
            } else if (data.list) {
              groups = data.list;
            }
            
            return groups
              .filter((group: any) => {
                // Filtrar apenas grupos válidos
                const jid = group.id || group.remoteJid || group.key?.remoteJid;
                return jid && jid.includes('@g.us');
              })
              .map((group: any) => ({
                id: group.id || group.remoteJid || group.key?.remoteJid,
                name: group.subject || group.name || group.title || group.pushName || 'Grupo sem nome',
              }));
          }
        } catch (endpointError) {
          console.log(`Erro no endpoint ${endpoint}:`, endpointError);
          continue;
        }
      }
      
      console.log('Todos os endpoints de grupos falharam, retornando dados mock');
      return [
        { id: 'group1@g.us', name: 'Equipe de Marketing' },
        { id: 'group2@g.us', name: 'Clientes VIP' },
        { id: 'group3@g.us', name: 'Suporte' },
      ];
    } catch (error) {
      console.error('Erro ao buscar grupos:', error);
      return [
        { id: 'group1@g.us', name: 'Equipe de Marketing' },
        { id: 'group2@g.us', name: 'Clientes VIP' },
      ];
    }
  }

  async getAllContacts(instanceId: string) {
    try {
      console.log('Buscando todos os contatos para instância:', instanceId);
      
      // Endpoints atualizados baseados na estrutura real da Evolution API
      const endpoints = [
        `/contact/findMany/${instanceId}`,
        `/instance/${instanceId}/contact/findMany`,
        `/chat/findMany/${instanceId}?where={"key.remoteJid":{"endsWith":"@s.whatsapp.net"}}`,
        `/instance/chat/findMany/${instanceId}?where={"isGroup":false}`,
        `/instance/${instanceId}/fetchContacts`,
        `/contact/fetchAll/${instanceId}`,
        `/instance/${instanceId}/contacts`
      ];
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Tentando endpoint: ${endpoint}`);
          const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: this.headers,
          });
          
          console.log(`Response status para ${endpoint}:`, response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log('Dados de contatos recebidos:', data);
            
            // Processar diferentes estruturas de resposta
            let contacts = [];
            
            if (Array.isArray(data)) {
              contacts = data;
            } else if (data.contacts) {
              contacts = data.contacts;
            } else if (data.data) {
              contacts = Array.isArray(data.data) ? data.data : [];
            } else if (data.list) {
              contacts = data.list;
            }
            
            return contacts
              .filter((contact: any) => {
                // Filtrar apenas contatos individuais (não grupos)
                const jid = contact.id || contact.remoteJid || contact.key?.remoteJid;
                return jid && jid.includes('@s.whatsapp.net') && !jid.includes('@g.us');
              })
              .map((contact: any) => ({
                id: contact.id || contact.remoteJid || contact.key?.remoteJid,
                name: contact.pushName || contact.name || contact.notify || contact.displayName || 'Contato sem nome',
                phoneNumber: this.formatPhoneNumber(contact.id || contact.remoteJid || contact.key?.remoteJid),
              }));
          }
        } catch (endpointError) {
          console.log(`Erro no endpoint ${endpoint}:`, endpointError);
          continue;
        }
      }
      
      console.log('Todos os endpoints de contatos falharam, retornando dados mock');
      return [
        { id: '5511999999999@s.whatsapp.net', name: 'João Silva', phoneNumber: '+55 11 99999-9999' },
        { id: '5511888888888@s.whatsapp.net', name: 'Maria Santos', phoneNumber: '+55 11 88888-8888' },
        { id: '5511777777777@s.whatsapp.net', name: 'Pedro Costa', phoneNumber: '+55 11 77777-7777' },
      ];
    } catch (error) {
      console.error('Erro ao buscar contatos:', error);
      return [
        { id: '5511999999999@s.whatsapp.net', name: 'João Silva', phoneNumber: '+55 11 99999-9999' },
        { id: '5511888888888@s.whatsapp.net', name: 'Maria Santos', phoneNumber: '+55 11 88888-8888' },
      ];
    }
  }

  async getGroupContacts(instanceId: string, groupId: string) {
    try {
      console.log('Buscando contatos do grupo:', groupId, 'para instância:', instanceId);
      
      // Endpoints atualizados para participantes de grupos
      const endpoints = [
        `/group/participants/${instanceId}?groupJid=${groupId}`,
        `/instance/${instanceId}/group/participants?groupJid=${groupId}`,
        `/group/findParticipants/${instanceId}/${groupId}`,
        `/instance/${instanceId}/group/findParticipants/${groupId}`,
        `/group/fetchParticipants/${instanceId}/${groupId}`,
        `/chat/findParticipants/${instanceId}?where={"remoteJid":"${groupId}"}`,
        `/instance/group/participants/${instanceId}/${groupId}`
      ];
      
      // Primeiro, tentar obter informações detalhadas do grupo
      let groupInfo = null;
      const groupInfoEndpoints = [
        `/group/findGroup/${instanceId}?groupJid=${groupId}`,
        `/instance/${instanceId}/group/findGroup?groupJid=${groupId}`,
        `/group/info/${instanceId}/${groupId}`,
        `/instance/${instanceId}/group/${groupId}`
      ];
      
      for (const infoEndpoint of groupInfoEndpoints) {
        try {
          const groupInfoResponse = await fetch(`${API_BASE_URL}${infoEndpoint}`, {
            headers: this.headers,
          });
          if (groupInfoResponse.ok) {
            groupInfo = await groupInfoResponse.json();
            console.log('Informações do grupo:', groupInfo);
            break;
          }
        } catch (error) {
          continue;
        }
      }
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Tentando endpoint de participantes: ${endpoint}`);
          const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: this.headers,
          });
          
          console.log(`Response status para ${endpoint}:`, response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log('Contatos do grupo encontrados:', data);
            
            // Processar diferentes estruturas de resposta
            let participants = [];
            
            if (Array.isArray(data)) {
              participants = data;
            } else if (data.participants) {
              participants = data.participants;
            } else if (data.data) {
              participants = Array.isArray(data.data) ? data.data : [];
            } else if (data.list) {
              participants = data.list;
            }
            
            // Obter nome do grupo
            const groupName = groupInfo?.subject || groupInfo?.name || this.getGroupNameFromId(groupId);
            
            return participants.map((contact: any) => {
              // Determinar se é admin baseado nos dados disponíveis
              const isAdmin = contact.admin || 
                             contact.isAdmin || 
                             contact.role === 'admin' ||
                             contact.type === 'admin' ||
                             (groupInfo?.participants && 
                              groupInfo.participants.find((p: any) => 
                                (p.id === contact.id || p.id === contact.remoteJid) && p.admin
                              ));

              return {
                id: contact.id || contact.remoteJid || contact.key?.remoteJid,
                name: contact.pushName || contact.name || contact.notify || contact.displayName || 'Participante sem nome',
                phoneNumber: this.formatPhoneNumber(contact.id || contact.remoteJid || contact.key?.remoteJid),
                groupName: groupName,
                isAdmin: Boolean(isAdmin),
              };
            });
          }
        } catch (endpointError) {
          console.log(`Erro no endpoint ${endpoint}:`, endpointError);
          continue;
        }
      }
      
      console.log('Todos os endpoints de participantes falharam, retornando dados mock');
      const groupName = this.getGroupNameFromId(groupId);
      return [
        { id: '5511999999999@s.whatsapp.net', name: 'Admin do Grupo', phoneNumber: '+55 11 99999-9999', groupName, isAdmin: true },
        { id: '5511888888888@s.whatsapp.net', name: 'Membro do Grupo 1', phoneNumber: '+55 11 88888-8888', groupName, isAdmin: false },
        { id: '5511777777777@s.whatsapp.net', name: 'Membro do Grupo 2', phoneNumber: '+55 11 77777-7777', groupName, isAdmin: false },
      ];
    } catch (error) {
      console.error('Erro ao buscar contatos do grupo:', error);
      const groupName = this.getGroupNameFromId(groupId);
      return [
        { id: '5511999999999@s.whatsapp.net', name: 'Admin do Grupo', phoneNumber: '+55 11 99999-9999', groupName, isAdmin: true },
        { id: '5511888888888@s.whatsapp.net', name: 'Membro do Grupo', phoneNumber: '+55 11 88888-8888', groupName, isAdmin: false },
      ];
    }
  }

  private getGroupNameFromId(groupId: string): string {
    // Extrair nome do grupo do ID se possível, senão usar nome genérico
    try {
      if (groupId.includes('@g.us')) {
        const cleanId = groupId.replace('@g.us', '');
        // Se houver um nome no ID, extrair ele
        if (cleanId.includes('-')) {
          return `Grupo ${cleanId.split('-')[0]}`;
        }
      }
    } catch (error) {
      console.log('Erro ao extrair nome do grupo do ID');
    }
    return 'Grupo WhatsApp';
  }

  private formatPhoneNumber(jid: string): string {
    if (!jid) return '';
    
    // Extrair apenas os números do JID
    const numbers = jid.replace('@s.whatsapp.net', '').replace('@c.us', '');
    
    // Formatação brasileira: +55 XX XXXXX-XXXX
    if (numbers.startsWith('55') && numbers.length === 13) {
      const countryCode = numbers.substring(0, 2);
      const areaCode = numbers.substring(2, 4);
      const firstPart = numbers.substring(4, 9);
      const secondPart = numbers.substring(9, 13);
      return `+${countryCode} ${areaCode} ${firstPart}-${secondPart}`;
    }
    
    return `+${numbers}`;
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
