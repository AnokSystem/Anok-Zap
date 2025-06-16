
import { BaseNocodbService } from '../baseService';
import { NocodbConfig } from '../types';

export class ClientService extends BaseNocodbService {
  constructor(config: NocodbConfig) {
    super(config);
  }

  getClientId(): string {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return user.client_id || user.Email?.split('@')[0] || 'default';
  }
}
