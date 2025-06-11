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

  const postStoryToInstance = async (instanceId: string) => {
    if (!storyData.file) return false;

    try {
      const formData = new FormData();
      formData.append('statusMessage', storyData.file);
      if (storyData.caption) {
        formData.append('content', storyData.caption);
      }

      console.log(`Postando story na instância ${instanceId}`);
      
      // Endpoint correto para stories na Evolution API
      const response = await fetch(`https://api.novahagencia.com.br/message/sendStatus/${instanceId}`, {
        method: 'POST',
        headers: {
          'apikey': '26bda82495a95caeae71f96534841285',
        },
        body: formData,
      });

      if (response.ok) {
        console.log(`Story postado com sucesso na instância ${instanceId}`);
        return true;
      } else {
        const errorText = await response.text();
        console.error(`Erro ao postar story na instância ${instanceId}:`, response.status, errorText);
        return false;
      }
    } catch (error) {
      console.error(`Erro ao postar story na instância ${instanceId}:`, error);
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

    for (const instanceId of selectedInstances) {
      const success = await postStoryToInstance(instanceId);
      if (success) {
        successCount++;
      } else {
        errorCount++;
      }
    }

    setIsPosting(false);

    if (successCount > 0 && errorCount === 0) {
      toast({
        title: "Story Postado",
        description: `Story postado com sucesso em ${successCount} instância(s)`,
      });
    } else if (successCount > 0 && errorCount > 0) {
      toast({
        title: "Parcialmente Concluído",
        description: `Story postado em ${successCount} instância(s), falhou em ${errorCount}`,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Erro",
        description: "Falha ao postar story em todas as instâncias",
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

  const handleScheduleStory = () => {
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

    // Implementar lógica de agendamento aqui
    toast({
      title: "Story Agendado",
      description: `Story agendado para ${storyData.scheduleDate} às ${storyData.scheduleTime} em ${selectedInstances.length} instância(s)`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Seleção de Instâncias */}
      <Card className="border-gray-600/50 bg-gray-800/30">
        <CardHeader>
          <CardTitle className="text-primary-contrast flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Selecionar Instâncias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {instances.map((instance) => (
              <div key={instance.id} className="flex items-center space-x-2 p-3 bg-gray-700/30 rounded-lg">
                <Checkbox
                  id={instance.id}
                  checked={selectedInstances.includes(instance.id)}
                  onCheckedChange={() => handleInstanceToggle(instance.id)}
                />
                <Label htmlFor={instance.id} className="text-gray-300 flex-1 cursor-pointer">
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
            <div className="mt-3 p-2 bg-purple-accent/10 rounded border border-purple-accent/20">
              <p className="text-sm text-purple-300">
                {selectedInstances.length} instância(s) selecionada(s)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuração do Story */}
      <Card className="border-gray-600/50 bg-gray-800/30">
        <CardHeader>
          <CardTitle className="text-primary-contrast flex items-center gap-2">
            <Image className="w-5 h-5" />
            Configuração do Story
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Tipo de Story</Label>
              <Select value={storyData.type} onValueChange={(value) => setStoryData({ ...storyData, type: value })}>
                <SelectTrigger className="bg-gray-800 border-gray-600">
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
              <Label className="text-gray-300">Arquivo</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept={storyData.type === 'image' ? 'image/*' : 'video/*'}
                  onChange={handleFileChange}
                  className="bg-gray-800 border-gray-600"
                />
                <Upload className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>

          <div>
            <Label className="text-gray-300">Legenda (Opcional)</Label>
            <Textarea
              value={storyData.caption}
              onChange={(e) => setStoryData({ ...storyData, caption: e.target.value })}
              placeholder="Digite uma legenda para o story..."
              className="bg-gray-800 border-gray-600 text-gray-200"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Agendamento */}
      <Card className="border-gray-600/50 bg-gray-800/30">
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
            <Label htmlFor="schedule" className="text-gray-300 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Agendar Story
            </Label>
          </div>

          {storyData.schedule && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-700/30 rounded-lg">
              <div>
                <Label className="text-gray-300">Data</Label>
                <Input
                  type="date"
                  value={storyData.scheduleDate}
                  onChange={(e) => setStoryData({ ...storyData, scheduleDate: e.target.value })}
                  className="bg-gray-800 border-gray-600"
                />
              </div>
              <div>
                <Label className="text-gray-300">Horário</Label>
                <Input
                  type="time"
                  value={storyData.scheduleTime}
                  onChange={(e) => setStoryData({ ...storyData, scheduleTime: e.target.value })}
                  className="bg-gray-800 border-gray-600"
                />
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex flex-col md:flex-row gap-3 pt-4">
            {!storyData.schedule && (
              <Button 
                onClick={handlePostStory} 
                className="btn-primary flex-1"
                disabled={isPosting}
              >
                <Play className="w-4 h-4 mr-2" />
                {isPosting ? 'Postando...' : 'Postar Story Agora'}
              </Button>
            )}
            
            {storyData.schedule && (
              <Button onClick={handleScheduleStory} className="btn-primary flex-1">
                <Calendar className="w-4 h-4 mr-2" />
                Agendar Story
              </Button>
            )}
            
            <Button variant="outline" className="flex-1 bg-gray-800 border-gray-600">
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
