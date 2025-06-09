
import { useState } from 'react';
import { NotificationRule, Message } from '../types';

const initialFormState: Partial<NotificationRule> = {
  eventType: '',
  userRole: '',
  platform: '',
  profileName: '',
  instanceId: '',
  messages: [{ id: '1', type: 'text', content: '', delay: 0 }],
};

export const useFormState = () => {
  const [newRule, setNewRule] = useState<Partial<NotificationRule>>(initialFormState);
  const [createdWebhookUrl, setCreatedWebhookUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setNewRule(initialFormState);
    setCreatedWebhookUrl('');
  };

  return {
    newRule,
    setNewRule,
    createdWebhookUrl,
    setCreatedWebhookUrl,
    isLoading,
    setIsLoading,
    resetForm,
    initialFormState,
  };
};
