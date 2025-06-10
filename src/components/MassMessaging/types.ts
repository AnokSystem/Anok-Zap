
export interface Message {
  id: string;
  type: 'text' | 'audio' | 'video' | 'image' | 'document';
  content: string;
  file?: File;
  fileUrl?: string;
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
