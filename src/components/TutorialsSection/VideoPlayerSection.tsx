
import React from 'react';
import { Button } from "@/components/ui/button";
import { Video, Maximize } from 'lucide-react';

interface VideoPlayerSectionProps {
  videoUrl: string;
}

const VideoPlayerSection = ({ videoUrl }: VideoPlayerSectionProps) => {
  const handleFullscreen = () => {
    const videoElement = document.getElementById('tutorial-video') as HTMLVideoElement;
    if (videoElement) {
      if (videoElement.requestFullscreen) {
        videoElement.requestFullscreen();
      } else if ((videoElement as any).webkitRequestFullscreen) {
        (videoElement as any).webkitRequestFullscreen();
      } else if ((videoElement as any).msRequestFullscreen) {
        (videoElement as any).msRequestFullscreen();
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Video className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold text-gray-200">Vídeo Tutorial</h3>
        </div>
        <Button
          onClick={handleFullscreen}
          variant="outline"
          size="sm"
          className="border-gray-600"
        >
          <Maximize className="w-4 h-4 mr-2" />
          Tela Cheia
        </Button>
      </div>
      
      <div className="bg-gray-800/50 rounded-lg p-2 border border-gray-600">
        <div className="relative">
          <video
            id="tutorial-video"
            className="w-full aspect-video rounded-lg bg-black"
            controls
            preload="metadata"
            controlsList="nodownload"
          >
            <source src={videoUrl} type="video/mp4" />
            <source src={videoUrl} type="video/webm" />
            <source src={videoUrl} type="video/ogg" />
            Seu navegador não suporta a reprodução de vídeo.
          </video>
        </div>
      </div>

      {/* Informações do Vídeo */}
      <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-600">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <span className="text-gray-400">Formato:</span>
            <span className="text-gray-200">MP4/WebM</span>
          </div>
          <div className="flex items-center space-x-2">
            <Video className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400">Controles disponíveis</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerSection;
