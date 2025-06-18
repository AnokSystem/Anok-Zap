
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

  const sendStoryViaWebhook = async (instances: string[], fileUrl: string, storyData: StoryData) => {
    try {
      console.log(`📡 Enviando story via webhook para ${instances.length} instâncias:`, instances);
      
      const webhookData = {
        action: 'send_story',
        instances: instances, // Enviando array de instâncias
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

      console.log(`📤 Dados do webhook:`, JSON.stringify(webhookData, null, 2));

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
      });

      const responseText = await response.text();
      console.log(`📥 Resposta do webhook (${response.status}):`, responseText);

      if (response.ok) {
        console.log(`✅ Story enviado com sucesso via webhook para ${instances.length} instâncias`);
        return true;
      } else {
        console.error(`❌ Erro no webhook:`, response.status, responseText);
        return false;
      }
    } catch (error) {
      console.error(`💥 Erro ao enviar story via webhook:`, error);
      return false;
    }
  };

  const uploadFileAndSendStories = async (
    storyData: StoryData,
    selectedInstances: string[],
    isScheduled: boolean = false
  ) => {
    console.log(`🚀 Iniciando envio de story para ${selectedInstances.length} instâncias:`, selectedInstances);

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

      // 2. Enviar para todas as instâncias em uma única chamada do webhook
      console.log(`🔄 Enviando para ${selectedInstances.length} instâncias via webhook...`);
      
      const success = await sendStoryViaWebhook(selectedInstances, fileUrl, storyData);

      // 3. Mostrar resultado
      if (success) {
        toast({
          title: isScheduled ? "Story Agendado" : "Story Enviado",
          description: isScheduled 
            ? `Story agendado via webhook para ${storyData.scheduleDate} às ${storyData.scheduleTime} em ${selectedInstances.length} instância(s)`
            : `Story enviado com sucesso para ${selectedInstances.length} instância(s) via webhook`,
        });
      } else {
        toast({
          title: "Erro",
          description: "Falha ao enviar story via webhook",
          variant: "destructive"
        });
      }

      return success;

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
