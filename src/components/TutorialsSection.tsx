
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Video, FileText, Plus, Trash2, Play, Wifi, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTutorials } from '@/hooks/useTutorials';
import { TutorialData } from '@/services/tutorialService';
import CreateTutorialModal from './TutorialsSection/CreateTutorialModal';
import TutorialViewModal from './TutorialsSection/TutorialViewModal';

const TutorialsSection = () => {
  const { user } = useAuth();
  const { tutorials, loading, deleteTutorial, testConnection } = useTutorials();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTutorial, setSelectedTutorial] = useState<TutorialData | null>(null);

  const isAdmin = user?.Email === 'kona@admin.com';

  const handleDeleteTutorial = async (tutorialId: string) => {
    if (window.confirm('Tem certeza que deseja deletar este tutorial?')) {
      await deleteTutorial(tutorialId);
    }
  };

  const groupedTutorials = tutorials.reduce((acc, tutorial) => {
    if (!acc[tutorial.category]) {
      acc[tutorial.category] = [];
    }
    acc[tutorial.category].push(tutorial);
    return acc;
  }, {} as Record<string, TutorialData[]>);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center pb-6 border-b border-white/10">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-purple">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-primary-contrast">Tutoriais</h3>
          </div>
          <p className="text-gray-400 text-lg">Carregando tutoriais...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header da Seção */}
      <div className="text-center pb-6 border-b border-white/10">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-purple">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-primary-contrast">Central de Tutoriais</h3>
        </div>
        <p className="text-gray-400 text-lg">
          Aprenda a usar todas as funcionalidades do sistema
        </p>
        
        <div className="mt-6 flex justify-center space-x-4">
          {isAdmin && (
            <>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Novo Tutorial
              </Button>
              <Button
                onClick={testConnection}
                variant="outline"
                className="border-gray-600"
              >
                <Wifi className="w-4 h-4 mr-2" />
                Testar Conexão MinIO
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Status da Conexão */}
      {isAdmin && (
        <div className="card-glass p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="w-5 h-5 text-blue-400" />
              <div>
                <h4 className="font-semibold text-gray-200">Status do Sistema</h4>
                <p className="text-sm text-gray-400">
                  Verifique a conexão com o servidor de arquivos antes de criar tutoriais
                </p>
              </div>
            </div>
            <Button
              onClick={testConnection}
              variant="outline"
              size="sm"
              className="border-gray-600"
            >
              <Wifi className="w-4 h-4 mr-2" />
              Verificar
            </Button>
          </div>
        </div>
      )}

      {/* Tutoriais por Categoria */}
      {Object.entries(groupedTutorials).map(([category, categoryTutorials]) => (
        <div key={category} className="card-glass p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-purple-accent/20 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-purple-accent" />
            </div>
            <div>
              <h4 className="font-semibold text-primary-contrast text-lg">{category}</h4>
              <p className="text-sm text-gray-400 mt-1">
                {categoryTutorials.length} tutorial(s) disponível(is)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryTutorials.map((tutorial) => (
              <Card key={tutorial.id} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-200">
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
                          onClick={() => handleDeleteTutorial(tutorial.id)}
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
                      onClick={() => setSelectedTutorial(tutorial)}
                      className="btn-primary"
                      size="sm"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Assistir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {tutorials.length === 0 && (
        <div className="card-glass p-12 text-center">
          <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-xl font-semibold text-gray-300 mb-2">
            Nenhum tutorial disponível
          </h4>
          <p className="text-gray-400 mb-6">
            {isAdmin 
              ? "Comece criando seu primeiro tutorial para ajudar os usuários."
              : "Os tutoriais estarão disponíveis em breve."
            }
          </p>
          {isAdmin && (
            <div className="space-y-4">
              <Button
                onClick={testConnection}
                variant="outline"
                className="border-gray-600 mr-4"
              >
                <Wifi className="w-4 h-4 mr-2" />
                Testar Conexão
              </Button>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Tutorial
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Modais */}
      <CreateTutorialModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      
      <TutorialViewModal
        tutorial={selectedTutorial}
        isOpen={!!selectedTutorial}
        onClose={() => setSelectedTutorial(null)}
      />
    </div>
  );
};

export default TutorialsSection;
