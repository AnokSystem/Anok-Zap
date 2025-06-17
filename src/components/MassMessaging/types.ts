
export interface Message {
  id: string;
  type: 'text' | 'audio' | 'video' | 'image' | 'document';
  content: string;
  file?: File;
  fileUrl?: string;
  caption?: string; // Nova propriedade para descrição de arquivos
}

export interface CampaignData {
  campaign_id?: string;
  instance: string; // Instância principal para compatibilidade
  instances?: string[]; // Lista de todas as instâncias selecionadas
  instance_assignments?: { [key: string]: string }; // Mapeamento recipient -> instância
  messages: Message[];
  recipients: string[];
  delay: number;
  notificationPhone: string;
  status?: string;
}

export interface ContactData {
  name: string;
  phoneNumber: string;
}
