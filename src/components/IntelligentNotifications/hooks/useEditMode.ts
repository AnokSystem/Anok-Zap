
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { NotificationRule } from '../types';

export const useEditMode = (
  setNewRule: (rule: Partial<NotificationRule> | ((prev: Partial<NotificationRule>) => Partial<NotificationRule>)) => void,
  resetForm: () => void
) => {
  const { toast } = useToast();
  const [editingRule, setEditingRule] = useState<any>(null);

  // Listen for edit events
  useEffect(() => {
    const handleLoadEditNotification = (event: CustomEvent) => {
      const notification = event.detail;
      console.log('📝 Evento de edição recebido:', notification);
      handleEditRule(notification);
    };

    window.addEventListener('loadEditNotification', handleLoadEditNotification);
    return () => window.removeEventListener('loadEditNotification', handleLoadEditNotification);
  }, []);

  const handleEditRule = (rule: any) => {
    try {
      console.log('📝 Iniciando edição da regra:', rule);
      
      // Parse dos dados JSON para preencher o formulário
      let parsedData: any = {};
      
      if (rule['Dados Completos (JSON)']) {
        try {
          parsedData = JSON.parse(rule['Dados Completos (JSON)']);
          console.log('✅ Dados JSON parseados:', parsedData);
        } catch (e) {
          console.error('❌ Erro ao fazer parse do JSON:', e);
          parsedData = {};
        }
      }
      
      const editRule = {
        eventType: parsedData.eventType || rule['Tipo de Evento'] || '',
        userRole: parsedData.userRole || rule['Função do Usuário'] || rule['Papel do Usuário'] || '',
        platform: parsedData.platform || rule['Plataforma'] || '',
        profileName: parsedData.profileName || rule['Perfil Hotmart'] || '',
        instanceId: parsedData.instance || rule['ID da Instância'] || '',
        messages: parsedData.messages || [{ id: '1', type: 'text', content: '', delay: 0 }],
      };
      
      console.log('📋 Dados carregados para edição:', editRule);
      
      setNewRule(editRule);
      setEditingRule(rule);
      
      toast({
        title: "Modo de Edição Ativado",
        description: "Regra carregada para edição. Modifique os campos e clique em 'Atualizar Notificação'.",
      });
    } catch (error) {
      console.error('❌ Erro ao editar regra:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados da regra para edição",
        variant: "destructive",
      });
    }
  };

  const cancelEdit = () => {
    console.log('❌ Cancelando edição');
    setEditingRule(null);
    resetForm();
    
    toast({
      title: "Edição Cancelada",
      description: "Formulário limpo e pronto para nova notificação",
    });
  };

  return {
    editingRule,
    handleEditRule,
    cancelEdit,
  };
};
