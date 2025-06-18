
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface NavigationCardProps {
  id: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  gradient: string;
  active: boolean;
  onClick: (id: string) => void;
}

export const NavigationCard = ({ id, title, subtitle, icon: IconComponent, gradient, active, onClick }: NavigationCardProps) => {
  return (
    <div
      key={id}
      onClick={() => onClick(id)}
      className={`nav-card ${active ? 'active' : ''} flex-shrink-0 data-[theme=light]:border data-[theme=light]:border-gray-200`}
      style={{ cursor: 'pointer' }}
    >
      <div className="flex flex-col items-center text-center space-y-2 p-3 min-w-[120px]">
        <div className={`w-10 h-10 ${gradient} rounded-xl flex items-center justify-center shadow-purple`}>
          <IconComponent className="w-5 h-5 text-white" />
        </div>
        <div className="space-y-1">
          <h3 className="nav-label text-xs font-bold">{title}</h3>
          <p className="text-xs text-gray-400 leading-tight text-center max-w-[100px]">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
};
