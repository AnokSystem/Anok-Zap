
export const webhookService = {
  getWebhookUrl: (eventType: string): string => {
    const webhookUrls: Record<string, string> = {
      'purchase-approved': 'https://webhook.novahagencia.com.br/webhook/4759af4e-61f0-47b8-b2c0-d730000ca2b5',
      'awaiting-payment': 'https://webhook.novahagencia.com.br/webhook/5f5fd8b0-0733-4cfc-b5e7-319462991065',
      'cart-abandoned': 'https://webhook.novahagencia.com.br/webhook/6631e496-f119-48a4-b198-7d1d5010bbf7'
    };
    return webhookUrls[eventType] || '';
  }
};
