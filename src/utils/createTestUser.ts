
import { nocodbService } from '@/services/nocodb';

export const createTestUser = async () => {
  try {
    console.log('🔧 Criando usuário de teste...');
    
    // Garantir que a tabela de usuários existe
    await nocodbService.ensureTableExists('Usuarios');
    
    const targetBaseId = nocodbService.getTargetBaseId();
    if (!targetBaseId) {
      throw new Error('Base do NocoDB não encontrada');
    }

    // Obter ID da tabela de usuários
    const tableId = await nocodbService.getTableId(targetBaseId, 'Usuarios');
    if (!tableId) {
      throw new Error('Tabela de usuários não encontrada');
    }

    // Dados do usuário de teste
    const userData = {
      Email: 'admin@teste.com',
      Senha: '123456',
      Nome: 'Administrador',
      Ativo: true,
      AssinaturaExpira: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 1 ano a partir de hoje
    };

    console.log('📤 Dados do usuário a criar:', userData);

    // Criar usuário na base
    const response = await fetch(`${nocodbService.config.baseUrl}/api/v1/db/data/noco/${targetBaseId}/${tableId}`, {
      method: 'POST',
      headers: nocodbService.headers,
      body: JSON.stringify(userData),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Usuário criado com sucesso:', result);
      return { success: true, user: result };
    } else {
      const errorText = await response.text();
      console.error('❌ Erro ao criar usuário:', errorText);
      throw new Error(`Erro ao criar usuário: ${errorText}`);
    }

  } catch (error) {
    console.error('❌ Erro geral ao criar usuário:', error);
    return { success: false, error: error.message };
  }
};
