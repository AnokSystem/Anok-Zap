
export interface Notification {
  ID: string;
  'Tipo de Evento': string;
  'ID da Instância': string;
  'Perfil Hotmart': string;
  'URL do Webhook': string;
  'CreatedAt': string;
  'Dados Completos (JSON)': string;
  'Plataforma'?: string;
  'Papel do Usuário'?: string;
}

export type SyncStatus = 'success' | 'error' | 'loading' | null;
