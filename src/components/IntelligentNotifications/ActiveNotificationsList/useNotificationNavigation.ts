
import { useNavigate } from 'react-router-dom';

export const useNotificationNavigation = () => {
  const navigate = useNavigate();

  const handleViewDetails = (rule: any) => {
    console.log('👁️ Preparando para visualizar detalhes da notificação:', rule);
    
    // Garantir que a notificação tenha o formato correto
    const formattedNotification = {
      ID: rule.ID || rule.id,
      'Tipo de Evento': rule['Tipo de Evento'],
      'ID da Instância': rule['ID da Instância'], 
      'Perfil Hotmart': rule['Perfil Hotmart'],
      'URL do Webhook': rule['URL do Webhook'],
      'CreatedAt': rule['CreatedAt'] || rule.createdAt || new Date().toISOString(),
      'Dados Completos (JSON)': rule['Dados Completos (JSON)'],
      'Plataforma': rule['Plataforma'],
      'Função do Usuário': rule['Função do Usuário']
    };

    console.log('📋 Notificação formatada para visualização:', formattedNotification);
    
    // Salvar os dados da notificação no sessionStorage para visualização automática
    sessionStorage.setItem('autoOpenNotification', JSON.stringify(formattedNotification));
    
    console.log('🔄 Navegando para página de notificações...');
    navigate('/notifications');
  };

  return { handleViewDetails };
};
