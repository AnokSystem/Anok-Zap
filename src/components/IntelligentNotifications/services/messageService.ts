
import { Message } from '../types';

export const messageService = {
  createNewMessage: (): Message => ({
    id: Date.now().toString(),
    type: 'text',
    content: '',
    delay: 0
  }),

  addMessage: (messages: Message[] = []): Message[] => {
    if (messages.length >= 5) return messages;
    
    const newMessage = messageService.createNewMessage();
    return [...messages, newMessage];
  },

  removeMessage: (messages: Message[] = [], messageId: string): Message[] => {
    return messages.filter(msg => msg.id !== messageId);
  },

  updateMessage: (messages: Message[] = [], messageId: string, updates: Partial<Message>): Message[] => {
    return messages.map(msg => 
      msg.id === messageId ? { ...msg, ...updates } : msg
    );
  }
};
