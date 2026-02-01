"use client";

import { BackButton } from "@/components/ui/back-button";

export default function NotificationsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#c9b896] via-[#d4c4a8] to-[#bfae94]">
      <div className="flex-shrink-0 border-b border-[#a89880] bg-[#efe6d5] p-4">
        <div className="flex items-center">
          <BackButton className="mr-2" />
          <h1 className="font-serif text-xl font-medium text-[#3d3225]">Notifications</h1>
        </div>
      </div>
      <div className="flex-1 p-6">
        <p className="text-[#4a3f32]">View recent alerts, updates, and reminders here.</p>
      </div>
    </div>
  );
}