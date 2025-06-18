
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { minioService } from '@/services/minio';

const WEBHOOK_URL = 'https://webhook.novahagencia.com.br/webhook/9941ecf6-76bf-441b-83a3-1bdadc58eefb';

interface StoryData {
  type: string;
  caption: string;
  schedule: boolean;
  scheduleDate: string;
  scheduleTime: string;
  file: File | null;
}

export const useStoriesWebhook = () => {
  const { toast } = useToast();
  const [isPosting, setIsPosting] = useState(false);

  const sendStoryViaWebhook = async (instanceId: string, fileUrl: string, storyData: StoryData) => {
    try {
      console.log(`📡 Enviando story via webhook para instância ${instanceId}`);
      
      const webhookData = {
        action: 'send_story',
        instance: instanceId,
        data: {
          type: storyData.type,
          fileUrl: fileUrl,
          caption: storyData.caption || '',
          schedule: storyData.schedule,
          scheduleDate: storyData.scheduleDate,
          scheduleTime: storyData.scheduleTime
        },
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
        console.log(`✅ Story enviado com sucesso via webhook para instância ${instanceId}`);
        return true;
      } else {
        const errorText = await response.text();
        console.error(`❌ Erro no webhook para instância ${instanceId}:`, response.status, errorText);
        return false;
      }
    } catch (error) {
      console.error(`💥 Erro ao enviar story via webhook para instância ${instanceId}:`, error);
      return false;
    }
  };

  const uploadFileAndSendStories = async (
    storyData: StoryData,
    selectedInstances: string[],
    isScheduled: boolean = false
  ) => {
    if (!storyData.file) {
      toast({
        title: "Erro",
        description: "Selecione um arquivo para o story",
        variant: "destructive"
      });
      return false;
    }

    if (selectedInstances.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos uma instância",
        variant: "destructive"
      });
      return false;
    }

    if (isScheduled && (!storyData.scheduleDate || !storyData.scheduleTime)) {
      toast({
        title: "Erro",
        description: "Defina data e horário para agendamento",
        variant: "destructive"
      });
      return false;
    }

    setIsPosting(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      // 1. Primeiro, fazer upload do arquivo para MinIO
      console.log('📤 Fazendo upload do arquivo para MinIO...');
      const timestamp = Date.now();
      const fileExtension = storyData.file.name.split('.').pop() || 'jpg';
      const fileName = `stories/${isScheduled ? 'scheduled_' : ''}${timestamp}_story.${fileExtension}`;
      
      const renamedFile = new File([storyData.file], fileName, { 
        type: storyData.file.type 
      });
      
      const fileUrl = await minioService.uploadFile(renamedFile);
      console.log('✅ Arquivo enviado para MinIO:', fileUrl);

      // 2. Enviar para cada instância via webhook
      for (const instanceId of selectedInstances) {
        const success = await sendStoryViaWebhook(instanceId, fileUrl, storyData);
        if (success) {
          successCount++;
        } else {
          errorCount++;
        }
      }

      // 3. Mostrar resultado
      if (successCount > 0 && errorCount === 0) {
        toast({
          title: isScheduled ? "Story Agendado" : "Story Enviado",
          description: isScheduled 
            ? `Story agendado via webhook para ${storyData.scheduleDate} às ${storyData.scheduleTime} em ${successCount} instância(s)`
            : `Story enviado com sucesso para ${successCount} instância(s) via webhook`,
        });
      } else if (successCount > 0 && errorCount > 0) {
        toast({
          title: "Parcialmente Concluído",
          description: `Story enviado para ${successCount} instância(s), falhou em ${errorCount}`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro",
          description: "Falha ao enviar story para todas as instâncias",
          variant: "destructive"
        });
      }

      return successCount > 0;

    } catch (error) {
      console.error('💥 Erro durante o processo:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer upload do arquivo para MinIO",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsPosting(false);
    }
  };

  return {
    isPosting,
    uploadFileAndSendStories,
  };
};
