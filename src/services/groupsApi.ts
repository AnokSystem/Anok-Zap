const API_BASE_URL = 'https://api.novahagencia.com.br';
const API_KEY = '26bda82495a95caeae71f96534841285';
const GROUPS_WEBHOOK_URL = 'https://webhook.novahagencia.com.br/webhook/2c8dfd55-c86f-4cd7-bcc9-eef206e16003';

class GroupsApiService {
  private headers = {
    'Content-Type': 'application/json',
    'apikey': API_KEY,
  };

  private getUserId(): string | null {
    try {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        return user.ID;
      }
    } catch (error) {
      console.error('Erro ao obter ID do usuário:', error);
    }
    return null;
  }

  private isUserInstance(instanceName: string, userId: string): boolean {
    return instanceName.includes(`user-${userId}`);
  }

  // Extrair número da instância para comparação
  private extractNumberFromInstance(instanceId: string): string {
    return instanceId.replace('user-', '').replace('-', '');
  }

  // Verificar se o participante é o usuário atual
  private isCurrentUser(participantId: string, myNumber: string): boolean {
    const participantNumber = (participantId || '').replace('@s.whatsapp.net', '').replace('@c.us', '');
    
    // Múltiplas formas de comparação para garantir compatibilidade
    return participantNumber === myNumber || 
           participantNumber.includes(myNumber) || 
           myNumber.includes(participantNumber) ||
           participantNumber.endsWith(myNumber) ||
           myNumber.endsWith(participantNumber);
  }

  // Verificar se o participante tem privilégios de admin
  private isAdminUser(participant: any): boolean {
    return participant.admin === 'admin' || 
           participant.admin === 'superadmin' || 
           participant.isAdmin === true ||
           participant.isSuperAdmin === true;
  }

  // Buscar grupos via API Evolution - apenas grupos onde sou admin
  async getGroups(instanceId: string) {
    try {
      const userId = this.getUserId();
      if (!userId || !this.isUserInstance(instanceId, userId)) {
        console.log('❌ Acesso negado à instância:', instanceId);
        return [];
      }

      console.log('🔍 Buscando grupos onde sou admin para instância:', instanceId);
      
      // Buscar grupos com participantes para verificar se sou admin
      const response = await fetch(`${API_BASE_URL}/group/fetchAllGroups/${instanceId}?getParticipants=true`, {
        headers: this.headers,
      });
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }
      
      const data = await response.json();
      const groups = Array.isArray(data) ? data : data.groups || data.data || [];
      
      console.log(`📊 Total de grupos encontrados: ${groups.length}`);
      
      // Extrair o número da instância para comparação
      const myNumber = this.extractNumberFromInstance(instanceId);
      console.log(`📱 Meu número extraído da instância: ${myNumber}`);
      
      // Filtrar apenas grupos onde sou admin
      const adminGroups = groups.filter((group: any) => {
        const participants = group.participants || [];
        console.log(`🔍 Verificando grupo "${group.subject || group.name}": ${participants.length} participantes`);
        
        // Procurar por mim mesmo na lista de participantes
        const myParticipation = participants.find((participant: any) => {
          const isMe = this.isCurrentUser(participant.id || participant.jid || '', myNumber);
          
          if (isMe) {
            const isAdmin = this.isAdminUser(participant);
            console.log(`👤 Encontrado no grupo "${group.subject || group.name}": Admin = ${isAdmin}`);
            return isAdmin;
          }
          
          return false;
        });
        
        return !!myParticipation;
      });
      
      console.log(`✅ Encontrados ${adminGroups.length} grupos onde sou admin de ${groups.length} grupos totais`);
      
      // Mapear para o formato padronizado
      const formattedGroups = adminGroups.map((group: any) => ({
        id: group.id || group.remoteJid,
        name: group.subject || group.name || 'Grupo sem nome',
        description: group.description || '',
        pictureUrl: group.pictureUrl || '',
        size: group.size || (group.participants ? group.participants.length : 0),
        creationTime: group.creationTime || '',
        isAnnounce: group.announce || false,
        isRestricted: group.restrict || false,
        participants: group.participants || [] // Manter participantes para uso posterior
      }));
      
      console.log(`📋 Grupos formatados para retorno: ${formattedGroups.length}`);
      return formattedGroups;
      
    } catch (error) {
      console.error('❌ Erro ao buscar grupos onde sou admin:', error);
      return [];
    }
  }

  // Buscar participantes de um grupo
  async getGroupParticipants(instanceId: string, groupId: string) {
    try {
      const userId = this.getUserId();
      if (!userId || !this.isUserInstance(instanceId, userId)) {
        return [];
      }

      const response = await fetch(`${API_BASE_URL}/group/participants/${instanceId}?groupJid=${groupId}`, {
        headers: this.headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        const participants = Array.isArray(data) ? data : data.participants || data.data || [];
        
        return participants.map((participant: any) => ({
          id: participant.id || participant.jid,
          name: participant.notify || participant.name || participant.pushName || 'Participante',
          phoneNumber: participant.id?.replace('@s.whatsapp.net', '') || '',
          isAdmin: participant.admin === 'admin' || participant.isAdmin === true,
          isSuperAdmin: participant.admin === 'superadmin' || participant.isSuperAdmin === true,
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Erro ao buscar participantes:', error);
      return [];
    }
  }

  // Nova função para criar grupo em lote - UPLOAD MINIO + WEBHOOK
  async createGroupBatch(instanceId: string, actions: any[]) {
    try {
      const userId = this.getUserId();
      if (!userId || !this.isUserInstance(instanceId, userId)) {
        throw new Error('Acesso negado à instância');
      }

      // Processar ações e fazer upload de imagens para MinIO se necessário
      const processedActions = await Promise.all(actions.map(async (action) => {
        if (action.action === 'update_group_picture' && action.data.profileImage instanceof File) {
          console.log('Fazendo upload da imagem para MinIO...');
          
          // Importar dinamicamente o serviço MinIO
          const { minioService } = await import('@/services/minio');
          
          try {
            // Fazer upload da imagem para MinIO
            const imageUrl = await minioService.uploadFile(action.data.profileImage);
            console.log('Imagem enviada para MinIO com sucesso:', imageUrl);
            
            return {
              ...action,
              data: {
                imageUrl: imageUrl, // URL da imagem no MinIO
                fileName: action.data.profileImage.name,
                fileType: action.data.profileImage.type
              }
            };
          } catch (uploadError) {
            console.error('Erro no upload da imagem para MinIO:', uploadError);
            throw new Error('Falha no upload da imagem de perfil');
          }
        }
        return action;
      }));

      const webhookData = {
        action: 'create_group_batch',
        instanceId,
        userId,
        data: {
          actions: processedActions,
          executeAll: true // Flag para executar tudo de uma vez
        },
        timestamp: new Date().toISOString(),
      };

      console.log('Enviando dados para webhook:', webhookData);

      const response = await fetch(GROUPS_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
      });

      if (response.ok) {
        console.log('Criação de grupo em lote enviada via webhook');
        return true;
      }
      
      throw new Error('Falha ao enviar criação em lote');
    } catch (error) {
      console.error('Erro ao criar grupo em lote:', error);
      throw error;
    }
  }

  // Função auxiliar para converter File para base64
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove o prefixo "data:image/...;base64,"
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Falha ao converter arquivo para base64'));
        }
      };
      reader.onerror = error => reject(error);
    });
  }

  // Nova função para atualizar múltiplas informações do grupo
  async updateGroupBatch(instanceId: string, groupId: string, actions: any[]) {
    try {
      const userId = this.getUserId();
      if (!userId || !this.isUserInstance(instanceId, userId)) {
        throw new Error('Acesso negado à instância');
      }

      const webhookData = {
        action: 'update_group_batch',
        instanceId,
        userId,
        groupId,
        data: {
          actions: actions
        },
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(GROUPS_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
      });

      if (response.ok) {
        console.log('Atualizações em lote enviadas via webhook');
        return true;
      }
      
      throw new Error('Falha ao enviar atualizações');
    } catch (error) {
      console.error('Erro ao enviar atualizações em lote:', error);
      throw error;
    }
  }

  // Criar grupo via webhook
  async createGroup(instanceId: string, groupData: { name: string; description?: string; isPrivate?: boolean; participants?: string[] }) {
    try {
      const userId = this.getUserId();
      if (!userId || !this.isUserInstance(instanceId, userId)) {
        throw new Error('Acesso negado à instância');
      }

      const webhookData = {
        action: 'create_group',
        instanceId,
        userId,
        data: {
          name: groupData.name,
          description: groupData.description || '',
          isPrivate: groupData.isPrivate || false,
          participants: groupData.participants || [],
        },
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(GROUPS_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
      });

      if (response.ok) {
        console.log('Grupo criado via webhook');
        return true;
      }
      
      throw new Error('Falha ao criar grupo');
    } catch (error) {
      console.error('Erro ao criar grupo:', error);
      throw error;
    }
  }

  // Atualizar imagem do grupo
  async updateGroupPicture(instanceId: string, groupId: string, imageFile: File) {
    try {
      const userId = this.getUserId();
      if (!userId || !this.isUserInstance(instanceId, userId)) {
        throw new Error('Acesso negado à instância');
      }

      const formData = new FormData();
      formData.append('image', imageFile);

      const webhookData = {
        action: 'update_group_picture',
        instanceId,
        userId,
        groupId,
        timestamp: new Date().toISOString(),
      };

      // Aqui você pode enviar tanto o webhook quanto a imagem
      const response = await fetch(GROUPS_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
      });

      if (response.ok) {
        console.log('Imagem do grupo atualizada via webhook');
        return true;
      }
      
      throw new Error('Falha ao atualizar imagem');
    } catch (error) {
      console.error('Erro ao atualizar imagem:', error);
      throw error;
    }
  }

  // Atualizar nome do grupo
  async updateGroupName(instanceId: string, groupId: string, newName: string) {
    try {
      const userId = this.getUserId();
      if (!userId || !this.isUserInstance(instanceId, userId)) {
        throw new Error('Acesso negado à instância');
      }

      const webhookData = {
        action: 'update_group_name',
        instanceId,
        userId,
        groupId,
        data: {
          name: newName,
        },
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(GROUPS_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
      });

      if (response.ok) {
        console.log('Nome do grupo atualizado via webhook');
        return true;
      }
      
      throw new Error('Falha ao atualizar nome');
    } catch (error) {
      console.error('Erro ao atualizar nome:', error);
      throw error;
    }
  }

  // Atualizar descrição do grupo
  async updateGroupDescription(instanceId: string, groupId: string, newDescription: string) {
    try {
      const userId = this.getUserId();
      if (!userId || !this.isUserInstance(instanceId, userId)) {
        throw new Error('Acesso negado à instância');
      }

      const webhookData = {
        action: 'update_group_description',
        instanceId,
        userId,
        groupId,
        data: {
          description: newDescription,
        },
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(GROUPS_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
      });

      if (response.ok) {
        console.log('Descrição do grupo atualizada via webhook');
        return true;
      }
      
      throw new Error('Falha ao atualizar descrição');
    } catch (error) {
      console.error('Erro ao atualizar descrição:', error);
      throw error;
    }
  }

  // Atualizar configurações do grupo
  async updateGroupSettings(instanceId: string, groupId: string, settings: { isAnnounce?: boolean; isRestricted?: boolean }) {
    try {
      const userId = this.getUserId();
      if (!userId || !this.isUserInstance(instanceId, userId)) {
        throw new Error('Acesso negado à instância');
      }

      const webhookData = {
        action: 'update_group_settings',
        instanceId,
        userId,
        groupId,
        data: settings,
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(GROUPS_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
      });

      if (response.ok) {
        console.log('Configurações do grupo atualizadas via webhook');
        return true;
      }
      
      throw new Error('Falha ao atualizar configurações');
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      throw error;
    }
  }

  // Gerenciar participantes
  async manageParticipant(instanceId: string, groupId: string, participantId: string, action: 'add' | 'remove' | 'promote' | 'demote') {
    try {
      const userId = this.getUserId();
      if (!userId || !this.isUserInstance(instanceId, userId)) {
        throw new Error('Acesso negado à instância');
      }

      const webhookData = {
        action: 'manage_participant',
        instanceId,
        userId,
        groupId,
        data: {
          participantId,
          participantAction: action,
        },
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(GROUPS_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
      });

      if (response.ok) {
        console.log(`Participante ${action} via webhook`);
        return true;
      }
      
      throw new Error(`Falha ao ${action} participante`);
    } catch (error) {
      console.error(`Erro ao ${action} participante:`, error);
      throw error;
    }
  }

  // Enviar mensagem para grupo (mantém a funcionalidade original)
  async sendMessageToGroup(instanceId: string, groupId: string, message: string) {
    try {
      const userId = this.getUserId();
      if (!userId || !this.isUserInstance(instanceId, userId)) {
        throw new Error('Acesso negado à instância');
      }

      const response = await fetch(`${API_BASE_URL}/message/sendText/${instanceId}`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          number: groupId,
          text: message,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Falha ao enviar mensagem');
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  }
}

export const groupsApiService = new GroupsApiService();

}
