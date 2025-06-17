
import React from 'react';
import { AppHeader } from '@/components/Header/AppHeader';
import { NavigationMenu } from '@/components/Navigation/NavigationMenu';
import { TabContentRenderer } from '@/components/TabContent/TabContentRenderer';
import { useTabNavigation } from '@/hooks/useTabNavigation';

const Index = () => {
  const { activeTab, handleTabChange } = useTabNavigation();

  return (
    <div className="min-h-screen bg-gray-950 relative">
      <AppHeader />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="animate-fade-in-up">
          <NavigationMenu activeTab={activeTab} onTabChange={handleTabChange} />
          
          {/* Tab Content */}
          <div className="mt-8">
            <TabContentRenderer activeTab={activeTab} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
