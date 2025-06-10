
import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, Video, X } from 'lucide-react';

interface VideoUploadSectionProps {
  videoFile: File | null;
  onVideoChange: (file: File | null) => void;
  formatFileSize: (bytes: number) => string;
}

const VideoUploadSection = ({ videoFile, onVideoChange, formatFileSize }: VideoUploadSectionProps) => {
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamanho do arquivo (100MB)
      if (file.size > 100 * 1024 * 1024) {
        alert('O vídeo deve ter no máximo 100MB');
        return;
      }
      onVideoChange(file);
    }
  };

  const removeVideo = () => {
    onVideoChange(null);
  };

  const triggerVideoUpload = () => {
    const input = document.getElementById('video-upload') as HTMLInputElement;
    if (input) {
      input.click();
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-gray-300">Vídeo (Opcional) - Máximo 100MB</Label>
      
      {videoFile ? (
        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Video className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-gray-200 font-medium">{videoFile.name}</p>
                <p className="text-xs text-gray-400">
                  {formatFileSize(videoFile.size)}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={removeVideo}
              className="text-red-400 hover:text-red-300"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
          <Video className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-400 mb-2">Clique para selecionar um vídeo</p>
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoChange}
            style={{ display: 'none' }}
            id="video-upload"
          />
          <Button 
            type="button" 
            variant="outline" 
            className="border-gray-600"
            onClick={triggerVideoUpload}
          >
            <Upload className="w-4 h-4 mr-2" />
            Selecionar Vídeo
          </Button>
        </div>
      )}
    </div>
  );
};

export default VideoUploadSection;
