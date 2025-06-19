import { authService } from './auth';

class UserContextService {
  getClientId(): string {
    const currentUser = authService.getCurrentUser();
    
    if (!currentUser) {
      console.warn('⚠️ No authenticated user found');
      return 'anonymous';
    }

    // Use the user's actual ID as priority since disparos are now saved with ID
    let clientId = currentUser.ID || 
                   currentUser.Email?.split('@')[0] || 
                   'default';

    console.log('🔐 Client ID extraído para usuário:', currentUser.Email, '-> ID:', clientId);
    console.log('🔍 Dados completos do usuário:', currentUser);
    return clientId;
  }

  getUserId(): string {
    const currentUser = authService.getCurrentUser();
    
    if (!currentUser) {
      console.warn('⚠️ No authenticated user found for user_id');
      return 'anonymous';
    }

    // Primary user ID for database filtering - use the actual ID
    const userId = currentUser.ID || 
                   currentUser.Email?.split('@')[0] || 
                   'default';

    console.log('👤 User ID extraído:', userId);
    console.log('🔍 Dados completos do usuário para userId:', currentUser);
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
