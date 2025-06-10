
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, UserMinus, BookOpen, PlayCircle, FileText, HelpCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

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

  const handleTutorials = () => {
    toast({
      title: "Em desenvolvimento",
      description: "Página de tutoriais será implementada em breve",
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
    },
    {
      id: 'tutorials',
      title: 'Tutoriais',
      description: 'Acesse guias e tutoriais para usar o sistema',
      icon: BookOpen,
      action: handleTutorials,
      color: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    }
  ];

  const tutorialCategories = [
    {
      title: 'Primeiros Passos',
      description: 'Como configurar e conectar suas instâncias',
      icon: PlayCircle,
      items: ['Conectar WhatsApp', 'Configurar Instâncias', 'Importar Contatos']
    },
    {
      title: 'Guias Avançados',
      description: 'Funcionalidades avançadas e automações',
      icon: FileText,
      items: ['Disparos em Massa', 'Notificações Inteligentes', 'Gerenciar Grupos']
    },
    {
      title: 'Suporte',
      description: 'Ajuda e resolução de problemas',
      icon: HelpCircle,
      items: ['FAQ', 'Solucionar Problemas', 'Contato Suporte']
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Seção de Tutoriais */}
      <div className="card-glass p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-purple-accent/20 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-purple-accent" />
          </div>
          <div>
            <h4 className="font-semibold text-primary-contrast text-lg">Central de Tutoriais</h4>
            <p className="text-sm text-gray-400 mt-1">
              Aprenda a usar todas as funcionalidades do sistema
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tutorialCategories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <div key={index} className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/50">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-purple-accent/20 rounded-lg flex items-center justify-center">
                    <IconComponent className="w-4 h-4 text-purple-accent" />
                  </div>
                  <div>
                    <h5 className="font-medium text-primary-contrast">{category.title}</h5>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mb-3">{category.description}</p>
                <ul className="space-y-1">
                  {category.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-xs text-gray-500 flex items-center">
                      <div className="w-1 h-1 bg-purple-accent rounded-full mr-2"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <Button
            onClick={handleTutorials}
            className="btn-primary"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Ver Todos os Tutoriais
          </Button>
        </div>
      </div>

      {/* Seção de Estatísticas dos Grupos */}
      <div className="card-glass p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-purple-accent/20 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-accent" />
          </div>
          <div>
            <h4 className="font-semibold text-primary-contrast text-lg">Gerenciamento de Grupos</h4>
            <p className="text-sm text-gray-400 mt-1">
              Resumo das suas ações em grupos
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span className="font-medium text-blue-400">Grupos Criados</span>
            </div>
            <p className="text-2xl font-bold text-primary-contrast">0</p>
            <p className="text-xs text-gray-400">Este mês</p>
          </div>
          
          <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
            <div className="flex items-center space-x-2 mb-2">
              <UserPlus className="w-5 h-5 text-green-400" />
              <span className="font-medium text-green-400">Membros Adicionados</span>
            </div>
            <p className="text-2xl font-bold text-primary-contrast">0</p>
            <p className="text-xs text-gray-400">Este mês</p>
          </div>
          
          <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/20">
            <div className="flex items-center space-x-2 mb-2">
              <UserMinus className="w-5 h-5 text-red-400" />
              <span className="font-medium text-red-400">Membros Removidos</span>
            </div>
            <p className="text-2xl font-bold text-primary-contrast">0</p>
            <p className="text-xs text-gray-400">Este mês</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExtrasSection;
