export class DataFormatter {
  static formatNotificationForNocoDB(notificationData: any): any {
    console.log('📝 Formatando dados da notificação para NocoDB:', notificationData);
    
    const formatted = {
      'Tipo de Evento': notificationData.eventType,
      'ID da Instância': notificationData.instance,
      'Função do Usuário': notificationData.userRole,
      'Plataforma': notificationData.platform || 'hotmart',
      'Perfil Hotmart': notificationData.profileName,
      'URL do Webhook': notificationData.webhookUrl,
      'Quantidade de Mensagens': notificationData.messages ? notificationData.messages.length : 0,
      'Telefone de Notificação': notificationData.notificationPhone || '',
      'Dados Completos (JSON)': JSON.stringify({
        ...notificationData,
        saved_timestamp: new Date().toISOString()
      }, null, 2),
      // Tentar múltiplas variações do campo de usuário para garantir compatibilidade
      'ID do Usuário': notificationData.userId,
      'UserId': notificationData.userId,
      'user_id': notificationData.userId,
      'UserID': notificationData.userId,
    };

    console.log('✅ Dados formatados com múltiplas variações de ID do usuário:', formatted);
    return formatted;
  }

  static logSavedFields(result: any, originalData: any): void {
    console.log('💾 Campos salvos no NocoDB:');
    console.log('- Tipo de Evento:', originalData['Tipo de Evento']);
    console.log('- ID da Instância:', originalData['ID da Instância']);
    console.log('- Função do Usuário:', originalData['Função do Usuário']);
    console.log('- Plataforma:', originalData['Plataforma']);
    console.log('- Perfil:', originalData['Perfil Hotmart']);
    console.log('- ID do Usuário:', originalData['ID do Usuário']);
    console.log('- Mensagens:', originalData['Quantidade de Mensagens']);
    console.log('- Resultado completo:', result);
  }

  static logUpdatedFields(data: any): void {
    console.log('📝 Campos atualizados no NocoDB:');
    Object.keys(data).forEach(key => {
      if (key !== 'Dados Completos (JSON)') {
        console.log(`- ${key}:`, data[key]);
      }
    });
  }
}
