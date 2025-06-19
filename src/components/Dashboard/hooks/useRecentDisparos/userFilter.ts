
export const filterDisparosByUser = (data: any[], userId: string, clientId: string) => {
  return data.filter(item => {
    // Check multiple possible user identification fields
    const recordUserId = item.user_id || item.User_id || item.userId;
    const recordClientId = item['Cliente ID'] || item.client_id || item.Client_id || item.clientId;
    const recordAccountId = item.account_id || item.Account_id || item.accountId;
    const recordOwnerId = item.owner_id || item.Owner_id || item.ownerId;
    
    // Only show records that explicitly belong to the current user
    const belongsToUser = 
      recordUserId === userId || 
      recordUserId === clientId ||
      recordClientId === userId || 
      recordClientId === clientId ||
      recordAccountId === userId ||
      recordAccountId === clientId ||
      recordOwnerId === userId ||
      recordOwnerId === clientId;
    
    // Log filtered records for debugging
    if (!belongsToUser && (recordUserId || recordClientId || recordAccountId || recordOwnerId)) {
      console.log('🚫 Registro filtrado - não pertence ao usuário:', {
        recordUserId,
        recordClientId,
        recordAccountId,
        recordOwnerId,
        currentUserId: userId,
        currentClientId: clientId
      });
    }
    
    return belongsToUser;
  });
};
