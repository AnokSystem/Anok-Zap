
import { nocodbService } from './nocodb';

export interface User {
  ID: string;
  Email: string;
  Nome: string;
  Ativo: boolean;
  AssinaturaExpira: string | null;
}

export interface LoginCredentials {
  email: string;
  senha: string;
}

class AuthService {
  private currentUser: User | null = null;

  constructor() {
    // Verificar se há usuário logado no localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
      } catch (error) {
        console.error('Erro ao recuperar usuário do localStorage:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }

  async login(credentials: LoginCredentials): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      console.log('🔐 Tentando fazer login com:', credentials.email);

      // Garantir que a tabela de usuários existe
      await nocodbService.ensureTableExists('Usuarios');
      
      const targetBaseId = nocodbService.getTargetBaseId();
      if (!targetBaseId) {
        throw new Error('Base do NocoDB não encontrada');
      }

      // Buscar usuário por email
      const users = await this.getUserByEmail(credentials.email);
      
      if (users.length === 0) {
        return { success: false, error: 'Email não encontrado' };
      }

      const user = users[0];
      
      // Verificar senha (em produção, use hash)
      if (user.Senha !== credentials.senha) {
        return { success: false, error: 'Senha incorreta' };
      }

      // Verificar se o usuário está ativo
      if (!user.Ativo) {
        return { success: false, error: 'Conta inativa' };
      }

      // Verificar se a assinatura não expirou
      if (user.AssinaturaExpira) {
        const expirationDate = new Date(user.AssinaturaExpira);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (expirationDate < today) {
          return { success: false, error: 'Assinatura expirada' };
        }
      }

      // Login bem-sucedido
      const userToSave: User = {
        ID: user.ID,
        Email: user.Email,
        Nome: user.Nome,
        Ativo: user.Ativo,
        AssinaturaExpira: user.AssinaturaExpira
      };

      this.currentUser = userToSave;
      localStorage.setItem('currentUser', JSON.stringify(userToSave));

      console.log('✅ Login realizado com sucesso:', userToSave);
      return { success: true, user: userToSave };

    } catch (error) {
      console.error('❌ Erro no login:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  }

  private async getUserByEmail(email: string): Promise<any[]> {
    try {
      const targetBaseId = nocodbService.getTargetBaseId();
      if (!targetBaseId) {
        throw new Error('Base não encontrada');
      }

      const tableId = await nocodbService.getTableId(targetBaseId, 'Usuarios');
      if (!tableId) {
        throw new Error('Tabela de usuários não encontrada');
      }

      const response = await fetch(`${nocodbService.config.baseUrl}/api/v1/db/data/noco/${targetBaseId}/${tableId}?where=(Email,eq,${email})`, {
        method: 'GET',
        headers: nocodbService.headers,
      });

      if (response.ok) {
        const data = await response.json();
        return data.list || [];
      } else {
        throw new Error('Erro ao buscar usuário');
      }
    } catch (error) {
      console.error('Erro ao buscar usuário por email:', error);
      return [];
    }
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
    console.log('🚪 Logout realizado');
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    if (!this.currentUser) return false;
    
    // Verificar se a assinatura não expirou
    if (this.currentUser.AssinaturaExpira) {
      const expirationDate = new Date(this.currentUser.AssinaturaExpira);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (expirationDate < today) {
        this.logout();
        return false;
      }
    }

    return this.currentUser.Ativo;
  }
}

export const authService = new AuthService();
