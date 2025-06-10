
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, UserMinus, BookOpen, PlayCircle, FileText, HelpCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import TutorialsSection from './TutorialsSection';
import GroupManagement from './GroupManagement';

const ExtrasSection = () => {
  const { toast } = useToast();

  const handleCreateGroup = () => {
    toast({
      title: "Em desenvolvimento",
      description: "Funcionalidade de criar grupos será implementada em breve",
    });
  };

  const handleAddMembers = () => {
    toast({
      title: "Em desenvolvimento", 
      description: "Funcionalidade de adicionar membros será implementada em breve",
    });
  };

  const handleRemoveMembers = () => {
    toast({
      title: "Em desenvolvimento",
      description: "Funcionalidade de remover membros será implementada em breve", 
    });
  };

  const extraFeatures = [
    {
      id: 'create-groups',
      title: 'Criar Grupos',
      description: 'Crie novos grupos no WhatsApp diretamente pelo sistema',
      icon: Users,
      action: handleCreateGroup,
      color: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    },
    {
      id: 'add-members',
      title: 'Adicionar Membros',
      description: 'Adicione contatos aos grupos existentes',
      icon: UserPlus,
      action: handleAddMembers,
      color: 'bg-green-500/20 text-green-400 border-green-500/30'
    },
    {
      id: 'remove-members',
      title: 'Remover Membros',
      description: 'Remova contatos dos grupos quando necessário',
      icon: UserMinus,
      action: handleRemoveMembers,
      color: 'bg-red-500/20 text-red-400 border-red-500/30'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header da Seção */}
      <div className="text-center pb-6 border-b border-white/10">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-purple">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-primary-contrast">Extras</h3>
        </div>
        <p className="text-gray-400 text-lg">
          Funcionalidades adicionais e recursos de aprendizado
        </p>
      </div>

      {/* Cards de Funcionalidades */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {extraFeatures.map((feature) => {
          const IconComponent = feature.icon;
          return (
            <Card key={feature.id} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${feature.color}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-gray-200 text-lg font-semibold">
                      {feature.title}
                    </CardTitle>
                  </div>
                </div>
                <CardDescription className="text-sm text-gray-400">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  onClick={feature.action}
                  className="w-full btn-primary"
                  size="sm"
                >
                  Acessar
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Seção de Tutoriais Completa */}
      <TutorialsSection />

      {/* Seção de Gerenciamento de Grupos Renovada */}
      <GroupManagement />
    </div>
  );
};

export default ExtrasSection;
