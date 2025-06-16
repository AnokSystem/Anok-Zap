
export interface DisparoFilters {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  instanceId?: string;
  campaignName?: string;
  searchTerm?: string;
}

export interface Disparo {
  id: string;
  campaignName: string;
  instanceName: string;
  recipientCount: number;
  status: 'enviado' | 'pendente' | 'erro' | 'enviando' | 'concluido' | 'cancelado';
  createdAt: string;
  messageType: string;
  sentCount?: number;
  errorCount?: number;
  contactsReached?: number;
}
