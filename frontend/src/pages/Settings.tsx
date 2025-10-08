import React, { useState } from 'react';
import { ArrowLeft, Settings as SettingsIcon, Bell, Palette, Monitor, Database, Shield, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

interface SettingsProps {
  onNavigate: (page: 'home' | 'about' | 'settings') => void;
}

/**
 * Settings page component for configuring application preferences
 * Includes theme settings, notifications, data refresh rates, and system preferences
 */
const Settings: React.FC<SettingsProps> = ({ onNavigate }) => {
  const [notifications, setNotifications] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshRate, setRefreshRate] = useState([30]);
  const [theme, setTheme] = useState('system');
  const [dataRetention, setDataRetention] = useState('30');

  const handleSaveSettings = () => {
    // In a real app, this would save to localStorage or backend
    console.log('Settings saved:', {
      notifications,
      autoRefresh,
      refreshRate: refreshRate[0],
      theme,
      dataRetention
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <Button 
            variant="ghost" 
            onClick={() => onNavigate('home')}
            className="text-gray-600 hover:text-gray-900 hover:bg-emerald-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Map
          </Button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
            Settings
          </h1>
          <Button 
            onClick={handleSaveSettings}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 rounded-2xl blur-sm opacity-75 animate-pulse"></div>
              <div className="relative p-4 bg-gradient-to-br from-emerald-500/90 via-teal-600/90 to-cyan-700/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl">
                <div className="absolute inset-1 bg-gradient-to-br from-white/30 to-transparent rounded-xl"></div>
                <SettingsIcon className="h-10 w-10 text-white relative z-10 drop-shadow-lg" />
              </div>
            </div>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-4">
            Application Settings
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Customize your pyrecycleheat experience with personalized preferences and system configurations.
          </p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-8">
          {/* Display & Theme Settings */}
          <Card className="bg-white/90 backdrop-blur-sm border-emerald-200 shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
                  <Palette className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-emerald-700">Display & Theme</CardTitle>
                  <CardDescription>Customize the visual appearance of the application</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="theme-select" className="text-sm font-medium">Color Theme</Label>
                  <p className="text-sm text-gray-500">Choose your preferred color scheme</p>
                </div>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notifications Settings */}
          <Card className="bg-white/90 backdrop-blur-sm border-teal-200 shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-teal-700">Notifications</CardTitle>
                  <CardDescription>Manage alerts and system notifications</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications" className="text-sm font-medium">Enable Notifications</Label>
                  <p className="text-sm text-gray-500">Receive alerts about system status changes</p>
                </div>
                <Switch
                  id="notifications"
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
            </CardContent>
          </Card>

          {/* Data & Performance Settings */}
          <Card className="bg-white/90 backdrop-blur-sm border-cyan-200 shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
                  <Monitor className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-cyan-700">Data & Performance</CardTitle>
                  <CardDescription>Configure data refresh and performance settings</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-refresh" className="text-sm font-medium">Auto Refresh</Label>
                  <p className="text-sm text-gray-500">Automatically update data in real-time</p>
                </div>
                <Switch
                  id="auto-refresh"
                  checked={autoRefresh}
                  onCheckedChange={setAutoRefresh}
                />
              </div>
              
              {autoRefresh && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Refresh Rate</Label>
                    <span className="text-sm text-gray-500">{refreshRate[0]} seconds</span>
                  </div>
                  <Slider
                    value={refreshRate}
                    onValueChange={setRefreshRate}
                    max={120}
                    min={5}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>5s</span>
                    <span>60s</span>
                    <span>120s</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Management Settings */}
          <Card className="bg-white/90 backdrop-blur-sm border-purple-200 shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                  <Database className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-purple-700">Data Management</CardTitle>
                  <CardDescription>Control data storage and retention policies</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="data-retention" className="text-sm font-medium">Data Retention Period</Label>
                  <p className="text-sm text-gray-500">How long to keep historical data</p>
                </div>
                <Select value={dataRetention} onValueChange={setDataRetention}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security Settings */}
          <Card className="bg-white/90 backdrop-blur-sm border-red-200 shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-red-700">Privacy & Security</CardTitle>
                  <CardDescription>Manage privacy settings and security preferences</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-800 mb-2">Data Privacy</h4>
                <p className="text-sm text-red-700">
                  All data is processed locally and securely. No personal information is transmitted 
                  to external servers without your explicit consent.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="flex justify-center mt-12">
          <Button 
            onClick={handleSaveSettings}
            size="lg"
            className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-700 text-white px-8 py-3 text-lg shadow-xl"
          >
            <Save className="h-5 w-5 mr-2" />
            Save All Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;