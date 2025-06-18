
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Image, Video, Clock, Upload, Calendar, Smartphone, Play, PauseCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { evolutionApiService } from '@/services/evolutionApi';
import { minioService } from '@/services/minio';

const WEBHOOK_URL = 'https://webhook.novahagencia.com.br/webhook/9941ecf6-76bf-441b-83a3-1bdadc58eefb';

const StoriesManagement = () => {
  const { toast } = useToast();
  const [instances, setInstances] = useState<any[]>([]);
  const [selectedInstances, setSelectedInstances] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [storyData, setStoryData] = useState({
    type: 'image',
    caption: '',
    schedule: false,
    scheduleDate: '',
    scheduleTime: '',
    file: null as File | null
  });

  useEffect(() => {
    loadInstances();
  }, []);

  const loadInstances = async () => {
    try {
      const instanceList = await evolutionApiService.getInstances();
      setInstances(instanceList);
    } catch (error) {
      console.error('Erro ao carregar instâncias:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setStoryData({ ...storyData, file });
    }
  };

  const handleInstanceToggle = (instanceId: string) => {
    setSelectedInstances(prev => 
      prev.includes(instanceId)
        ? prev.filter(id => id !== instanceId)
        : [...prev, instanceId]
    );
  };

  const sendStoryViaWebhook = async (instanceId: string, fileUrl: string) => {
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

  const handlePostStory = async () => {
    if (!storyData.file) {
      toast({
        title: "Erro",
        description: "Selecione um arquivo para o story",
        variant: "destructive"
      });
      return;
    }

    if (selectedInstances.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos uma instância",
        variant: "destructive"
      });
      return;
    }

    setIsPosting(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      // 1. Primeiro, fazer upload do arquivo para MinIO
      console.log('📤 Fazendo upload do arquivo para MinIO...');
      const timestamp = Date.now();
      const fileExtension = storyData.file.name.split('.').pop() || 'jpg';
      const fileName = `stories/${timestamp}_story.${fileExtension}`;
      
      const renamedFile = new File([storyData.file], fileName, { 
        type: storyData.file.type 
      });
      
      const fileUrl = await minioService.uploadFile(renamedFile);
      console.log('✅ Arquivo enviado para MinIO:', fileUrl);

      // 2. Enviar para cada instância via webhook
      for (const instanceId of selectedInstances) {
        const success = await sendStoryViaWebhook(instanceId, fileUrl);
        if (success) {
          successCount++;
        } else {
          errorCount++;
        }
      }

    } catch (error) {
      console.error('💥 Erro durante o processo:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer upload do arquivo para MinIO",
        variant: "destructive"
      });
      setIsPosting(false);
      return;
    }

    setIsPosting(false);

    if (successCount > 0 && errorCount === 0) {
      toast({
        title: "Story Enviado",
        description: `Story enviado com sucesso para ${successCount} instância(s) via webhook`,
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

    // Limpar o formulário após postar
    setStoryData({
      type: 'image',
      caption: '',
      schedule: false,
      scheduleDate: '',
      scheduleTime: '',
      file: null
    });
    setSelectedInstances([]);
  };

  const handleScheduleStory = async () => {
    if (!storyData.file) {
      toast({
        title: "Erro",
        description: "Selecione um arquivo para o story",
        variant: "destructive"
      });
      return;
    }

    if (selectedInstances.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos uma instância",
        variant: "destructive"
      });
      return;
    }

    if (!storyData.scheduleDate || !storyData.scheduleTime) {
      toast({
        title: "Erro",
        description: "Defina data e horário para agendamento",
        variant: "destructive"
      });
      return;
    }

    setIsPosting(true);

    try {
      // 1. Upload do arquivo para MinIO
      console.log('📤 Fazendo upload do arquivo para MinIO...');
      const timestamp = Date.now();
      const fileExtension = storyData.file.name.split('.').pop() || 'jpg';
      const fileName = `stories/scheduled_${timestamp}_story.${fileExtension}`;
      
      const renamedFile = new File([storyData.file], fileName, { 
        type: storyData.file.type 
      });
      
      const fileUrl = await minioService.uploadFile(renamedFile);
      console.log('✅ Arquivo enviado para MinIO:', fileUrl);

      // 2. Enviar agendamento via webhook
      let successCount = 0;
      for (const instanceId of selectedInstances) {
        const success = await sendStoryViaWebhook(instanceId, fileUrl);
        if (success) {
          successCount++;
        }
      }

      if (successCount > 0) {
        toast({
          title: "Story Agendado",
          description: `Story agendado via webhook para ${storyData.scheduleDate} às ${storyData.scheduleTime} em ${successCount} instância(s)`,
        });
        
        // Limpar formulário
        setStoryData({
          type: 'image',
          caption: '',
          schedule: false,
          scheduleDate: '',
          scheduleTime: '',
          file: null
        });
        setSelectedInstances([]);
      }

    } catch (error) {
      console.error('💥 Erro ao agendar story:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer upload do arquivo para agendamento",
        variant: "destructive"
      });
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Seleção de Instâncias */}
      <Card className="border-gray-200 bg-white data-[theme=light]:border-gray-200 data-[theme=light]:bg-white data-[theme=dark]:border-gray-600/50 data-[theme=dark]:bg-gray-800/30">
        <CardHeader>
          <CardTitle className="text-primary-contrast flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Selecionar Instâncias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {instances.map((instance) => (
              <div key={instance.id} className="flex items-center space-x-2 p-3 bg-white border border-gray-200 rounded-lg data-[theme=light]:bg-white data-[theme=light]:border-gray-200 data-[theme=dark]:bg-gray-700/30 data-[theme=dark]:border-gray-600">
                <Checkbox
                  id={instance.id}
                  checked={selectedInstances.includes(instance.id)}
                  onCheckedChange={() => handleInstanceToggle(instance.id)}
                />
                <Label htmlFor={instance.id} className="text-gray-700 flex-1 cursor-pointer data-[theme=light]:text-gray-700 data-[theme=dark]:text-gray-300">
                  {instance.name}
                  <span className={`ml-2 text-xs px-2 py-1 rounded ${
                    instance.status === 'conectado' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {instance.status}
                  </span>
                </Label>
              </div>
            ))}
          </div>
          {selectedInstances.length > 0 && (
            <div className="mt-3 p-2 bg-purple-50 border border-purple-200 rounded data-[theme=light]:bg-purple-50 data-[theme=light]:border-purple-200 data-[theme=dark]:bg-purple-accent/10 data-[theme=dark]:border-purple-accent/20">
              <p className="text-sm text-purple-700 data-[theme=light]:text-purple-700 data-[theme=dark]:text-purple-300">
                {selectedInstances.length} instância(s) selecionada(s)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuração do Story */}
      <Card className="border-gray-200 bg-white data-[theme=light]:border-gray-200 data-[theme=light]:bg-white data-[theme=dark]:border-gray-600/50 data-[theme=dark]:bg-gray-800/30">
        <CardHeader>
          <CardTitle className="text-primary-contrast flex items-center gap-2">
            <Image className="w-5 h-5" />
            Configuração do Story
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-700 data-[theme=light]:text-gray-700 data-[theme=dark]:text-gray-300">Tipo de Story</Label>
              <Select value={storyData.type} onValueChange={(value) => setStoryData({ ...storyData, type: value })}>
                <SelectTrigger className="bg-white border-gray-300 data-[theme=light]:bg-white data-[theme=light]:border-gray-300 data-[theme=dark]:bg-gray-800 data-[theme=dark]:border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">
                    <div className="flex items-center gap-2">
                      <Image className="w-4 h-4" />
                      Imagem
                    </div>
                  </SelectItem>
                  <SelectItem value="video">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      Vídeo
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-700 data-[theme=light]:text-gray-700 data-[theme=dark]:text-gray-300">Arquivo</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept={storyData.type === 'image' ? 'image/*' : 'video/*'}
                  onChange={handleFileChange}
                  className="bg-white border-gray-300 data-[theme=light]:bg-white data-[theme=light]:border-gray-300 data-[theme=dark]:bg-gray-800 data-[theme=dark]:border-gray-600"
                />
                <Upload className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>

          <div>
            <Label className="text-gray-700 data-[theme=light]:text-gray-700 data-[theme=dark]:text-gray-300">Legenda (Opcional)</Label>
            <Textarea
              value={storyData.caption}
              onChange={(e) => setStoryData({ ...storyData, caption: e.target.value })}
              placeholder="Digite uma legenda para o story..."
              className="bg-white border-gray-300 text-gray-700 data-[theme=light]:bg-white data-[theme=light]:border-gray-300 data-[theme=light]:text-gray-700 data-[theme=dark]:bg-gray-800 data-[theme=dark]:border-gray-600 data-[theme=dark]:text-gray-200"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Agendamento */}
      <Card className="border-gray-200 bg-white data-[theme=light]:border-gray-200 data-[theme=light]:bg-white data-[theme=dark]:border-gray-600/50 data-[theme=dark]:bg-gray-800/30">
        <CardHeader>
          <CardTitle className="text-primary-contrast flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Opções de Publicação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="schedule"
              checked={storyData.schedule}
              onCheckedChange={(checked) => setStoryData({ ...storyData, schedule: !!checked })}
            />
            <Label htmlFor="schedule" className="text-gray-700 flex items-center gap-2 data-[theme=light]:text-gray-700 data-[theme=dark]:text-gray-300">
              <Calendar className="w-4 h-4" />
              Agendar Story
            </Label>
          </div>

          {storyData.schedule && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 border border-gray-200 rounded-lg data-[theme=light]:bg-gray-50 data-[theme=light]:border-gray-200 data-[theme=dark]:bg-gray-700/30 data-[theme=dark]:border-gray-600">
              <div>
                <Label className="text-gray-700 data-[theme=light]:text-gray-700 data-[theme=dark]:text-gray-300">Data</Label>
                <Input
                  type="date"
                  value={storyData.scheduleDate}
                  onChange={(e) => setStoryData({ ...storyData, scheduleDate: e.target.value })}
                  className="bg-white border-gray-300 data-[theme=light]:bg-white data-[theme=light]:border-gray-300 data-[theme=dark]:bg-gray-800 data-[theme=dark]:border-gray-600"
                />
              </div>
              <div>
                <Label className="text-gray-700 data-[theme=light]:text-gray-700 data-[theme=dark]:text-gray-300">Horário</Label>
                <Input
                  type="time"
                  value={storyData.scheduleTime}
                  onChange={(e) => setStoryData({ ...storyData, scheduleTime: e.target.value })}
                  className="bg-white border-gray-300 data-[theme=light]:bg-white data-[theme=light]:border-gray-300 data-[theme=dark]:bg-gray-800 data-[theme=dark]:border-gray-600"
                />
              </div>
            </div>
          )}

          {/* Informação sobre webhook */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg data-[theme=dark]:bg-blue-accent/10 data-[theme=dark]:border-blue-accent/20">
            <p className="text-sm text-blue-700 data-[theme=dark]:text-blue-300">
              📡 Stories serão enviados via webhook para processamento automático
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col md:flex-row gap-3 pt-4">
            {!storyData.schedule && (
              <Button 
                onClick={handlePostStory} 
                className="btn-primary flex-1"
                disabled={isPosting}
              >
                <Play className="w-4 h-4 mr-2" />
                {isPosting ? 'Enviando via Webhook...' : 'Postar Story Agora'}
              </Button>
            )}
            
            {storyData.schedule && (
              <Button onClick={handleScheduleStory} className="btn-primary flex-1" disabled={isPosting}>
                <Calendar className="w-4 h-4 mr-2" />
                {isPosting ? 'Agendando via Webhook...' : 'Agendar Story'}
              </Button>
            )}
            
            <Button variant="outline" className="flex-1 bg-white border-gray-300 data-[theme=light]:bg-white data-[theme=light]:border-gray-300 data-[theme=dark]:bg-gray-800 data-[theme=dark]:border-gray-600">
              <PauseCircle className="w-4 h-4 mr-2" />
              Salvar Rascunho
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StoriesManagement;
