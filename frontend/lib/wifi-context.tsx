"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { fetchWifiNetworks, fetchWifiStatus, connectWifi } from "./wifi-api";

const WIFI_ENABLED_KEY = "tagore_wifi_enabled";
const LAST_CONNECTED_SSID_KEY = "tagore_wifi_last_ssid";

interface WifiContextType {
  wifiEnabled: boolean;
  setWifiEnabled: (v: boolean) => void;
  networks: string[];
  connectedSSID: string | null;
  isOnline: boolean;
  scanError: string | null;
  scanNetworks: () => Promise<void>;
  connect: (ssid: string, password: string) => Promise<void>;
  refreshStatus: () => Promise<void>;
  connecting: boolean;
  connectError: string | null;
}

const WifiContext = createContext<WifiContextType | undefined>(undefined);

export function WifiProvider({ children }: { children: React.ReactNode }) {
  const [wifiEnabled, setWifiEnabledState] = useState(false);
  const [networks, setNetworks] = useState<string[]>([]);
  const [connectedSSID, setConnectedSSID] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  const setWifiEnabled = useCallback((v: boolean) => {
    setWifiEnabledState(v);
    if (typeof window !== "undefined") {
      localStorage.setItem(WIFI_ENABLED_KEY, v ? "1" : "0");
    }
  }, []);

  const refreshStatus = useCallback(async () => {
    try {
      const status = await fetchWifiStatus();
      setConnectedSSID(status.connected_ssid || null);
      if (typeof navigator !== "undefined") {
        setIsOnline(navigator.onLine);
      }
      if (status.connected_ssid && typeof window !== "undefined") {
        localStorage.setItem(LAST_CONNECTED_SSID_KEY, status.connected_ssid);
      }
    } catch {
      setConnectedSSID(null);
      if (typeof navigator !== "undefined") setIsOnline(navigator.onLine);
    }
  }, []);

  const scanNetworks = useCallback(async () => {
    setScanError(null);
    try {
      const data = await fetchWifiNetworks();
      setNetworks(data.networks || []);
      if (data.error) setScanError(data.error);
    } catch (e) {
      setNetworks([]);
      setScanError(e instanceof Error ? e.message : "Failed to scan networks");
    }
  }, []);

  const connect = useCallback(async (ssid: string, password: string) => {
    setConnectError(null);
    setConnecting(true);
    try {
      await connectWifi(ssid, password);
      if (typeof window !== "undefined") {
        localStorage.setItem(LAST_CONNECTED_SSID_KEY, ssid);
      }
      setConnectedSSID(ssid);
      setIsOnline(true);
      await refreshStatus();
    } catch (e) {
      setConnectError(e instanceof Error ? e.message : "Connection failed");
      throw e;
    } finally {
      setConnecting(false);
    }
  }, [refreshStatus]);

  // Load persisted wifi enabled on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(WIFI_ENABLED_KEY);
    setWifiEnabledState(saved === "1");
    const lastSsid = localStorage.getItem(LAST_CONNECTED_SSID_KEY);
    if (lastSsid) setConnectedSSID(lastSsid);
  }, []);

  // Online/offline listener
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // When WiFi is enabled, poll status and optionally scan
  useEffect(() => {
    if (!wifiEnabled) return;
    refreshStatus();
    const t = setInterval(refreshStatus, 8000);
    return () => clearInterval(t);
  }, [wifiEnabled, refreshStatus]);

  const value: WifiContextType = {
    wifiEnabled,
    setWifiEnabled,
    networks,
    connectedSSID,
    isOnline,
    scanError,
    scanNetworks,
    connect,
    refreshStatus,
    connecting,
    connectError,
  };

  return <WifiContext.Provider value={value}>{children}</WifiContext.Provider>;
}

export function useWifi(): WifiContextType {
  const ctx = useContext(WifiContext);
  if (ctx === undefined) {
    throw new Error("useWifi must be used within WifiProvider");
  }
  return ctx;
}
