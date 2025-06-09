
export class DataFormatter {
  static formatNotificationForNocoDB(notificationData: any) {
    console.log('🔧 Formatando dados para NocoDB...');
    console.log('📋 Dados originais recebidos:', notificationData);
    
    const data = {
      'Tipo de Evento': notificationData.eventType || '',
      'ID da Instância': notificationData.instance || '',
      'Papel do Usuário': notificationData.userRole || '',
      'Plataforma': notificationData.platform || '',
      'Perfil Hotmart': notificationData.profileName || '',
      'URL do Webhook': notificationData.webhookUrl || '',
      'Contagem de Mensagens': notificationData.messages ? notificationData.messages.length : 0,
      'Telefone de Notificação': notificationData.notificationPhone || '',
      'Dados Completos (JSON)': JSON.stringify({
        eventType: notificationData.eventType,
        instance: notificationData.instance,
        userRole: notificationData.userRole,
        platform: notificationData.platform,
        profileName: notificationData.profileName,
        messages: notificationData.messages || [],
        webhookUrl: notificationData.webhookUrl,
        notificationPhone: notificationData.notificationPhone || '',
        timestamp: notificationData.timestamp || new Date().toISOString(),
        saved_timestamp: new Date().toISOString(),
        ruleId: notificationData.ruleId || null
      }, null, 2)
    };
    
    console.log('🔧 Dados formatados para NocoDB (completos):', data);
    this.logFieldValidation(data);
    
    return data;
  }

  private static logFieldValidation(data: any) {
    console.log('📊 Validação dos campos obrigatórios:');
    console.log('- Tipo de Evento:', data['Tipo de Evento']);
    console.log('- ID da Instância:', data['ID da Instância']);
    console.log('- Papel do Usuário:', data['Papel do Usuário']);
    console.log('- Plataforma:', data['Plataforma']);
    console.log('- Perfil Hotmart:', data['Perfil Hotmart']);
    console.log('- URL do Webhook:', data['URL do Webhook']);
    console.log('- Contagem de Mensagens:', data['Contagem de Mensagens']);
  }

  static logSavedFields(result: any, originalData: any) {
    console.log('🔍 Verificação dos campos salvos:');
    Object.keys(originalData).forEach(key => {
      if (result[key] !== undefined) {
        console.log(`✅ Campo '${key}' salvo com sucesso:`, result[key]);
      } else {
        console.warn(`⚠️ Campo '${key}' pode não ter sido salvo corretamente`);
      }
    });
  }

  static logUpdatedFields(data: any) {
    console.log('🔍 Verificação dos campos atualizados:');
    Object.keys(data).forEach(key => {
      console.log(`✅ Campo '${key}' processado para atualização:`, data[key]);
    });
  }
}
