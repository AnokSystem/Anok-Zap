
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, UserMinus, Crown, TrendingUp, Activity, Calendar } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const GroupManagement = () => {
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

  const handleManageAdmins = () => {
    toast({
      title: "Em desenvolvimento",
      description: "Funcionalidade de gerenciar administradores será implementada em breve", 
    });
  };

  const handleViewAnalytics = () => {
    toast({
      title: "Em desenvolvimento",
      description: "Analytics de grupos será implementado em breve", 
    });
  };

  const quickActions = [
    {
      id: 'create-groups',
      title: 'Criar Grupo',
      description: 'Crie novos grupos no WhatsApp',
      icon: Users,
      action: handleCreateGroup,
      gradient: 'from-blue-500/20 to-blue-600/20',
      iconColor: 'text-blue-400',
      borderColor: 'border-blue-500/30',
      hoverGradient: 'hover:from-blue-500/30 hover:to-blue-600/30'
    },
    {
      id: 'add-members',
      title: 'Adicionar Membros',
      description: 'Adicione contatos aos grupos',
      icon: UserPlus,
      action: handleAddMembers,
      gradient: 'from-green-500/20 to-green-600/20',
      iconColor: 'text-green-400',
      borderColor: 'border-green-500/30',
      hoverGradient: 'hover:from-green-500/30 hover:to-green-600/30'
    },
    {
      id: 'remove-members',
      title: 'Remover Membros',
      description: 'Remova contatos dos grupos',
      icon: UserMinus,
      action: handleRemoveMembers,
      gradient: 'from-red-500/20 to-red-600/20',
      iconColor: 'text-red-400',
      borderColor: 'border-red-500/30',
      hoverGradient: 'hover:from-red-500/30 hover:to-red-600/30'
    },
    {
      id: 'manage-admins',
      title: 'Gerenciar Admins',
      description: 'Promova ou remova administradores',
      icon: Crown,
      action: handleManageAdmins,
      gradient: 'from-purple-500/20 to-purple-600/20',
      iconColor: 'text-purple-400',
      borderColor: 'border-purple-500/30',
      hoverGradient: 'hover:from-purple-500/30 hover:to-purple-600/30'
    }
  ];

  const statsData = [
    {
      id: 'groups-created',
      title: 'Grupos Criados',
      value: '0',
      change: '+0',
      period: 'Este mês',
      icon: Users,
      gradient: 'from-blue-500/10 to-blue-600/10',
      iconColor: 'text-blue-400',
      borderColor: 'border-blue-500/20',
      changeColor: 'text-blue-400'
    },
    {
      id: 'members-added',
      title: 'Membros Adicionados',
      value: '0',
      change: '+0',
      period: 'Este mês',
      icon: UserPlus,
      gradient: 'from-green-500/10 to-green-600/10',
      iconColor: 'text-green-400',
      borderColor: 'border-green-500/20',
      changeColor: 'text-green-400'
    },
    {
      id: 'members-removed',
      title: 'Membros Removidos',
      value: '0',
      change: '+0',
      period: 'Este mês',
      icon: UserMinus,
      gradient: 'from-red-500/10 to-red-600/10',
      iconColor: 'text-red-400',
      borderColor: 'border-red-500/20',
      changeColor: 'text-red-400'
    },
    {
      id: 'active-groups',
      title: 'Grupos Ativos',
      value: '0',
      change: '+0',
      period: 'Total',
      icon: Activity,
      gradient: 'from-orange-500/10 to-orange-600/10',
      iconColor: 'text-orange-400',
      borderColor: 'border-orange-500/20',
      changeColor: 'text-orange-400'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header da Seção */}
      <div className="text-center pb-6 border-b border-white/10">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-purple">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-primary-contrast">Gerenciamento de Grupos</h3>
        </div>
        <p className="text-gray-400 text-lg">
          Crie, gerencie e monitore seus grupos do WhatsApp
        </p>
      </div>

      {/* Estatísticas dos Grupos */}
      <div className="card-glass p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-accent/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-accent" />
            </div>
            <div>
              <h4 className="font-semibold text-primary-contrast text-lg">Estatísticas</h4>
              <p className="text-sm text-gray-400 mt-1">
                Resumo das suas ações em grupos
              </p>
            </div>
          </div>
          <Button
            onClick={handleViewAnalytics}
            variant="outline"
            size="sm"
            className="border-purple-accent/30 text-purple-accent hover:bg-purple-accent/10"
          >
            <Activity className="w-4 h-4 mr-2" />
            Ver Analytics
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsData.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={stat.id}
                className={`bg-gradient-to-br ${stat.gradient} p-6 rounded-xl border ${stat.borderColor} hover:scale-105 transition-all duration-200`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 bg-gray-800/50 rounded-lg flex items-center justify-center`}>
                    <IconComponent className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full bg-gray-800/50 ${stat.changeColor}`}>
                    {stat.change}
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-primary-contrast mb-1">{stat.value}</h3>
                  <p className={`text-sm font-medium ${stat.iconColor} mb-1`}>{stat.title}</p>
                  <p className="text-xs text-gray-400">{stat.period}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="card-glass p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-purple-accent/20 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-accent" />
          </div>
          <div>
            <h4 className="font-semibold text-primary-contrast text-lg">Ações Rápidas</h4>
            <p className="text-sm text-gray-400 mt-1">
              Gerencie seus grupos com facilidade
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <Card 
                key={action.id} 
                className={`bg-gradient-to-br ${action.gradient} border ${action.borderColor} ${action.hoverGradient} transition-all duration-200 hover:scale-105 cursor-pointer group`}
                onClick={action.action}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`w-12 h-12 bg-gray-800/50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                      <IconComponent className={`w-6 h-6 ${action.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-primary-contrast text-base font-semibold">
                        {action.title}
                      </CardTitle>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {action.description}
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      action.action();
                    }}
                    className="w-full btn-primary text-sm"
                    size="sm"
                  >
                    Acessar
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Grupos Recentes */}
      <div className="card-glass p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-accent/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-accent" />
            </div>
            <div>
              <h4 className="font-semibold text-primary-contrast text-lg">Atividade Recente</h4>
              <p className="text-sm text-gray-400 mt-1">
                Últimas ações realizadas em grupos
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/30 rounded-lg p-8 text-center border border-gray-700/50">
          <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-300 mb-2">Nenhuma atividade ainda</h3>
          <p className="text-gray-400 mb-4">
            Comece criando grupos ou adicionando membros para ver suas atividades aqui
          </p>
          <Button
            onClick={handleCreateGroup}
            className="btn-primary"
          >
            <Users className="w-4 h-4 mr-2" />
            Criar Primeiro Grupo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GroupManagement;
