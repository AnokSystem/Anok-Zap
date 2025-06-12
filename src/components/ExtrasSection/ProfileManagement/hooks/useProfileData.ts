
import { useState, useCallback } from 'react';
import type { ProfileData } from '../types';

export const useProfileData = (selectedInstance: string, toast: any) => {
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    status: '',
    description: '',
    profilePhoto: null,
    profilePhotoUrl: ''
  });

  const loadProfileData = useCallback(async () => {
    if (!selectedInstance) return;
    
    try {
      console.log('🔍 Carregando dados do perfil para instância:', selectedInstance);
      
      const response = await fetch(`https://api.novahagencia.com.br/instance/fetchInstances`, {
        headers: {
          'apikey': '26bda82495a95caeae71f96534841285',
        },
      });

      if (response.ok) {
        const allInstances = await response.json();
        console.log('📡 Instâncias da API:', allInstances);
        
        const currentInstance = allInstances.find((inst: any) => 
          inst.name === selectedInstance || inst.id === selectedInstance
        );
        
        if (currentInstance) {
          console.log('✅ Instância encontrada via API:', currentInstance);
          console.log('📷 URL da foto do perfil:', currentInstance.profilePicUrl);
          
          setProfileData({
            name: currentInstance.profileName || '',
            status: '',
            description: '',
            profilePhoto: null,
            profilePhotoUrl: currentInstance.profilePicUrl || ''
          });

          toast({
            title: "Dados Carregados",
            description: `Dados do perfil carregados com sucesso${currentInstance.profilePicUrl ? ' (com foto)' : ' (sem foto)'}`,
          });
        } else {
          console.log('⚠️ Instância não encontrada');
          // Limpar dados quando instância não for encontrada
          setProfileData({
            name: '',
            status: '',
            description: '',
            profilePhoto: null,
            profilePhotoUrl: ''
          });
          
          toast({
            title: "Aviso",
            description: "Instância não encontrada ou desconectada",
            variant: "destructive"
          });
        }
      } else {
        console.error('❌ Erro na resposta da API:', response.status);
        throw new Error(`Erro na API: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados do perfil:', error);
      
      // Limpar dados em caso de erro
      setProfileData({
        name: '',
        status: '',
        description: '',
        profilePhoto: null,
        profilePhotoUrl: ''
      });
      
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do perfil",
        variant: "destructive"
      });
    }
  }, [selectedInstance, toast]);

  return {
    profileData,
    setProfileData,
    loadProfileData
  };
};
