
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Users, Settings, Bell } from 'lucide-react';
import MassMessaging from '@/components/MassMessaging';
import ContactManagement from '@/components/ContactManagement';
import InstanceManagement from '@/components/InstanceManagement';
import IntelligentNotifications from '@/components/IntelligentNotifications';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-teal-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">WhatsApp Automation</h1>
                <p className="text-sm text-gray-500">Complete messaging and notification system</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="mass-messaging" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
            <TabsTrigger value="mass-messaging" className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span>Mass Messaging</span>
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Contacts</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="instances" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Instances</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mass-messaging">
            <MassMessaging />
          </TabsContent>

          <TabsContent value="contacts">
            <ContactManagement />
          </TabsContent>

          <TabsContent value="notifications">
            <IntelligentNotifications />
          </TabsContent>

          <TabsContent value="instances">
            <InstanceManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
