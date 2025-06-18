
import React from 'react';
import { ListHeader } from './ActiveNotificationsList/ListHeader';
import { EmptyState } from './ActiveNotificationsList/EmptyState';
import { NotificationCard } from './ActiveNotificationsList/NotificationCard';
import { ViewMoreFooter } from './ActiveNotificationsList/ViewMoreFooter';
import { useNotificationNavigation } from './ActiveNotificationsList/useNotificationNavigation';

interface ActiveNotificationsListProps {
  rules: any[];
  onDeleteRule: (ruleId: string) => void;
  onEditRule?: (rule: any) => void;
}

export const ActiveNotificationsList: React.FC<ActiveNotificationsListProps> = ({
  rules,
  onDeleteRule,
  onEditRule
}) => {
  const { handleViewDetails } = useNotificationNavigation();
  const displayedRules = 3;

  // Ordenar regras por data de criação (mais recentes primeiro)
  const sortedRules = React.useMemo(() => {
    return [...rules].sort((a, b) => {
      const dateA = new Date(a.CreatedAt || a.created_at || 0);
      const dateB = new Date(b.CreatedAt || b.created_at || 0);
      return dateB.getTime() - dateA.getTime(); // Ordem decrescente (mais recente primeiro)
    });
  }, [rules]);

  return (
    <div className="card-glass p-6">
      <ListHeader rulesCount={sortedRules.length} />

      {sortedRules.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {sortedRules.slice(0, displayedRules).map((rule) => (
            <NotificationCard
              key={rule.ID || rule.id}
              rule={rule}
              onViewDetails={handleViewDetails}
            />
          ))}
          
          <ViewMoreFooter 
            totalRules={sortedRules.length} 
            displayedRules={displayedRules} 
          />
        </div>
      )}
    </div>
  );
};
