
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, FileText, Trash2, Play } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { TutorialData } from '@/services/tutorialService';

interface TutorialCardProps {
  tutorial: TutorialData;
  onView: (tutorial: TutorialData) => void;
  onDelete: (tutorialId: string) => void;
}

const TutorialCard = ({ tutorial, onView, onDelete }: TutorialCardProps) => {
  const { user } = useAuth();
  const isAdmin = user?.Email === 'kona@admin.com';

  return (
    <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              {tutorial.videoUrl ? (
                <Video className="w-5 h-5 text-blue-400" />
              ) : (
                <FileText className="w-5 h-5 text-blue-400" />
              )}
            </div>
            <div>
              <CardTitle className="text-gray-200 text-lg font-semibold">
                {tutorial.title}
              </CardTitle>
            </div>
          </div>
          
          {isAdmin && (
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(tutorial.id)}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
        
        <CardDescription className="text-sm text-gray-400">
          {tutorial.description.length > 100 
            ? `${tutorial.description.substring(0, 100)}...` 
            : tutorial.description
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            {tutorial.videoUrl && (
              <div className="flex items-center space-x-1">
                <Video className="w-3 h-3" />
                <span>Vídeo</span>
              </div>
            )}
            {tutorial.documentUrls.length > 0 && (
              <div className="flex items-center space-x-1">
                <FileText className="w-3 h-3" />
                <span>{tutorial.documentUrls.length} doc(s)</span>
              </div>
            )}
          </div>
          
          <Button
            onClick={() => onView(tutorial)}
            className="btn-primary"
            size="sm"
          >
            <Play className="w-4 h-4 mr-2" />
            Assistir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TutorialCard;
