
import React from 'react';
import Dashboard from '@/components/Dashboard';
import MassMessaging from '@/components/MassMessaging';
import ContactManagement from '@/components/ContactManagement';
import IntelligentNotifications from '@/components/IntelligentNotifications';
import InstanceManagement from '@/components/InstanceManagement';
import ExtrasSection from '@/components/ExtrasSection';

interface TabContentRendererProps {
  activeTab: string;
}

export const TabContentRenderer = ({ activeTab }: TabContentRendererProps) => {
  switch (activeTab) {
    case 'dashboard':
      return <Dashboard />;
    case 'mass-messaging':
      return <MassMessaging />;
    case 'contact-management':
      return <ContactManagement />;
    case 'intelligent-notifications':
      return <IntelligentNotifications />;
    case 'instance-management':
      return <InstanceManagement />;
    case 'extras':
      return <ExtrasSection />;
    default:
      return <Dashboard />;
  }
};
