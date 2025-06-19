

export const filterDisparosByUser = (data: any[], userId: string, clientId: string) => {
  return data.filter(item => {
    // Usar o campo exato "Cliente ID" conforme estrutura da tabela
    const recordClientId = item['Cliente ID'];
    
    // Log para debug dos campos encontrados
    console.log('🔍 Verificando registro:', {
      recordId: item.ID,
      recordClientId,
      currentUserId: userId,
      currentClientId: clientId,
      allFields: Object.keys(item)
    });
    
    // Verificar se o registro pertence ao usuário atual
    // Como agora salvamos pelo ID do cliente, verificamos diretamente
    const belongsToUser = recordClientId === userId || recordClientId === clientId;
    
    // Log do resultado da filtragem
    console.log('📋 Resultado da filtragem:', {
      recordId: item.ID,
      belongsToUser,
      reason: belongsToUser ? 'INCLUÍDO' : 'EXCLUÍDO',
      matchedField: recordClientId === userId ? 'userId' : recordClientId === clientId ? 'clientId' : 'nenhum'
    });
    
    return belongsToUser;
  });
};

