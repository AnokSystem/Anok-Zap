
export const filterDisparosByUser = (data: any[], userId: string, clientId: string) => {
  return data.filter(item => {
    // Usar os nomes exatos dos campos conforme a estrutura da tabela
    const recordUserId = item.user_id || item.User_id || item.userId;
    const recordClientId = item['Cliente ID'] || item.client_id || item.Client_id || item.clientId;
    const recordAccountId = item.account_id || item.Account_id || item.accountId;
    const recordOwnerId = item.owner_id || item.Owner_id || item.ownerId;
    
    // Log para debug dos campos encontrados
    console.log('🔍 Verificando registro:', {
      recordId: item.ID,
      recordClientId,
      recordUserId,
      currentUserId: userId,
      currentClientId: clientId,
      allFields: Object.keys(item)
    });
    
    // Verificar se o registro pertence ao usuário atual
    const belongsToUser = 
      recordUserId === userId || 
      recordUserId === clientId ||
      recordClientId === userId || 
      recordClientId === clientId ||
      recordAccountId === userId ||
      recordAccountId === clientId ||
      recordOwnerId === userId ||
      recordOwnerId === clientId;
    
    // Log do resultado da filtragem
    console.log('📋 Resultado da filtragem:', {
      recordId: item.ID,
      belongsToUser,
      reason: belongsToUser ? 'INCLUÍDO' : 'EXCLUÍDO'
    });
    
    return belongsToUser;
  });
};
