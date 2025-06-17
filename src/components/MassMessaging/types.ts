
export interface Message {
  id: string;
  type: 'text' | 'audio' | 'video' | 'image' | 'document';
  content: string;
  file?: File;
  fileUrl?: string;
  caption?: string; // Nova propriedade para descrição de arquivos
}

export interface CampaignData {
  campaign_id?: string; // Add this optional property
  instance: string;
  messages: Message[];
  recipients: string[];
  delay: number;
  notificationPhone: string;
  status?: string; // Add status property as well
}

export interface ContactData {
  name: string;
  phoneNumber: string;
}
