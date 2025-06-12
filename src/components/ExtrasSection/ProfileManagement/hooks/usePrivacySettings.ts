
import { useState, useCallback } from 'react';
import type { PrivacySettingsType } from '../types';

const WEBHOOK_URL = 'https://webhook.novahagencia.com.br/webhook/307e0a28-8c14-4fdd-8d64-45c54ac6a247';

export const usePrivacySettings = (selectedInstance: string, toast: any) => {
  const [privacySettings, setPrivacySettings] = useState<PrivacySettingsType>({
    readreceipts: 'all',
    profile: 'all',
    status: 'all',
    online: 'all',
    last: 'all',
    groupadd: 'all'
  });
  const [isLoadingPrivacy, setIsLoadingPrivacy] = useState(false);

  const loadPrivacySettings = useCallback(async () => {
    if (!selectedInstance) return;
    
    setIsLoadingPrivacy(true);
    try {
      console.log('🔒 Carregando configurações de privacidade via webhook para:', selectedInstance);
      
      const webhookData = {
        action: 'fetch_privacy_settings',
        instance: selectedInstance,
        timestamp: new Date().toISOString()
      };

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Configurações de privacidade carregadas via webhook:', result);
        
        if (result.privacySettings) {
          setPrivacySettings({
            readreceipts: result.privacySettings.readreceipts || 'all',
            profile: result.privacySettings.profile || 'all',
            status: result.privacySettings.status || 'all',
            online: result.privacySettings.online || 'all',
            last: result.privacySettings.last || 'all',
            groupadd: result.privacySettings.groupadd || 'all'
          });

          toast({
            title: "Configurações Carregadas",
            description: "Configurações de privacidade carregadas com sucesso",
          });
        }
      } else {
        console.error('❌ Erro ao carregar configurações de privacidade via webhook');
        toast({
          title: "Erro",
          description: "Erro ao carregar configurações de privacidade",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Erro ao carregar configurações de privacidade via webhook:', error);
      toast({
        title: "Erro",
        description: "Erro de conexão ao carregar configurações de privacidade",
        variant: "destructive"
      });
    } finally {
      setIsLoadingPrivacy(false);
    }
  }, [selectedInstance, toast]);

  return {
    privacySettings,
    setPrivacySettings,
    isLoadingPrivacy,
    loadPrivacySettings
  };
};
