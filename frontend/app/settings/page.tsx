"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BackButton } from "@/components/ui/back-button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useFontTheme } from "@/hooks/useFontTheme"
import { useFontSize } from "@/hooks/useFontSize"
import { FontThemePreview } from "@/components/FontThemePreview"

export default function SettingsScreen() {
  const [aiMode, setAIMode] = useState("local")
  const [syncMode, setSyncMode] = useState("usb")
  const { currentTheme, changeTheme, allThemes } = useFontTheme()
  const { currentSize, changeFontSize } = useFontSize()

  return (
    <div className="flex h-screen w-full flex-col bg-gradient-to-b from-[#c9b896] via-[#d4c4a8] to-[#bfae94]">
      <div className="border-b border-[#a89880] bg-[#efe6d5] p-4">
        <div className="flex items-center">
          <BackButton href="/landing" className="mr-2" />
          <h1 className="font-serif text-xl font-medium text-[#3d3225]">Settings</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-2xl space-y-8">
          {/* Font Settings */}
          <div className="space-y-4">
            <h2 className="font-medium text-[#3d3225]">Typography</h2>

            <div className="space-y-4 rounded-md border border-[#a89880] bg-[#f5f0e8] p-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="font-style" className="text-[#3d3225]">Font Style</Label>
                <Select 
                  value={currentTheme} 
                  onValueChange={(value) => changeTheme(value as 'serif' | 'mono')}
                >
                  <SelectTrigger id="font-style" className="w-32 bg-[#efe6d5] border-[#a89880] text-[#3d3225]">
                    <SelectValue placeholder="Select font" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#f5f0e8] border-[#a89880]">
                    <SelectItem value="serif" className="text-[#3d3225] focus:bg-[#e8ddd0]">Serif</SelectItem>
                    <SelectItem value="mono" className="text-[#3d3225] focus:bg-[#e8ddd0]">Monospace</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="font-size" className="text-[#3d3225]">Font Size</Label>
                <Select value={currentSize} onValueChange={changeFontSize}>
                  <SelectTrigger id="font-size" className="w-32 bg-[#efe6d5] border-[#a89880] text-[#3d3225]">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#f5f0e8] border-[#a89880]">
                    <SelectItem value="small" className="text-[#3d3225] focus:bg-[#e8ddd0]">Small</SelectItem>
                    <SelectItem value="medium" className="text-[#3d3225] focus:bg-[#e8ddd0]">Medium</SelectItem>
                    <SelectItem value="large" className="text-[#3d3225] focus:bg-[#e8ddd0]">Large</SelectItem>
                    <SelectItem value="x-large" className="text-[#3d3225] focus:bg-[#e8ddd0]">Extra Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border border-[#a89880] bg-[#efe6d5] p-3">
                <p className="text-sm font-medium text-[#3d3225] mb-2">Current Font</p>
                <p className="text-xs text-[#5a4a3a]">
                  {allThemes && currentTheme ? allThemes[currentTheme]?.name : 'Loading...'} - 
                  {allThemes && currentTheme ? allThemes[currentTheme]?.description : ''}
                </p>
              </div>
            </div>
          </div>

          {/* AI Settings */}
          <div className="space-y-4">
            <h2 className="font-medium text-[#3d3225]">AI Features</h2>

            <div className="space-y-4 rounded-md border border-[#a89880] bg-[#f5f0e8] p-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="ai-mode" className="text-[#3d3225]">AI Processing</Label>
                <Select value={aiMode} onValueChange={setAIMode}>
                  <SelectTrigger id="ai-mode" className="w-32 bg-[#efe6d5] border-[#a89880] text-[#3d3225]">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#f5f0e8] border-[#a89880]">
                    <SelectItem value="local" className="text-[#3d3225] focus:bg-[#e8ddd0]">Local Only</SelectItem>
                    <SelectItem value="cloud" className="text-[#3d3225] focus:bg-[#e8ddd0]">Cloud (Online)</SelectItem>
                    <SelectItem value="hybrid" className="text-[#3d3225] focus:bg-[#e8ddd0]">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="grammar-check" className="text-[#3d3225]">Grammar Check</Label>
                  <p className="text-xs text-[#6b5d4d]">Highlight grammar issues while typing</p>
                </div>
                <Switch id="grammar-check" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="suggestions" className="text-[#3d3225]">Writing Suggestions</Label>
                  <p className="text-xs text-[#6b5d4d]">Show AI-powered writing suggestions</p>
                </div>
                <Switch id="suggestions" />
              </div>
            </div>
          </div>

          {/* Sync Settings */}
          <div className="space-y-4">
            <h2 className="font-medium text-[#3d3225]">Sync & Backup</h2>

            <div className="space-y-4 rounded-md border border-[#a89880] bg-[#f5f0e8] p-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="sync-mode" className="text-[#3d3225]">Sync Method</Label>
                <Select value={syncMode} onValueChange={setSyncMode}>
                  <SelectTrigger id="sync-mode" className="w-32 bg-[#efe6d5] border-[#a89880] text-[#3d3225]">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#f5f0e8] border-[#a89880]">
                    <SelectItem value="usb" className="text-[#3d3225] focus:bg-[#e8ddd0]">USB Only</SelectItem>
                    <SelectItem value="cloud" className="text-[#3d3225] focus:bg-[#e8ddd0]">Cloud Sync</SelectItem>
                    <SelectItem value="local" className="text-[#3d3225] focus:bg-[#e8ddd0]">Local Network</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-backup" className="text-[#3d3225]">Automatic Backups</Label>
                  <p className="text-xs text-[#6b5d4d]">Create backups every 30 minutes</p>
                </div>
                <Switch id="auto-backup" defaultChecked />
              </div>

              <Button variant="outline" size="sm" className="mt-2 border-[#a89880] text-[#3d3225] hover:bg-[#e8ddd0]">
                Backup Now
              </Button>
            </div>
          </div>

          {/* Export Settings */}
          <div className="space-y-4">
            <h2 className="font-medium text-[#3d3225]">Export Preferences</h2>

            <div className="space-y-4 rounded-md border border-[#a89880] bg-[#f5f0e8] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="default-pdf" className="text-[#3d3225]">Default to PDF</Label>
                  <p className="text-xs text-[#6b5d4d]">Use PDF as default export format</p>
                </div>
                <Switch id="default-pdf" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="include-metadata" className="text-[#3d3225]">Include Metadata</Label>
                  <p className="text-xs text-[#6b5d4d]">Add creation date and tags to exports</p>
                </div>
                <Switch id="include-metadata" defaultChecked />
              </div>
            </div>
          </div>

          {/* Font Preview */}
          <div className="space-y-4">
            <h2 className="font-medium text-[#3d3225]">Font Preview</h2>
            <FontThemePreview />
          </div>
        </div>
      </div>
    </div>
  )
}
