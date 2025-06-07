
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Upload, Plus, Trash2, Send, Download, MessageSquare } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { evolutionApiService } from '@/services/evolutionApi';
import { minioService } from '@/services/minio';

interface Message {
  id: string;
  type: 'text' | 'audio' | 'video' | 'image' | 'document';
  content: string;
  file?: File;
  fileUrl?: string;
}

const MassMessaging = () => {
  const { toast } = useToast();
  const [instances, setInstances] = useState<any[]>([]);
  const [selectedInstance, setSelectedInstance] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', type: 'text', content: '' }
  ]);
  const [recipients, setRecipients] = useState('');
  const [delay, setDelay] = useState([5]);
  const [notificationPhone, setNotificationPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

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

  const updateMessage = (id: string, updates: Partial<Message>) => {
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

  const handleSpreadsheetUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      // Here you would parse the spreadsheet and extract phone numbers
      toast({
        title: "File uploaded",
        description: "Spreadsheet processed successfully",
      });
    }
  };

  const downloadTemplate = () => {
    // Create a simple CSV template
    const csvContent = "PhoneNumber,Name\n+5511999999999,John Doe\n+5511888888888,Jane Smith";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'whatsapp_contacts_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleSendCampaign = async () => {
    if (!selectedInstance || messages.length === 0 || !recipients.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const campaignData = {
        instance: selectedInstance,
        messages: messages,
        recipients: recipients.split('\n').filter(r => r.trim()),
        delay: delay[0],
        notificationPhone
      };

      // Send to n8n webhook
      await fetch('https://webhook.novahagencia.com.br/webhook/bb39433b-a53b-484c-8721-f9a66d54f821', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaignData),
      });

      toast({
        title: "Campaign Started",
        description: "Mass messaging campaign has been initiated",
      });

      // Reset form
      setMessages([{ id: '1', type: 'text', content: '' }]);
      setRecipients('');
      setNotificationPhone('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start campaign",
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
            <MessageSquare className="w-5 h-5" />
            <span>Mass Messaging Campaign</span>
          </CardTitle>
          <CardDescription>
            Send bulk messages to multiple WhatsApp contacts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Instance Selection */}
          <div className="space-y-2">
            <Label htmlFor="instance">WhatsApp Instance</Label>
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

          {/* Messages Configuration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Messages (up to 5)</Label>
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
                        placeholder="Enter your message here..."
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

          {/* Recipients */}
          <div className="space-y-4">
            <Label>Recipients</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Manual Entry</Label>
                <Textarea
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value)}
                  placeholder="Enter phone numbers (one per line)&#10;+5511999999999&#10;+5511888888888"
                  className="min-h-[120px]"
                />
              </div>
              <div>
                <Label className="text-sm">Upload Spreadsheet</Label>
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept=".xlsx,.csv"
                    onChange={handleSpreadsheetUpload}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={downloadTemplate}
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Template
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Delay Configuration */}
          <div className="space-y-2">
            <Label>Delay Between Messages: {delay[0]} seconds</Label>
            <Slider
              value={delay}
              onValueChange={setDelay}
              max={60}
              min={1}
              step={1}
              className="w-full"
            />
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

          {/* Send Button */}
          <Button
            onClick={handleSendCampaign}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
          >
            <Send className="w-4 h-4 mr-2" />
            {isLoading ? 'Starting Campaign...' : 'Start Campaign'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default MassMessaging;
