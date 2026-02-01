"""
WiFi manager: scan networks, get status, and connect (Windows via netsh).
On non-Windows or if netsh fails, returns empty/safe responses for the UI.
"""
import subprocess
import sys
import re
import tempfile
import os


def _is_windows():
    return sys.platform == "win32"


def scan_networks():
    """
    Return list of SSIDs from the system.
    Windows: netsh wlan show networks
    Other OS: returns empty list (browser/OS security limits).
    """
    if not _is_windows():
        return {"networks": [], "error": "WiFi scan is only supported on Windows."}

    try:
        out = subprocess.run(
            ["netsh", "wlan", "show", "networks"],
            capture_output=True,
            text=True,
            timeout=15,
            creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == "win32" else 0,
        )
        if out.returncode != 0:
            return {"networks": [], "error": out.stderr or "Failed to scan networks."}

        lines = (out.stdout or "").replace("\r", "").split("\n")
        ssids = []
        for line in lines:
            # Format: "SSID 1 : MyNetwork" or "SSID 2 : Another"
            if "SSID" in line and ":" in line:
                part = line.split(":", 1)[-1].strip()
                if part and part not in ssids:
                    ssids.append(part)
        return {"networks": ssids, "error": None}
    except subprocess.TimeoutExpired:
        return {"networks": [], "error": "Scan timed out."}
    except Exception as e:
        return {"networks": [], "error": str(e)}


def get_status():
    """
    Return current WiFi connection status: connected SSID if any, and online flag.
    Windows: netsh wlan show interfaces
    """
    if not _is_windows():
        return {"connected_ssid": None, "connected": False, "error": None}

    try:
        out = subprocess.run(
            ["netsh", "wlan", "show", "interfaces"],
            capture_output=True,
            text=True,
            timeout=10,
            creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == "win32" else 0,
        )
        if out.returncode != 0:
            return {"connected_ssid": None, "connected": False, "error": None}

        text = (out.stdout or "").replace("\r", "")
        # Look for "Name : ..." (SSID) and "State : connected"
        connected_ssid = None
        state = None
        for line in text.split("\n"):
            line = line.strip()
            if line.startswith("SSID"):
                # "SSID                   : MyNetwork"
                m = re.search(r"SSID\s*:\s*(.+)", line, re.IGNORECASE)
                if m:
                    connected_ssid = m.group(1).strip()
            if "State" in line and ":" in line:
                state = line.split(":", 1)[-1].strip().lower()

        connected = state == "connected" and bool(connected_ssid)
        return {
            "connected_ssid": connected_ssid if connected else None,
            "connected": connected,
            "error": None,
        }
    except Exception as e:
        return {"connected_ssid": None, "connected": False, "error": str(e)}


def _wpa2_profile_xml(ssid: str, password: str) -> str:
    """Generate WLAN profile XML for WPA2-PSK (Windows)."""
    # Escape for XML
    def esc(s: str) -> str:
        return (
            s.replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace('"', "&quot;")
            .replace("'", "&apos;")
        )

    ssid_esc = esc(ssid)
    pass_esc = esc(password)
    return f"""<?xml version="1.0"?>
<WLANProfile xmlns="http://www.microsoft.com/networking/WLAN/profile/v1">
  <name>{ssid_esc}</name>
  <SSIDConfig>
    <SSID>
      <name>{ssid_esc}</name>
    </SSID>
  </SSIDConfig>
  <connectionType>ESS</connectionType>
  <connectionMode>auto</connectionMode>
  <MSM>
    <security>
      <authEncryption>
        <authentication>WPA2PSK</authentication>
        <encryption>AES</encryption>
        <useOneX>false</useOneX>
      </authEncryption>
      <sharedKey>
        <keyType>passPhrase</keyType>
        <protected>false</protected>
        <keyMaterial>{pass_esc}</keyMaterial>
      </sharedKey>
    </security>
  </MSM>
</WLANProfile>"""


def _run_netsh(args: list, timeout: int = 15) -> tuple[int, str, str]:
    """Run netsh; returns (returncode, stdout, stderr)."""
    flags = subprocess.CREATE_NO_WINDOW if sys.platform == "win32" else 0
    out = subprocess.run(
        ["netsh", "wlan"] + args,
        capture_output=True,
        text=True,
        timeout=timeout,
        creationflags=flags,
    )
    return (out.returncode, out.stdout or "", out.stderr or "")


def connect(ssid: str, password: str | None = None):
    """
    Try to connect to the given SSID. First tries connect (works if profile
    already exists). If that fails and password is provided, adds a WPA2
    profile then connects. Adding a profile may require running as Administrator.
    """
    if not _is_windows():
        return {"success": False, "error": "WiFi connect is only supported on Windows."}

    ssid = (ssid or "").strip()
    if not ssid:
        return {"success": False, "error": "SSID is required."}

    try:
        # 1) Try connect first (works if network was already saved on this PC)
        code, _, stderr = _run_netsh(["connect", f"name={ssid}"])
        if code == 0:
            return {"success": True, "error": None}

        # 2) If we have a password, add or update profile then connect
        if password is not None and password.strip():
            xml = _wpa2_profile_xml(ssid, password.strip())
            fd, path = tempfile.mkstemp(suffix=".xml")
            try:
                with os.fdopen(fd, "w", encoding="utf-8") as f:
                    f.write(xml)
                # Try with interface=* so all interfaces get the profile
                add_code, _, add_stderr = _run_netsh(
                    ["add", "profile", f"filename={path}", "interface=*", "user=current"]
                )
                if add_code != 0:
                    err_lower = add_stderr.lower()
                    if "already exists" in err_lower:
                        # Profile exists; overwrite by deleting then re-adding
                        _run_netsh(["delete", "profile", f'name="{ssid}"'])
                        add_code2, _, add_stderr2 = _run_netsh(
                            ["add", "profile", f"filename={path}", "interface=*", "user=current"]
                        )
                        if add_code2 != 0:
                            add_stderr = add_stderr2
                            add_code = add_code2
                    if add_code != 0:
                        admin_hint = (
                            "Adding a new WiFi network requires Administrator rights. "
                            "Close this app, then right-click Command Prompt or PowerShell → "
                            "'Run as administrator', go to the backend folder, and run: python main.py"
                        )
                        return {
                            "success": False,
                            "error": admin_hint,
                        }
            finally:
                try:
                    os.unlink(path)
                except OSError:
                    pass

            # Connect after adding profile
            code, _, stderr = _run_netsh(["connect", f"name={ssid}"])
            if code != 0:
                return {
                    "success": False,
                    "error": stderr or "Connection failed. Check password and try again.",
                }
            return {"success": True, "error": None}
        else:
            # No password and connect failed
            return {
                "success": False,
                "error": stderr or "Network not in saved list. Enter the password to add it, or run the backend as Administrator.",
            }
    except subprocess.TimeoutExpired:
        return {"success": False, "error": "Connection timed out."}
    except Exception as e:
        return {"success": False, "error": str(e)}
