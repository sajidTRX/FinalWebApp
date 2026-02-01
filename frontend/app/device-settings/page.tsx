"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Monitor,
  Sparkles,
  Lock,
  HardDrive,
  Info,
  Globe,
  Fingerprint,
  Wifi,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useFontTheme } from "@/hooks/useFontTheme";
import { useEditorSettings, EDITOR_FONT_SIZES } from "@/lib/editor-settings-context";
import { useWifi } from "@/lib/wifi-context";

// Removed language update helper

const updateTimezone = (timezone: string) => {
  // Mock implementation for timezone adjustment
  console.log(`Timezone set to: ${timezone}`);
  const now = new Date();
  const offset = parseInt(timezone.replace("utc", "")) * 60;
  const adjustedTime = new Date(now.getTime() + offset * 60000);
  console.log(`Adjusted time: ${adjustedTime.toISOString()}`);
};

export default function DeviceSettingsScreen() {
  const router = useRouter();
  const { currentTheme, changeTheme, allThemes } = useFontTheme();
  const { settings, updateFontSize } = useEditorSettings();
  const [deviceName, setDeviceName] = useState("Tagore Writer");
  const [autoTime, setAutoTime] = useState(true);
  // Removed language state
  const [timezone, setTimezone] = useState("utc-8");
  // Removed refreshRate and fontFamily settings (E Ink Refresh Rate & Font Type controls)
  const [brightness, setBrightness] = useState(70);
  const [grammarChecker, setGrammarChecker] = useState(true);
  const [paraphrasingTools, setParaphrasingTools] = useState(true);
  const [aiCharacterHelper, setAiCharacterHelper] = useState(true);
  const [aiTone, setAiTone] = useState("creative");
  const [summarizationLength, setSummarizationLength] = useState("medium");
  const [autoLock, setAutoLock] = useState(true);
  const [autoLockTime, setAutoLockTime] = useState("5min");
  const [exportFormat, setExportFormat] = useState("pdf");
  const [exportLocation, setExportLocation] = useState("internal");
  const [cloudSync, setCloudSync] = useState(false);
  const {
    wifiEnabled,
    setWifiEnabled,
    networks: wifiNetworks,
    connectedSSID: currentConnectedSSID,
    scanNetworks,
    scanError: wifiScanError,
    connect: wifiConnect,
    connecting: wifiConnecting,
    connectError: wifiConnectError,
    refreshStatus,
  } = useWifi();
  const [selectedNetwork, setSelectedNetwork] = useState("");
  const [password, setPassword] = useState("");
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    // On mount just apply timezone (language feature removed)
    updateTimezone(timezone);
  }, []);

  useEffect(() => {
    updateTimezone(timezone);
  }, [timezone]);

  useEffect(() => {
    // Adjust brightness by setting a CSS variable
    document.documentElement.style.setProperty(
      "--brightness",
      `${brightness}%`
    );
  }, [brightness]);

  useEffect(() => {
    // Load saved brightness from local storage on mount
    const savedBrightness = localStorage.getItem("brightness");
    if (savedBrightness) {
      setBrightness(parseInt(savedBrightness, 10));
    }
  }, []);

  useEffect(() => {
    // Save brightness to local storage whenever it changes
    localStorage.setItem("brightness", brightness.toString());
  }, [brightness]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      console.log(`Key pressed: ${event.key}, Ctrl: ${event.ctrlKey}`); // Debugging log
      if (event.ctrlKey && event.key.toLowerCase() === "b") {
        event.preventDefault(); // Prevent default browser behavior
        router.back(); // Navigate back
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [router]);

  // When WiFi is enabled, scan for networks and refresh current connection status
  useEffect(() => {
    if (!wifiEnabled) return;
    refreshStatus();
    setScanning(true);
    scanNetworks().finally(() => setScanning(false));
    const t = setInterval(() => {
      refreshStatus();
      setScanning(true);
      scanNetworks().finally(() => setScanning(false));
    }, 5000);
    return () => clearInterval(t);
  }, [wifiEnabled, scanNetworks, refreshStatus]);

  const handleConnect = async () => {
    if (!selectedNetwork) {
      alert("Please select a network.");
      return;
    }
    try {
      await wifiConnect(selectedNetwork, password);
      await refreshStatus();
      setPassword("");
      setSelectedNetwork("");
      alert(`Connected to ${selectedNetwork}`);
    } catch {
      // Error already set in context (wifiConnectError)
    }
  };

  return (
    <div className="flex h-screen w-full flex-col bg-gradient-to-b from-[#c9b896] via-[#d4c4a8] to-[#bfae94]">
      <div className="border-b border-[#a89880] bg-[#efe6d5] p-4">
        <div className="flex items-center">
          <BackButton className="mr-2" />
          <h1 className="font-serif text-xl font-medium text-[#3d3225]">
            Device Settings
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-3xl space-y-8">
          <Tabs defaultValue="general">
            <TabsList className="grid grid-cols-9 md:grid-cols-9 bg-[#d4c4a8]">
              <TabsTrigger value="general" className="data-[state=active]:bg-[#efe6d5] data-[state=active]:text-[#3d3225]">General</TabsTrigger>
              <TabsTrigger value="wifi" className="data-[state=active]:bg-[#efe6d5] data-[state=active]:text-[#3d3225]">WiFi</TabsTrigger>
              <TabsTrigger value="display" className="data-[state=active]:bg-[#efe6d5] data-[state=active]:text-[#3d3225]">Display</TabsTrigger>
              <TabsTrigger value="ai" className="data-[state=active]:bg-[#efe6d5] data-[state=active]:text-[#3d3225]">AI</TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-[#efe6d5] data-[state=active]:text-[#3d3225]">Security</TabsTrigger>
              <TabsTrigger value="storage" className="data-[state=active]:bg-[#efe6d5] data-[state=active]:text-[#3d3225]">Storage</TabsTrigger>
              <TabsTrigger value="about" className="data-[state=active]:bg-[#efe6d5] data-[state=active]:text-[#3d3225]">About</TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general" className="space-y-4">
              <Card className="bg-[#f5f0e8] border-[#a89880]">
                <CardHeader>
                  <CardTitle className="flex items-center text-[#3d3225]">
                    <Globe className="mr-2 h-5 w-5" />
                    General Settings
                  </CardTitle>
                  <CardDescription className="text-[#6b5d4d]">
                    Configure basic device settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="device-name" className="text-[#3d3225]">Device Name</Label>
                    <Input
                      id="device-name"
                      value={deviceName}
                      onChange={(e) => setDeviceName(e.target.value)}
                      placeholder="Enter device name"
                      className="bg-[#efe6d5] border-[#a89880] text-[#3d3225]"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-time" className="text-[#3d3225]">Auto-sync Date & Time</Label>
                      <p className="text-xs text-[#6b5d4d]">
                        Automatically sync time with network
                      </p>
                    </div>
                    <Switch
                      id="auto-time"
                      checked={autoTime}
                      onCheckedChange={setAutoTime}
                    />
                  </div>

                  {!autoTime && (
                    <div className="space-y-2">
                      <Label htmlFor="manual-time" className="text-[#3d3225]">Manual Date & Time</Label>
                      <Input id="manual-time" type="datetime-local" className="bg-[#efe6d5] border-[#a89880] text-[#3d3225]" />
                    </div>
                  )}

                  {/* Language selector removed */}

                  <div className="space-y-2">
                    <Label htmlFor="timezone" className="text-[#3d3225]">Timezone</Label>
                    <Select value={timezone} onValueChange={setTimezone}>
                      <SelectTrigger className="bg-[#efe6d5] border-[#a89880] text-[#3d3225]">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#f5f0e8] border-[#a89880]">
                        <SelectItem value="utc-12" className="text-[#3d3225] focus:bg-[#e8ddd0]">UTC-12:00</SelectItem>
                        <SelectItem value="utc-8" className="text-[#3d3225] focus:bg-[#e8ddd0]">UTC-08:00 (PST)</SelectItem>
                        <SelectItem value="utc-5" className="text-[#3d3225] focus:bg-[#e8ddd0]">UTC-05:00 (EST)</SelectItem>
                        <SelectItem value="utc+0" className="text-[#3d3225] focus:bg-[#e8ddd0]">UTC+00:00 (GMT)</SelectItem>
                        <SelectItem value="utc+1" className="text-[#3d3225] focus:bg-[#e8ddd0]">UTC+01:00 (CET)</SelectItem>
                        <SelectItem value="utc+8" className="text-[#3d3225] focus:bg-[#e8ddd0]">UTC+08:00 (CST)</SelectItem>
                        <SelectItem value="utc+9" className="text-[#3d3225] focus:bg-[#e8ddd0]">UTC+09:00 (JST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Display Settings */}
            <TabsContent value="display" className="space-y-4">
              <Card className="bg-[#f5f0e8] border-[#a89880]">
                <CardHeader>
                  <CardTitle className="flex items-center text-[#3d3225]">
                    <Monitor className="mr-2 h-5 w-5" />
                    Display Settings
                  </CardTitle>
                  <CardDescription className="text-[#6b5d4d]">
                    Configure screen and visual preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Removed E Ink Refresh Rate and Font Type controls */}

                  <div className="space-y-2">
                    <Label htmlFor="font-theme" className="text-[#3d3225]">Font Style</Label>
                    <Select 
                      value={currentTheme} 
                      onValueChange={(value) => changeTheme(value as 'serif' | 'mono')}
                    >
                      <SelectTrigger id="font-theme" className="bg-[#efe6d5] border-[#a89880] text-[#3d3225]">
                        <SelectValue placeholder="Select font style" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#f5f0e8] border-[#a89880]">
                        <SelectItem value="serif" className="text-[#3d3225] focus:bg-[#e8ddd0]">Serif (Georgia, Garamond, Times New Roman)</SelectItem>
                        <SelectItem value="mono" className="text-[#3d3225] focus:bg-[#e8ddd0]">Monospace (Courier New, Monaco, Consolas)</SelectItem>
                      </SelectContent>
                    </Select>
                    {allThemes && currentTheme && (
                      <p className="text-xs text-[#6b5d4d] mt-1">
                        Current: {allThemes[currentTheme]?.name} - {allThemes[currentTheme]?.description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="font-size" className="text-[#3d3225]">Font Size</Label>
                    <Select value={settings.fontSize} onValueChange={(value) => updateFontSize(value as 'small' | 'medium' | 'large')}>
                      <SelectTrigger className="bg-[#efe6d5] border-[#a89880] text-[#3d3225]">
                        <SelectValue placeholder="Select font size" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#f5f0e8] border-[#a89880]">
                        <SelectItem value="small" className="text-[#3d3225] focus:bg-[#e8ddd0]">Small (14px)</SelectItem>
                        <SelectItem value="medium" className="text-[#3d3225] focus:bg-[#e8ddd0]">Medium (16px)</SelectItem>
                        <SelectItem value="large" className="text-[#3d3225] focus:bg-[#e8ddd0]">Large (20px)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-[#6b5d4d]">
                      Preview: <span style={{ fontSize: `${EDITOR_FONT_SIZES[settings.fontSize]}px` }}>Sample Text</span>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="brightness" className="text-[#3d3225]">Brightness</Label>
                      <span className="text-sm text-[#6b5d4d]">
                        {brightness}%
                      </span>
                    </div>
                    <Slider
                      id="brightness"
                      min={0}
                      max={100}
                      step={1}
                      value={[brightness]}
                      onValueChange={(value) => setBrightness(value[0])}
                      className="[&_[role=slider]]:bg-[#4a3f32]"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI & Assistance */}
            <TabsContent value="ai" className="space-y-4">
              <Card className="bg-[#f5f0e8] border-[#a89880]">
                <CardHeader>
                  <CardTitle className="flex items-center text-[#3d3225]">
                    <Sparkles className="mr-2 h-5 w-5" />
                    AI & Assistance
                  </CardTitle>
                  <CardDescription className="text-[#6b5d4d]">
                    Configure AI writing tools and assistance features
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="grammar-checker" className="text-[#3d3225]">Grammar Checker</Label>
                      <p className="text-xs text-[#6b5d4d]">
                        Highlight grammar issues while typing
                      </p>
                    </div>
                    <Switch
                      id="grammar-checker"
                      checked={grammarChecker}
                      onCheckedChange={setGrammarChecker}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="paraphrasing" className="text-[#3d3225]">Paraphrasing Tools</Label>
                      <p className="text-xs text-[#6b5d4d]">
                        Enable text rewriting suggestions
                      </p>
                    </div>
                    <Switch
                      id="paraphrasing"
                      checked={paraphrasingTools}
                      onCheckedChange={setParaphrasingTools}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="ai-character" className="text-[#3d3225]">
                        AI Character/Plot Helper
                      </Label>
                      <p className="text-xs text-[#6b5d4d]">
                        Enable AI-powered creative writing assistance
                      </p>
                    </div>
                    <Switch
                      id="ai-character"
                      checked={aiCharacterHelper}
                      onCheckedChange={setAiCharacterHelper}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ai-tone" className="text-[#3d3225]">AI Tone</Label>
                    <Select value={aiTone} onValueChange={setAiTone}>
                      <SelectTrigger className="bg-[#efe6d5] border-[#a89880] text-[#3d3225]">
                        <SelectValue placeholder="Select AI tone" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#f5f0e8] border-[#a89880]">
                        <SelectItem value="creative" className="text-[#3d3225] focus:bg-[#e8ddd0]">Creative</SelectItem>
                        <SelectItem value="formal" className="text-[#3d3225] focus:bg-[#e8ddd0]">Formal</SelectItem>
                        <SelectItem value="academic" className="text-[#3d3225] focus:bg-[#e8ddd0]">Academic</SelectItem>
                        <SelectItem value="casual" className="text-[#3d3225] focus:bg-[#e8ddd0]">Casual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="summarization" className="text-[#3d3225]">Summarization Length</Label>
                    <Select
                      value={summarizationLength}
                      onValueChange={setSummarizationLength}
                    >
                      <SelectTrigger className="bg-[#efe6d5] border-[#a89880] text-[#3d3225]">
                        <SelectValue placeholder="Select summarization length" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#f5f0e8] border-[#a89880]">
                        <SelectItem value="short" className="text-[#3d3225] focus:bg-[#e8ddd0]">
                          Short (1 paragraph)
                        </SelectItem>
                        <SelectItem value="medium" className="text-[#3d3225] focus:bg-[#e8ddd0]">
                          Medium (2-3 paragraphs)
                        </SelectItem>
                        <SelectItem value="long" className="text-[#3d3225] focus:bg-[#e8ddd0]">
                          Long (4+ paragraphs)
                        </SelectItem>
                        <SelectItem value="bullet" className="text-[#3d3225] focus:bg-[#e8ddd0]">Bullet Points</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security */}
            <TabsContent value="security" className="space-y-4">
              <Card className="bg-[#f5f0e8] border-[#a89880]">
                <CardHeader>
                  <CardTitle className="flex items-center text-[#3d3225]">
                    <Lock className="mr-2 h-5 w-5" />
                    Security
                  </CardTitle>
                  <CardDescription className="text-[#6b5d4d]">
                    Configure security and privacy settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full border-[#a89880] text-[#3d3225] hover:bg-[#e8ddd0]">
                      Change PIN
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Fingerprint className="h-4 w-4 text-[#4a3f32]" />
                        <Label className="text-[#3d3225]">Fingerprint Authentication</Label>
                      </div>
                      <Button variant="outline" size="sm" className="border-[#a89880] text-[#3d3225] hover:bg-[#e8ddd0]">
                        Manage
                      </Button>
                    </div>
                  </div>

                  <Separator className="my-2 bg-[#a89880]" />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-lock" className="text-[#3d3225]">Session Auto-Lock</Label>
                      <p className="text-xs text-[#6b5d4d]">
                        Lock device after period of inactivity
                      </p>
                    </div>
                    <Switch
                      id="auto-lock"
                      checked={autoLock}
                      onCheckedChange={setAutoLock}
                    />
                  </div>

                  {autoLock && (
                    <div className="space-y-2">
                      <Label htmlFor="auto-lock-time" className="text-[#3d3225]">Auto-Lock After</Label>
                      <Select
                        value={autoLockTime}
                        onValueChange={setAutoLockTime}
                      >
                        <SelectTrigger className="bg-[#efe6d5] border-[#a89880] text-[#3d3225]">
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#f5f0e8] border-[#a89880]">
                          <SelectItem value="1min" className="text-[#3d3225] focus:bg-[#e8ddd0]">1 minute</SelectItem>
                          <SelectItem value="5min" className="text-[#3d3225] focus:bg-[#e8ddd0]">5 minutes</SelectItem>
                          <SelectItem value="15min" className="text-[#3d3225] focus:bg-[#e8ddd0]">15 minutes</SelectItem>
                          <SelectItem value="30min" className="text-[#3d3225] focus:bg-[#e8ddd0]">30 minutes</SelectItem>
                          <SelectItem value="1hour" className="text-[#3d3225] focus:bg-[#e8ddd0]">1 hour</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Export & Storage */}
            <TabsContent value="storage" className="space-y-4">
              <Card className="bg-[#f5f0e8] border-[#a89880]">
                <CardHeader>
                  <CardTitle className="flex items-center text-[#3d3225]">
                    <HardDrive className="mr-2 h-5 w-5" />
                    Export & Storage
                  </CardTitle>
                  <CardDescription className="text-[#6b5d4d]">
                    Configure export preferences and manage storage
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="export-format" className="text-[#3d3225]">Default Export Format</Label>
                    <Select
                      value={exportFormat}
                      onValueChange={setExportFormat}
                    >
                      <SelectTrigger className="bg-[#efe6d5] border-[#a89880] text-[#3d3225]">
                        <SelectValue placeholder="Select export format" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#f5f0e8] border-[#a89880]">
                        <SelectItem value="pdf" className="text-[#3d3225] focus:bg-[#e8ddd0]">PDF Document</SelectItem>
                        <SelectItem value="epub" className="text-[#3d3225] focus:bg-[#e8ddd0]">ePub (eBook)</SelectItem>
                        <SelectItem value="docx" className="text-[#3d3225] focus:bg-[#e8ddd0]">Word Document</SelectItem>
                        <SelectItem value="txt" className="text-[#3d3225] focus:bg-[#e8ddd0]">Plain Text</SelectItem>
                        <SelectItem value="md" className="text-[#3d3225] focus:bg-[#e8ddd0]">Markdown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="export-location" className="text-[#3d3225]">Export Location</Label>
                    <Select
                      value={exportLocation}
                      onValueChange={setExportLocation}
                    >
                      <SelectTrigger className="bg-[#efe6d5] border-[#a89880] text-[#3d3225]">
                        <SelectValue placeholder="Select export location" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#f5f0e8] border-[#a89880]">
                        <SelectItem value="internal" className="text-[#3d3225] focus:bg-[#e8ddd0]">
                          Internal Storage
                        </SelectItem>
                        <SelectItem value="sd" className="text-[#3d3225] focus:bg-[#e8ddd0]">SD Card</SelectItem>
                        <SelectItem value="usb" className="text-[#3d3225] focus:bg-[#e8ddd0]">
                          USB Drive (when connected)
                        </SelectItem>
                        <SelectItem value="cloud" className="text-[#3d3225] focus:bg-[#e8ddd0]">Cloud Storage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#3d3225]">Storage Usage</Label>
                    <div className="h-4 overflow-hidden rounded-full bg-[#d4c4a8]">
                      <div className="h-full w-3/4 bg-[#4a3f32]"></div>
                    </div>
                    <div className="flex justify-between text-xs text-[#6b5d4d]">
                      <span>Used: 6.2 GB</span>
                      <span>Available: 1.8 GB</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="cloud-sync" className="text-[#3d3225]">Cloud Sync</Label>
                      <p className="text-xs text-[#6b5d4d]">
                        Automatically sync files to cloud storage
                      </p>
                    </div>
                    <Switch
                      id="cloud-sync"
                      checked={cloudSync}
                      onCheckedChange={setCloudSync}
                    />
                  </div>

                  <Button variant="outline" className="w-full border-[#a89880] text-[#3d3225] hover:bg-[#e8ddd0]">
                    Manage Storage
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* WiFi Settings */}
            <TabsContent value="wifi" className="space-y-4">
              <Card className="bg-[#f5f0e8] border-[#a89880]">
                <CardHeader>
                  <CardTitle className="flex items-center text-[#3d3225]">
                    <Wifi className="mr-2 h-5 w-5" />
                    WiFi Settings
                  </CardTitle>
                  <CardDescription className="text-[#6b5d4d]">Configure WiFi connectivity. Real-time scan when enabled.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="wifi-enabled" className="text-[#3d3225]">Enable WiFi</Label>
                    </div>
                    <Switch
                      id="wifi-enabled"
                      checked={wifiEnabled}
                      onCheckedChange={setWifiEnabled}
                    />
                  </div>

                  {wifiEnabled && (
                    <div className="space-y-4">
                      {currentConnectedSSID && (
                        <div className="rounded-md border border-[#a89880] bg-[#efe6d5] px-3 py-2">
                          <p className="text-xs font-medium text-[#6b5d4d]">Currently connected</p>
                          <p className="text-sm font-semibold text-[#3d3225]">{currentConnectedSSID}</p>
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Label
                            htmlFor="network"
                            className="block text-sm font-medium text-[#3d3225]"
                          >
                            Available Networks
                          </Label>
                          {scanning && (
                            <Loader2 className="h-4 w-4 animate-spin text-[#6b5d4d]" aria-hidden />
                          )}
                        </div>
                        <Select
                          value={selectedNetwork}
                          onValueChange={setSelectedNetwork}
                        >
                          <SelectTrigger className="bg-[#efe6d5] border-[#a89880] text-[#3d3225]">
                            <SelectValue placeholder={scanning ? "Scanning..." : "Select a network"} />
                          </SelectTrigger>
                          <SelectContent className="bg-[#f5f0e8] border-[#a89880]">
                            {wifiNetworks.map((network, index) => (
                              <SelectItem key={index} value={network} className="text-[#3d3225] focus:bg-[#e8ddd0]">
                                {network}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {wifiScanError && (
                          <p className="text-xs text-amber-700 mt-1">{wifiScanError}</p>
                        )}
                      </div>

                      <div>
                        <Label
                          htmlFor="password"
                          className="block text-sm font-medium text-[#3d3225] mb-1"
                        >
                          Password (leave blank if open)
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter network password"
                          className="bg-[#efe6d5] border-[#a89880] text-[#3d3225]"
                        />
                      </div>

                      {wifiConnectError && (
                        <p className="text-xs text-red-700">{wifiConnectError}</p>
                      )}

                      <Button
                        onClick={handleConnect}
                        disabled={wifiConnecting || !selectedNetwork}
                        className="px-4 py-2 bg-[#4a3f32] text-[#efe6d5] rounded-md shadow-sm hover:bg-[#3d3225] focus:outline-none focus:ring-2 focus:ring-[#6b5d4d] focus:ring-offset-2 disabled:opacity-50"
                      >
                        {wifiConnecting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          "Connect"
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* About */}
            <TabsContent value="about" className="space-y-4">
              <Card className="bg-[#f5f0e8] border-[#a89880]">
                <CardHeader>
                  <CardTitle className="flex items-center text-[#3d3225]">
                    <Info className="mr-2 h-5 w-5" />
                    About Device
                  </CardTitle>
                  <CardDescription className="text-[#6b5d4d]">
                    View device information and credits
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-[#6b5d4d]">
                        Device Model
                      </span>
                      <span className="text-sm text-[#3d3225]">
                        Tagore Writer Pro
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-[#6b5d4d]">
                        OS Version
                      </span>
                      <span className="text-sm text-[#3d3225]">
                        Sonzaikan OS 1.2.4
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-[#6b5d4d]">
                        Serial Number
                      </span>
                      <span className="text-sm text-[#3d3225]">
                        TGR-2023-78542169
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-[#6b5d4d]">
                        Build Number
                      </span>
                      <span className="text-sm text-[#3d3225]">
                        20230915-1842
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-[#6b5d4d]">
                        Hardware Version
                      </span>
                      <span className="text-sm text-[#3d3225]">Rev. B</span>
                    </div>
                  </div>

                  <Separator className="my-2 bg-[#a89880]" />

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-[#3d3225]">
                      Developer Credits
                    </h3>
                    <p className="text-xs text-[#5a4a3a]">
                      Sonzaikan OS was developed by the Tagore Project team,
                      with contributions from the open-source community.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-[#3d3225]">
                      Open Source Licenses
                    </h3>
                    <Button variant="outline" size="sm" className="w-full border-[#a89880] text-[#3d3225] hover:bg-[#e8ddd0]">
                      View Licenses
                    </Button>
                  </div>

                  <div className="mt-4 text-center text-xs text-[#6b5d4d]">
                    <p>© 2023 Tagore Project. All rights reserved.</p>
                    <p className="mt-1">
                      Made with ♥ for writers and thinkers.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
