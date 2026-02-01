"use client";

import { Wifi } from "lucide-react";
import { useWifi } from "@/lib/wifi-context";

/**
 * WiFi icon fixed at top-left: Red while connecting (with password), Green when connected.
 * Shown when WiFi is enabled and (connecting, or connected, or browser online).
 */
export function WifiStatusIcon() {
  const { wifiEnabled, connectedSSID, isOnline, connecting } = useWifi();
  const showIcon = wifiEnabled && (connecting || connectedSSID || isOnline);

  if (!showIcon) return null;

  const isConnecting = connecting;
  const iconColor = isConnecting ? "text-red-700" : "text-green-700";

  return (
    <div
      className="fixed top-3 left-3 z-[100] flex items-center justify-center rounded-md bg-[#efe6d5]/95 px-2 py-1 shadow-sm border border-[#a89880]"
      aria-label={isConnecting ? "WiFi connecting…" : `WiFi connected${connectedSSID ? ` to ${connectedSSID}` : ""}`}
    >
      <Wifi
        className={`h-6 w-6 font-bold ${iconColor}`}
        strokeWidth={3}
        stroke="currentColor"
        fill="none"
      />
    </div>
  );
}
