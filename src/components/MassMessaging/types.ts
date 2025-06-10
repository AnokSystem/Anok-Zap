export interface Message {
  id: string;
  type: 'text' | 'audio' | 'video' | 'image' | 'document';
  content: string;
  file?: File;
  fileUrl?: string;
  caption?: string; // Nova propriedade para descrição de arquivos
}

export interface CampaignData {
  instance: string;
  messages: Message[];
  recipients: string[];
  delay: number;
  notificationPhone: string;
}

export interface ContactData {
  name: string;
  phoneNumber: string;
}
