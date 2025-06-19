
export const mapStatus = (status: string): 'enviado' | 'pendente' | 'erro' | 'enviando' | 'concluido' | 'cancelado' => {
  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case 'concluido':
    case 'finalizado':
    case 'completed':
    case 'complete':
      return 'concluido';
    case 'iniciado':
    case 'enviando':
    case 'sending':
    case 'em_andamento':
      return 'enviando';
    case 'erro':
    case 'falha':
    case 'error':
    case 'failed':
      return 'erro';
    case 'cancelado':
    case 'cancelled':
    case 'canceled':
      return 'cancelado';
    case 'enviado':
    case 'sent':
      return 'enviado';
    default:
      return 'pendente';
  }
};
