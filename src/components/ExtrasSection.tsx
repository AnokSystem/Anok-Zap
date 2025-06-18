
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Image, Users, User } from 'lucide-react';
import TutorialsSection from './TutorialsSection';
import StoriesManagement from './ExtrasSection/StoriesManagement';
import GroupManagement from './ExtrasSection/GroupManagement';
import ProfileManagement from './ExtrasSection/ProfileManagement';

const ExtrasSection = () => {
  return (
    <div className="space-y-8 bg-transparent data-[theme=dark]:bg-transparent">
      {/* Header */}
      <div className="text-center pb-6 border-b border-gray-200 data-[theme=light]:border-gray-200 data-[theme=dark]:border-gray-700">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-purple">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 data-[theme=light]:text-gray-900 data-[theme=dark]:text-white">Funções Extras</h3>
        </div>
        <p className="text-gray-600 text-lg data-[theme=light]:text-gray-600 data-[theme=dark]:text-gray-400">
          Funcionalidades avançadas e recursos adicionais
        </p>
      </div>

      {/* Tabs para organizar as funcionalidades */}
      <Tabs defaultValue="tutorials" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white data-[theme=light]:bg-gray-100 data-[theme=light]:border data-[theme=light]:border-gray-200 data-[theme=dark]:bg-gray-900 data-[theme=dark]:border data-[theme=dark]:border-gray-700">
          <TabsTrigger 
            value="tutorials" 
            className="flex items-center gap-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[theme=light]:data-[state=active]:bg-purple-500 data-[theme=dark]:data-[state=active]:bg-purple-600 data-[theme=light]:text-gray-700 data-[theme=dark]:text-gray-300"
          >
            <BookOpen className="w-4 h-4" />
            Tutoriais
          </TabsTrigger>
          <TabsTrigger 
            value="stories" 
            className="flex items-center gap-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[theme=light]:data-[state=active]:bg-purple-500 data-[theme=dark]:data-[state=active]:bg-purple-600 data-[theme=light]:text-gray-700 data-[theme=dark]:text-gray-300"
          >
            <Image className="w-4 h-4" />
            Stories
          </TabsTrigger>
          <TabsTrigger 
            value="groups" 
            className="flex items-center gap-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[theme=light]:data-[state=active]:bg-purple-500 data-[theme=dark]:data-[state=active]:bg-purple-600 data-[theme=light]:text-gray-700 data-[theme=dark]:text-gray-300"
          >
            <Users className="w-4 h-4" />
            Grupos
          </TabsTrigger>
          <TabsTrigger 
            value="profile" 
            className="flex items-center gap-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[theme=light]:data-[state=active]:bg-purple-500 data-[theme=dark]:data-[state=active]:bg-purple-600 data-[theme=light]:text-gray-700 data-[theme=dark]:text-gray-300"
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
