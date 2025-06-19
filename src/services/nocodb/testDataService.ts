
import { nocodbService } from './index';

export class TestDataService {
  static async createTestNotifications(): Promise<boolean> {
    try {
      console.log('🧪 TESTE - Iniciando criação de notificações de teste...');
      
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const userId = user.ID;
      
      if (!userId) {
        console.error('❌ TESTE - Usuário não encontrado');
        return false;
      }
      
      console.log('👤 TESTE - Criando notificações para usuário ID:', userId);
      
      // Usar o serviço de dados de notificações para criar exemplos
      const baseId = 'pddywozzup2sc85'; // Base ID do projeto
      const result = await nocodbService.notificationsDataService.createSampleData(baseId);
      
      if (result) {
        console.log('✅ TESTE - Notificações de teste criadas com sucesso!');
        
        // Disparar evento para atualizar o dashboard
        window.dispatchEvent(new CustomEvent('dashboardRefresh'));
        
        return true;
      } else {
        console.error('❌ TESTE - Falha ao criar notificações de teste');
        return false;
      }
    } catch (error) {
      console.error('❌ TESTE - Erro ao criar notificações de teste:', error);
      return false;
    }
  }
  
  static async createTestDisparos(): Promise<boolean> {
    try {
      console.log('🧪 TESTE - Iniciando criação de disparos de teste...');
      
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const userId = user.ID;
      
      if (!userId) {
        console.error('❌ TESTE - Usuário não encontrado');
        return false;
      }
      
      console.log('👤 TESTE - Criando disparos para usuário ID:', userId);
      
      // Usar o serviço de dados de disparos para criar exemplos
      const baseId = 'pddywozzup2sc85'; // Base ID do projeto
      const result = await nocodbService.disparosDataService.createSampleData(baseId);
      
      if (result) {
        console.log('✅ TESTE - Disparos de teste criados com sucesso!');
        
        // Disparar evento para atualizar o dashboard
        window.dispatchEvent(new CustomEvent('dashboardRefresh'));
        
        return true;
      } else {
        console.error('❌ TESTE - Falha ao criar disparos de teste');
        return false;
      }
    } catch (error) {
      console.error('❌ TESTE - Erro ao criar disparos de teste:', error);
      return false;
    }
  }
}

// Expor funções globalmente para teste no console
if (typeof window !== 'undefined') {
  (window as any).testNotifications = TestDataService.createTestNotifications;
  (window as any).testDisparos = TestDataService.createTestDisparos;
}
