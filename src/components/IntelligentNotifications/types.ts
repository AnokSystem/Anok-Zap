
export interface Message {
  id: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'document';
  content: string;
  file?: File;
  fileUrl?: string;
  delay: number; // tempo em minutos
}

export interface NotificationRule {
  id: string;
  eventType: string;
  userRole: string; // produtor ou afiliado
  platform: string; // Hotmart, Braip, Kiwfy, Monetize
  profileName: string;
  instanceId: string;
  messages: Message[];
  webhookUrl: string;
  productScope: 'all' | 'specific'; // novo campo
  specificProductName?: string; // novo campo
}
