
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image, Video, Clock, Upload, Calendar } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const StoriesManagement = () => {
  const { toast } = useToast();
  const [storyData, setStoryData] = useState({
    type: 'image',
    caption: '',
    schedule: false,
    scheduleDate: '',
    scheduleTime: '',
    file: null as File | null
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setStoryData({ ...storyData, file });
    }
  };

  const handlePost = () => {
    if (!storyData.file) {
      toast({
        title: "Erro",
        description: "Selecione um arquivo para o story",
        variant: "destructive"
      });
      return;
    }

    if (storyData.schedule) {
      toast({
        title: "Story Agendado",
        description: `Story agendado para ${storyData.scheduleDate} às ${storyData.scheduleTime}`,
      });
    } else {
      toast({
        title: "Story Postado",
        description: "Story postado com sucesso!",
      });
    }
  };

  return (
    <Card className="border-gray-600/50 bg-gray-800/30">
      <CardHeader>
        <CardTitle className="text-primary-contrast flex items-center gap-2">
          <Image className="w-5 h-5" />
          Gerenciamento de Stories
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

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="schedule"
            checked={storyData.schedule}
            onChange={(e) => setStoryData({ ...storyData, schedule: e.target.checked })}
            className="rounded"
          />
          <Label htmlFor="schedule" className="text-gray-300 flex items-center gap-2">
            <Clock className="w-4 h-4" />
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

        <Button onClick={handlePost} className="btn-primary w-full">
          {storyData.schedule ? (
            <>
              <Calendar className="w-4 h-4 mr-2" />
              Agendar Story
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Postar Story Agora
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default StoriesManagement;
