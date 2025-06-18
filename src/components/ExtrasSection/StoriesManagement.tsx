
import React, { useState, useEffect } from 'react';
import { evolutionApiService } from '@/services/evolutionApi';
import { InstanceSelector } from './StoriesManagement/InstanceSelector';
import { StoryConfigForm } from './StoriesManagement/StoryConfigForm';
import { PublishingOptions } from './StoriesManagement/PublishingOptions';
import { useStoriesWebhook } from './StoriesManagement/hooks/useStoriesWebhook';

const StoriesManagement = () => {
  const [instances, setInstances] = useState<any[]>([]);
  const [selectedInstances, setSelectedInstances] = useState<string[]>([]);
  const [storyData, setStoryData] = useState({
    type: 'image',
    caption: '',
    schedule: false,
    scheduleDate: '',
    scheduleTime: '',
    file: null as File | null
  });

  const { isPosting, uploadFileAndSendStories } = useStoriesWebhook();

  useEffect(() => {
    loadInstances();
  }, []);

  const loadInstances = async () => {
    try {
      const instanceList = await evolutionApiService.getInstances();
      setInstances(instanceList);
    } catch (error) {
      console.error('Erro ao carregar instâncias:', error);
    }
  };

  const handleInstanceToggle = (instanceId: string) => {
    setSelectedInstances(prev => 
      prev.includes(instanceId)
        ? prev.filter(id => id !== instanceId)
        : [...prev, instanceId]
    );
  };

  const handleStoryDataChange = (updates: Partial<typeof storyData>) => {
    setStoryData(prev => ({ ...prev, ...updates }));
  };

  const handleFileChange = (file: File | null) => {
    setStoryData(prev => ({ ...prev, file }));
  };

  const handlePostStory = async () => {
    const success = await uploadFileAndSendStories(storyData, selectedInstances, false);
    if (success) {
      // Limpar o formulário após postar
      setStoryData({
        type: 'image',
        caption: '',
        schedule: false,
        scheduleDate: '',
        scheduleTime: '',
        file: null
      });
      setSelectedInstances([]);
    }
  };

  const handleScheduleStory = async () => {
    const success = await uploadFileAndSendStories(storyData, selectedInstances, true);
    if (success) {
      // Limpar formulário
      setStoryData({
        type: 'image',
        caption: '',
        schedule: false,
        scheduleDate: '',
        scheduleTime: '',
        file: null
      });
      setSelectedInstances([]);
    }
  };

  return (
    <div className="space-y-6 bg-gray-950 data-[theme=light]:bg-white data-[theme=dark]:bg-gray-950">
      <InstanceSelector
        instances={instances}
        selectedInstances={selectedInstances}
        onInstanceToggle={handleInstanceToggle}
      />

      <StoryConfigForm
        storyData={storyData}
        onStoryDataChange={handleStoryDataChange}
        onFileChange={handleFileChange}
      />

      <PublishingOptions
        storyData={storyData}
        isPosting={isPosting}
        onStoryDataChange={handleStoryDataChange}
        onPostStory={handlePostStory}
        onScheduleStory={handleScheduleStory}
      />
    </div>
  );
};

export default StoriesManagement;
