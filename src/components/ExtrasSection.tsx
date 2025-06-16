
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Image, Users, User } from 'lucide-react';
import TutorialsSection from './TutorialsSection';
import StoriesManagement from './ExtrasSection/StoriesManagement';
import GroupManagement from './ExtrasSection/GroupManagement';
import ProfileManagement from './ExtrasSection/ProfileManagement';

const ExtrasSection = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center pb-6 border-b border-white/10 data-[theme=light]:border-gray-200">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-purple">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-primary-contrast">Funções Extras</h3>
        </div>
        <p className="text-gray-400 text-lg data-[theme=light]:text-gray-600">
          Funcionalidades avançadas e recursos adicionais
        </p>
      </div>

      {/* Tabs para organizar as funcionalidades */}
      <Tabs defaultValue="tutorials" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 data-[theme=light]:bg-white data-[theme=light]:border data-[theme=light]:border-gray-200">
          <TabsTrigger 
            value="tutorials" 
            className="flex items-center gap-2 data-[state=active]:bg-purple-accent/20 data-[theme=light]:data-[state=active]:bg-purple-accent/10"
          >
            <BookOpen className="w-4 h-4" />
            Tutoriais
          </TabsTrigger>
          <TabsTrigger 
            value="stories" 
            className="flex items-center gap-2 data-[state=active]:bg-purple-accent/20 data-[theme=light]:data-[state=active]:bg-purple-accent/10"
          >
            <Image className="w-4 h-4" />
            Stories
          </TabsTrigger>
          <TabsTrigger 
            value="groups" 
            className="flex items-center gap-2 data-[state=active]:bg-purple-accent/20 data-[theme=light]:data-[state=active]:bg-purple-accent/10"
          >
            <Users className="w-4 h-4" />
            Grupos
          </TabsTrigger>
          <TabsTrigger 
            value="profile" 
            className="flex items-center gap-2 data-[state=active]:bg-purple-accent/20 data-[theme=light]:data-[state=active]:bg-purple-accent/10"
          >
            <User className="w-4 h-4" />
            Perfil
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tutorials" className="mt-6">
          <TutorialsSection />
        </TabsContent>

        <TabsContent value="stories" className="mt-6">
          <StoriesManagement />
        </TabsContent>

        <TabsContent value="groups" className="mt-6">
          <GroupManagement />
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <ProfileManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExtrasSection;
