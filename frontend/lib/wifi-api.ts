const API_BASE = typeof window !== "undefined" ? "http://localhost:8000" : "";

export interface WifiNetworksResponse {
  networks: string[];
  error: string | null;
}

export interface WifiStatusResponse {
  connected_ssid: string | null;
  connected: boolean;
  error: string | null;
}

export interface WifiConnectResponse {
  success: boolean;
  ssid: string;
}

export async function fetchWifiNetworks(): Promise<WifiNetworksResponse> {
  const res = await fetch(`${API_BASE}/api/wifi/networks`);
  if (!res.ok) throw new Error("Failed to fetch networks");
  return res.json();
}

export async function fetchWifiStatus(): Promise<WifiStatusResponse> {
  const res = await fetch(`${API_BASE}/api/wifi/status`);
  if (!res.ok) return { connected_ssid: null, connected: false, error: null };
  return res.json();
}

const CONNECT_TIMEOUT_MS = 60000; // 60s - backend add profile + connect can take a long time

export async function connectWifi(ssid: string, password: string): Promise<WifiConnectResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CONNECT_TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE}/api/wifi/connect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ssid: ssid.trim(), password: password || "" }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = Array.isArray(data.detail) ? data.detail[0]?.msg : data.detail ?? data.error;
      throw new Error(typeof msg === "string" ? msg : "Connection failed");
    }
    return data;
  } catch (e) {
    clearTimeout(timeoutId);
    if (e instanceof Error) {
      if (e.name === "AbortError") {
        throw new Error("Connection timed out. The server is taking too long—try again.");
      }
      if (e.message === "Failed to fetch" || e.message.includes("fetch")) {
        throw new Error("Could not reach the server. Is the backend running on port 8000? Check the terminal.");
      }
      throw e;
    }
    throw new Error("Connection failed");
  }
}
