
import { authService } from './auth';

class UserContextService {
  getClientId(): string {
    const currentUser = authService.getCurrentUser();
    
    if (!currentUser) {
      console.warn('⚠️ No authenticated user found');
      return 'anonymous';
    }

    // Use the user's actual ID first, then fall back to email-based ID
    let clientId = currentUser.id || 
                   currentUser.ID || 
                   currentUser.user_id ||
                   currentUser.Email?.split('@')[0] || 
                   'default';

    console.log('🔐 Client ID extraído para usuário:', currentUser.Email, '-> ID:', clientId);
    return clientId;
  }

  getUserId(): string {
    const currentUser = authService.getCurrentUser();
    
    if (!currentUser) {
      console.warn('⚠️ No authenticated user found for user_id');
      return 'anonymous';
    }

    // Primary user ID for database filtering
    const userId = currentUser.id || 
                   currentUser.ID || 
                   currentUser.user_id ||
                   currentUser.Email?.split('@')[0] || 
                   'default';

    console.log('👤 User ID extraído:', userId);
    return userId;
  }

  getCurrentUser() {
    return authService.getCurrentUser();
  }

  isAuthenticated(): boolean {
    return authService.isAuthenticated();
  }
}

export const userContextService = new UserContextService();
