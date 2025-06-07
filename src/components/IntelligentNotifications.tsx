
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Copy, Plus, Trash2, Upload } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { evolutionApiService } from '@/services/evolutionApi';
import { minioService } from '@/services/minio';
import { nocodbService } from '@/services/nocodb';

interface NotificationMessage {
  id: string;
  type: 'text' | 'audio' | 'video' | 'image' | 'document';
  content: string;
  file?: File;
  fileUrl?: string;
}

const webhookUrls = {
  'purchase-approved': 'https://webhook.novahagencia.com.br/webhook/4759af4e-61f0-47b8-b2c0-d730000ca2b5',
  'awaiting-payment': 'https://webhook.novahagencia.com.br/webhook/5f5fd8b0-0733-4cfc-b5e7-319462991065',
  'cart-abandoned': 'https://webhook.novahagencia.com.br/webhook/6631e496-f119-48a4-b198-7d1d5010bbf7'
};

const IntelligentNotifications = () => {
  const { toast } = useToast();
  const [instances, setInstances] = useState<any[]>([]);
  const [selectedInstance, setSelectedInstance] = useState('');
  const [userRole, setUserRole] = useState('');
  const [hotmartProfile, setHotmartProfile] = useState('');
  const [eventType, setEventType] = useState('');
  const [messages, setMessages] = useState<NotificationMessage[]>([
    { id: '1', type: 'text', content: '' }
  ]);
  const [notificationPhone, setNotificationPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showWebhookUrl, setShowWebhookUrl] = useState(false);

  useEffect(() => {
    loadInstances();
  }, []);

  const loadInstances = async () => {
    try {
      const instancesData = await evolutionApiService.getInstances();
      setInstances(instancesData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load WhatsApp instances",
        variant: "destructive",
      });
    }
  };

  const addMessage = () => {
    if (messages.length < 5) {
      setMessages([...messages, {
        id: Date.now().toString(),
        type: 'text',
        content: ''
      }]);
    }
  };

  const removeMessage = (id: string) => {
    if (messages.length > 1) {
      setMessages(messages.filter(msg => msg.id !== id));
    }
  };

  const updateMessage = (id: string, updates: Partial<NotificationMessage>) => {
    setMessages(messages.map(msg => 
      msg.id === id ? { ...msg, ...updates } : msg
    ));
  };

  const handleFileUpload = async (messageId: string, file: File) => {
    try {
      setIsLoading(true);
      const fileUrl = await minioService.uploadFile(file);
      updateMessage(messageId, { file, fileUrl });
      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyWebhookUrl = () => {
    if (eventType) {
      const url = webhookUrls[eventType as keyof typeof webhookUrls];
      navigator.clipboard.writeText(url);
      toast({
        title: "Copied!",
        description: "Webhook URL copied to clipboard",
      });
    }
  };

  const saveNotification = async () => {
    if (!selectedInstance || !userRole || !hotmartProfile || !eventType || messages.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const notificationData = {
        instance: selectedInstance,
        userRole,
        hotmartProfile,
        eventType,
        messages,
        notificationPhone,
        webhookUrl: webhookUrls[eventType as keyof typeof webhookUrls],
        timestamp: new Date().toISOString()
      };

      // Save to NocoDB
      await nocodbService.saveHotmartNotification(notificationData);
      
      setShowWebhookUrl(true);
      
      toast({
        title: "Success",
        description: "Notification configuration saved successfully",
      });

      // Send completion notification if phone number provided
      if (notificationPhone) {
        await evolutionApiService.sendMessage(
          selectedInstance,
          notificationPhone,
          `Hotmart notification for ${eventType.replace('-', ' ')} configured successfully.`
        );
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save notification configuration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Intelligent Notifications</span>
          </CardTitle>
          <CardDescription>
            Configure automatic WhatsApp notifications for Hotmart events
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>WhatsApp Instance</Label>
              <Select value={selectedInstance} onValueChange={setSelectedInstance}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an instance" />
                </SelectTrigger>
                <SelectContent>
                  {instances.map((instance) => (
                    <SelectItem key={instance.id} value={instance.id}>
                      {instance.name} ({instance.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>User Role</Label>
              <Select value={userRole} onValueChange={setUserRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="affiliate">Affiliate</SelectItem>
                  <SelectItem value="producer">Producer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Hotmart Profile Name</Label>
              <Input
                value={hotmartProfile}
                onChange={(e) => setHotmartProfile(e.target.value)}
                placeholder="Enter your Hotmart profile name"
              />
            </div>

            <div className="space-y-2">
              <Label>Event Type</Label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="purchase-approved">Purchase Approved</SelectItem>
                  <SelectItem value="awaiting-payment">Awaiting Payment</SelectItem>
                  <SelectItem value="cart-abandoned">Cart Abandoned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Messages Configuration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Notification Messages (up to 5)</Label>
              {messages.length < 5 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addMessage}
                  className="flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Message</span>
                </Button>
              )}
            </div>

            {messages.map((message, index) => (
              <Card key={message.id} className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Message {index + 1}</Label>
                    {messages.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMessage(message.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Message Type</Label>
                      <Select
                        value={message.type}
                        onValueChange={(value: any) => updateMessage(message.id, { type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="audio">Audio</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="image">Image</SelectItem>
                          <SelectItem value="document">Document</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {message.type !== 'text' && (
                      <div>
                        <Label>Upload File</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="file"
                            accept={message.type === 'audio' ? '.mp3,.wav' : 
                                   message.type === 'video' ? '.mp4,.avi' :
                                   message.type === 'image' ? '.jpg,.png,.gif' : 
                                   '.pdf,.doc,.docx'}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(message.id, file);
                            }}
                            className="flex-1"
                          />
                          <Upload className="w-4 h-4 text-gray-400" />
                        </div>
                        {message.fileUrl && (
                          <p className="text-sm text-green-600 mt-1">File uploaded successfully</p>
                        )}
                      </div>
                    )}
                  </div>

                  {message.type === 'text' && (
                    <div>
                      <Label>Message Content</Label>
                      <Textarea
                        value={message.content}
                        onChange={(e) => updateMessage(message.id, { content: e.target.value })}
                        placeholder="Enter your notification message here..."
                        className="min-h-[100px]"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        {message.content.length} characters
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Notification Phone */}
          <div className="space-y-2">
            <Label>Completion Notification Phone (optional)</Label>
            <Input
              value={notificationPhone}
              onChange={(e) => setNotificationPhone(e.target.value)}
              placeholder="+5511999999999"
            />
          </div>

          {/* Save Button */}
          <Button
            onClick={saveNotification}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
          >
            <Bell className="w-4 h-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Notification Configuration'}
          </Button>

          {/* Webhook URL Display */}
          {showWebhookUrl && eventType && (
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-lg text-green-800">
                  Configuration Complete!
                </CardTitle>
                <CardDescription className="text-green-700">
                  Copy this webhook URL and paste it in your Hotmart platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Input
                    value={webhookUrls[eventType as keyof typeof webhookUrls]}
                    readOnly
                    className="flex-1 bg-white"
                  />
                  <Button
                    onClick={copyWebhookUrl}
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-green-700 mt-2">
                  Event: {eventType.replace('-', ' ').toUpperCase()}
                </p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IntelligentNotifications;
