
import { authService } from './auth';

class UserContextService {
  getClientId(): string {
    const currentUser = authService.getCurrentUser();
    
    if (!currentUser) {
      console.warn('⚠️ No authenticated user found');
      return 'anonymous';
    }

    // Try different client ID extraction methods
    let clientId = currentUser.ID || 
                   currentUser.Email?.split('@')[0] || 
                   'default';

    console.log('🔐 Client ID extraído para usuário:', currentUser.Email, '-> ID:', clientId);
    return clientId;
  }

  getCurrentUser() {
    return authService.getCurrentUser();
  }

  isAuthenticated(): boolean {
    return authService.isAuthenticated();
  }
}

export const userContextService = new UserContextService();
