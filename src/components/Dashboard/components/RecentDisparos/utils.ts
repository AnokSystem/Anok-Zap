
export const getContactsReached = (disparo: any) => {
  // Para status 'concluido', todos os contatos receberam
  if (disparo.status === 'concluido') {
    return disparo.recipientCount;
  }
  
  // Para status 'enviando', usar o sentCount como base para contatos alcançados
  if (disparo.status === 'enviando') {
    // Se há mensagens múltiplas, dividir pelo número aproximado de mensagens por contato
    // Baseado nos dados do console, parece que cada contato recebe todas as mensagens da campanha
    return Math.min(disparo.sentCount || 0, disparo.recipientCount);
  }
  
  // Para 'erro' ou 'cancelado', verificar se há contatos que receberam antes do erro
  if (disparo.status === 'erro' || disparo.status === 'cancelado') {
    return Math.min(disparo.sentCount || 0, disparo.recipientCount);
  }
  
  // Para 'pendente', nenhum contato recebeu ainda
  if (disparo.status === 'pendente') {
    return 0;
  }
  
  // Default: usar sentCount limitado pelo recipientCount
  return Math.min(disparo.sentCount || 0, disparo.recipientCount);
};

export const getProgressPercentage = (disparo: any) => {
  const contactsReached = getContactsReached(disparo);
  const totalContacts = disparo.recipientCount || 1;
  return Math.round((contactsReached / totalContacts) * 100);
};
