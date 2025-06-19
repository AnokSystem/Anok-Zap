
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getPlatformColor = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'hotmart':
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'eduzz':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'monetizze':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

export const getEventTypeColor = (eventType: string) => {
  switch (eventType.toLowerCase()) {
    case 'purchase':
    case 'compra':
      return 'bg-green-500/20 text-green-400';
    case 'subscription':
    case 'assinatura':
      return 'bg-blue-500/20 text-blue-400';
    case 'cancel':
    case 'cancelamento':
      return 'bg-red-500/20 text-red-400';
    case 'refund':
    case 'reembolso':
      return 'bg-yellow-500/20 text-yellow-400';
    default:
      return 'bg-purple-500/20 text-purple-400';
  }
};
