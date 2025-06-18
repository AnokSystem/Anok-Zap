
export const webhookService = {
  getWebhookUrl: (eventType: string, userRole: string, productScope: string): string => {
    const webhookUrls: Record<string, string> = {
      // Compra Aprovada - Produtor
      'purchase-approved-produtor-all': 'https://webhook.novahagencia.com.br/webhook/4759af4e-61f0-47b8-b2c0-d730000ca2b5',
      'purchase-approved-produtor-specific': 'https://webhook.novahagencia.com.br/webhook/ce69183c-3a66-41df-b412-374d1b4e09e9',
      
      // Aguardando Pagamento - Produtor
      'awaiting-payment-produtor-all': 'https://webhook.novahagencia.com.br/webhook/5f5fd8b0-0733-4cfc-b5e7-319462991065',
      'awaiting-payment-produtor-specific': 'https://webhook.novahagencia.com.br/webhook/02510c09-c8ae-4045-8907-eb47524a155a',
      
      // Compra Aprovada - Afiliado
      'purchase-approved-afiliado-all': 'https://webhook.novahagencia.com.br/webhook/86d85a0a-a0cd-4556-86fe-81bbf5f631b6',
      'purchase-approved-afiliado-specific': 'https://webhook.novahagencia.com.br/webhook/11ce4c54-95ec-4083-84b3-270c7770b54e',
      
      // Aguardando Pagamento - Afiliado
      'awaiting-payment-afiliado-all': 'https://webhook.novahagencia.com.br/webhook/ec6b8f37-353e-4b02-8533-f44e37b23a1e',
      'awaiting-payment-afiliado-specific': 'https://webhook.novahagencia.com.br/webhook/3a1b00e5-36f4-497e-869f-e4a178100472',
      
      // Carrinho Abandonado - Produtor
      'cart-abandoned-produtor-all': 'https://webhook.novahagencia.com.br/webhook/b05d12be-3756-480c-b61e-3c6e0d4c7de3',
      'cart-abandoned-produtor-specific': 'https://webhook.novahagencia.com.br/webhook/b1383d4c-9a18-4b23-bc4b-3d52a4a7a7a4',
      
      // Carrinho Abandonado - Afiliado
      'cart-abandoned-afiliado-all': 'https://webhook.novahagencia.com.br/webhook/c88b7dde-0084-43fd-b812-9e7bf754fa0c',
      'cart-abandoned-afiliado-specific': 'https://webhook.novahagencia.com.br/webhook/13d4e1b7-51a0-4528-a9e4-1413d0d90028'
    };

    // Criar a chave baseada nos parâmetros
    const key = `${eventType}-${userRole}-${productScope}`;
    
    console.log('🔗 Gerando webhook URL:', {
      eventType,
      userRole,
      productScope,
      key,
      url: webhookUrls[key]
    });
    
    return webhookUrls[key] || '';
  }
};
