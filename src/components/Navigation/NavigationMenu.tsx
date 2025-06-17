
import React from 'react';
import { MessageSquare, Bell, TrendingUp, Users, Settings, BookOpen } from 'lucide-react';
import { NavigationCard } from './NavigationCard';

interface NavigationMenuProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const NavigationMenu = ({ activeTab, onTabChange }: NavigationMenuProps) => {
  const navigationCards = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      subtitle: 'Acompanhe disparos e notificações',
      icon: TrendingUp,
      gradient: 'gradient-primary',
      active: activeTab === 'dashboard'
    },
    {
      id: 'mass-messaging',
      title: 'Disparo',
      subtitle: 'Envie mensagens para múltiplos contatos',
      icon: MessageSquare,
      gradient: 'gradient-primary',
      active: activeTab === 'mass-messaging'
    },
    {
      id: 'contact-management',
      title: 'Contatos',
      subtitle: 'Gerencie seus contatos e grupos',
      icon: Users,
      gradient: 'gradient-primary',
      active: activeTab === 'contact-management'
    },
    {
      id: 'intelligent-notifications',
      title: 'Notificações',
      subtitle: 'Configure alertas inteligentes',
      icon: Bell,
      gradient: 'gradient-primary',
      active: activeTab === 'intelligent-notifications'
    },
    {
      id: 'instance-management',
      title: 'Config',
      subtitle: 'Configurações do WhatsApp',
      icon: Settings,
      gradient: 'gradient-primary',
      active: activeTab === 'instance-management'
    },
    {
      id: 'extras',
      title: 'Extras',
      subtitle: 'Funções adicionais e tutoriais',
      icon: BookOpen,
      gradient: 'gradient-primary',
      active: activeTab === 'extras'
    }
  ];

  return (
    <div className="flex justify-center gap-3 mb-12 overflow-x-auto">
      {navigationCards.map((card) => (
        <NavigationCard
          key={card.id}
          {...card}
          onClick={onTabChange}
        />
      ))}
    </div>
  );
};
