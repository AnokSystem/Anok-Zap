
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Video, FileText, Trash2, Play, Image, Edit } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { TutorialData } from '@/services/tutorialService';

interface TutorialCardProps {
  tutorial: TutorialData;
  onView: (tutorial: TutorialData) => void;
  onEdit: (tutorial: TutorialData) => void;
  onDelete: (tutorialId: string) => void;
}

const TutorialCard = ({ tutorial, onView, onEdit, onDelete }: TutorialCardProps) => {
  const { user } = useAuth();
  const isAdmin = user?.Email === 'kona@admin.com';
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('🗑️ TutorialCard - Botão de deletar clicado para tutorial:', tutorial.id, tutorial.title);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    console.log('✅ TutorialCard - Confirmação de delete aceita via AlertDialog');
    console.log('📝 TutorialCard - Deletando tutorial:', tutorial.id, tutorial.title);
    
    setIsDeleting(true);
    
    try {
      console.log('⏳ TutorialCard - Chamando função onDelete...');
      await onDelete(tutorial.id);
      console.log('✅ TutorialCard - Função onDelete executada');
    } catch (error) {
      console.error('❌ TutorialCard - Erro na execução do onDelete:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleCancelDelete = () => {
    console.log('❌ TutorialCard - Exclusão cancelada pelo usuário');
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-200 overflow-hidden">
        {/* Imagem de Capa */}
        {tutorial.coverImageUrl && (
          <div className="w-full h-48 overflow-hidden">
            <img
              src={tutorial.coverImageUrl}
              alt={tutorial.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                {tutorial.coverImageUrl ? (
                  <Image className="w-5 h-5 text-blue-400" />
                ) : tutorial.videoUrl ? (
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
                  onClick={() => onEdit(tutorial)}
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteClick}
                  disabled={isDeleting}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 disabled:opacity-50"
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
              {tutorial.coverImageUrl && (
                <div className="flex items-center space-x-1">
                  <Image className="w-3 h-3" />
                  <span>Capa</span>
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

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-gray-900 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-primary-contrast">
              Confirmar Exclusão
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Tem certeza que deseja excluir o tutorial "{tutorial.title}"? 
              Esta ação não pode ser desfeita e todos os arquivos associados serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={handleCancelDelete}
              className="bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600"
              disabled={isDeleting}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir Tutorial'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TutorialCard;
