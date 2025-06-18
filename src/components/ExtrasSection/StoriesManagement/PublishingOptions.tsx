
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, Calendar, Play, PauseCircle } from 'lucide-react';

interface StoryData {
  type: string;
  caption: string;
  schedule: boolean;
  scheduleDate: string;
  scheduleTime: string;
  file: File | null;
}

interface PublishingOptionsProps {
  storyData: StoryData;
  isPosting: boolean;
  onStoryDataChange: (data: Partial<StoryData>) => void;
  onPostStory: () => void;
  onScheduleStory: () => void;
}

export const PublishingOptions: React.FC<PublishingOptionsProps> = ({
  storyData,
  isPosting,
  onStoryDataChange,
  onPostStory,
  onScheduleStory,
}) => {
  return (
    <Card className="bg-white data-[theme=dark]:bg-gray-800 border-gray-200 data-[theme=dark]:border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-900 data-[theme=dark]:text-gray-100 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Opções de Publicação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="schedule"
            checked={storyData.schedule}
            onCheckedChange={(checked) => onStoryDataChange({ schedule: !!checked })}
          />
          <Label htmlFor="schedule" className="text-gray-700 data-[theme=dark]:text-gray-300 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Agendar Story
          </Label>
        </div>

        {storyData.schedule && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 data-[theme=dark]:bg-gray-700/30 border border-gray-200 data-[theme=dark]:border-gray-600 rounded-lg">
            <div>
              <Label className="text-gray-700 data-[theme=dark]:text-gray-300">Data</Label>
              <Input
                type="date"
                value={storyData.scheduleDate}
                onChange={(e) => onStoryDataChange({ scheduleDate: e.target.value })}
                className="bg-white data-[theme=dark]:bg-gray-800 border-gray-300 data-[theme=dark]:border-gray-600 text-gray-900 data-[theme=dark]:text-gray-100"
              />
            </div>
            <div>
              <Label className="text-gray-700 data-[theme=dark]:text-gray-300">Horário</Label>
              <Input
                type="time"
                value={storyData.scheduleTime}
                onChange={(e) => onStoryDataChange({ scheduleTime: e.target.value })}
                className="bg-white data-[theme=dark]:bg-gray-800 border-gray-300 data-[theme=dark]:border-gray-600 text-gray-900 data-[theme=dark]:text-gray-100"
              />
            </div>
          </div>
        )}

        {/* Informação sobre webhook */}
        <div className="p-3 bg-blue-50 data-[theme=dark]:bg-blue-900/20 border border-blue-200 data-[theme=dark]:border-blue-700 rounded-lg">
          <p className="text-sm text-blue-700 data-[theme=dark]:text-blue-300">
            📡 Stories serão enviados via webhook para processamento automático
          </p>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col md:flex-row gap-3 pt-4">
          {!storyData.schedule && (
            <Button 
              onClick={onPostStory} 
              className="btn-primary flex-1"
              disabled={isPosting}
            >
              <Play className="w-4 h-4 mr-2" />
              {isPosting ? 'Enviando via Webhook...' : 'Postar Story Agora'}
            </Button>
          )}
          
          {storyData.schedule && (
            <Button onClick={onScheduleStory} className="btn-primary flex-1" disabled={isPosting}>
              <Calendar className="w-4 h-4 mr-2" />
              {isPosting ? 'Agendando via Webhook...' : 'Agendar Story'}
            </Button>
          )}
          
          <Button variant="outline" className="flex-1 bg-white data-[theme=dark]:bg-gray-800 border-gray-300 data-[theme=dark]:border-gray-600 text-gray-900 data-[theme=dark]:text-gray-100">
            <PauseCircle className="w-4 h-4 mr-2" />
            Salvar Rascunho
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
