
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Image, Video, Upload } from 'lucide-react';

interface StoryData {
  type: string;
  caption: string;
  schedule: boolean;
  scheduleDate: string;
  scheduleTime: string;
  file: File | null;
}

interface StoryConfigFormProps {
  storyData: StoryData;
  onStoryDataChange: (data: Partial<StoryData>) => void;
  onFileChange: (file: File | null) => void;
}

export const StoryConfigForm: React.FC<StoryConfigFormProps> = ({
  storyData,
  onStoryDataChange,
  onFileChange,
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    onFileChange(file || null);
  };

  return (
    <Card className="bg-gray-900 data-[theme=light]:bg-white data-[theme=dark]:bg-gray-900 border-gray-700 data-[theme=light]:border-gray-200 data-[theme=dark]:border-gray-700">
      <CardHeader>
        <CardTitle className="text-white data-[theme=light]:text-gray-900 data-[theme=dark]:text-white flex items-center gap-2">
          <Image className="w-5 h-5" />
          Configuração do Story
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-gray-200 data-[theme=light]:text-gray-700 data-[theme=dark]:text-gray-200">Tipo de Story</Label>
            <Select 
              value={storyData.type} 
              onValueChange={(value) => onStoryDataChange({ type: value })}
            >
              <SelectTrigger className="bg-gray-800 data-[theme=light]:bg-white data-[theme=dark]:bg-gray-800 border-gray-600 data-[theme=light]:border-gray-300 data-[theme=dark]:border-gray-600 text-gray-100 data-[theme=light]:text-gray-900 data-[theme=dark]:text-gray-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 data-[theme=light]:bg-white data-[theme=dark]:bg-gray-800 border-gray-600 data-[theme=light]:border-gray-300 data-[theme=dark]:border-gray-600">
                <SelectItem value="image" className="text-gray-100 data-[theme=light]:text-gray-900 data-[theme=dark]:text-gray-100 focus:bg-gray-700 data-[theme=light]:focus:bg-gray-100 data-[theme=dark]:focus:bg-gray-700">
                  <div className="flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    Imagem
                  </div>
                </SelectItem>
                <SelectItem value="video" className="text-gray-100 data-[theme=light]:text-gray-900 data-[theme=dark]:text-gray-100 focus:bg-gray-700 data-[theme=light]:focus:bg-gray-100 data-[theme=dark]:focus:bg-gray-700">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    Vídeo
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-gray-200 data-[theme=light]:text-gray-700 data-[theme=dark]:text-gray-200">Arquivo</Label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept={storyData.type === 'image' ? 'image/*' : 'video/*'}
                onChange={handleFileChange}
                className="bg-gray-800 data-[theme=light]:bg-white data-[theme=dark]:bg-gray-800 border-gray-600 data-[theme=light]:border-gray-300 data-[theme=dark]:border-gray-600 text-gray-100 data-[theme=light]:text-gray-900 data-[theme=dark]:text-gray-100 placeholder:text-gray-400 data-[theme=light]:placeholder:text-gray-400 data-[theme=dark]:placeholder:text-gray-500"
              />
              <Upload className="w-4 h-4 text-gray-400 data-[theme=light]:text-gray-400 data-[theme=dark]:text-gray-500" />
            </div>
          </div>
        </div>

        <div>
          <Label className="text-gray-200 data-[theme=light]:text-gray-700 data-[theme=dark]:text-gray-200">Legenda (Opcional)</Label>
          <Textarea
            value={storyData.caption}
            onChange={(e) => onStoryDataChange({ caption: e.target.value })}
            placeholder="Digite uma legenda para o story..."
            className="bg-gray-800 data-[theme=light]:bg-white data-[theme=dark]:bg-gray-800 border-gray-600 data-[theme=light]:border-gray-300 data-[theme=dark]:border-gray-600 text-gray-100 data-[theme=light]:text-gray-700 data-[theme=dark]:text-gray-100 placeholder:text-gray-400 data-[theme=light]:placeholder:text-gray-400 data-[theme=dark]:placeholder:text-gray-400"
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
};
