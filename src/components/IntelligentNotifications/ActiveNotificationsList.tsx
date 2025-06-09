
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

  return (
    <div className="card-glass p-6">
      <ListHeader rulesCount={rules.length} />

      {rules.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {rules.slice(0, displayedRules).map((rule) => (
            <NotificationCard
              key={rule.ID || rule.id}
              rule={rule}
              onViewDetails={handleViewDetails}
            />
          ))}
          
          <ViewMoreFooter 
            totalRules={rules.length} 
            displayedRules={displayedRules} 
          />
        </div>
      )}
    </div>
  );
};
