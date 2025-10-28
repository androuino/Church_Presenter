package controller

import (
	"bufio"
	"bytes"
	"fmt"
	"net"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"sync"
	"time"

	"golang.org/x/image/font/sfnt"

	"github.com/json-iterator/go"
)

var (
	jsonIter       = jsoniter.ConfigCompatibleWithStandardLibrary
	osName         = strings.ToLower(runtime.GOOS)
	mu             sync.RWMutex
	previousStatus = ""
	previousSSID   = ""
)

// ---------------------------------------------------------------------
//  Font handling
// ---------------------------------------------------------------------

func GetFonts() ([]string, error) {
	var fonts []string
	fontDirs := getFontDirectories()

	seen := make(map[string]bool)
	for _, dir := range fontDirs {
		entries, err := os.ReadDir(dir)
		if err != nil {
			continue
		}
		for _, entry := range entries {
			if entry.IsDir() {
				continue
			}
			name := entry.Name()
			if isFontFile(name) {
				fullPath := filepath.Join(dir, name)
				fontName := extractFontName(fullPath)
				if fontName != "" && !seen[fontName] {
					fonts = append(fonts, fontName)
					seen[fontName] = true
				}
			}
		}
	}
	return fonts, nil
}

func getFontDirectories() []string {
	switch osName {
	case "windows":
		return []string{`C:\Windows\Fonts`}
	case "darwin":
		return []string{
			"/System/Library/Fonts",
			"/Library/Fonts",
			os.Getenv("HOME") + "/Library/Fonts",
		}
	case "linux":
		return []string{
			"/usr/share/fonts",
			"/usr/local/share/fonts",
			os.Getenv("HOME") + "/.fonts",
			os.Getenv("HOME") + "/.local/share/fonts",
		}
	default:
		return []string{}
	}
}

func isFontFile(filename string) bool {
	ext := strings.ToLower(filepath.Ext(filename))
	return ext == ".ttf" || ext == ".otf" || ext == ".ttc"
}

// read whole file into memory and parse it with sfnt
func extractFontName(fontPath string) string {
	data, err := os.ReadFile(fontPath)
	if err != nil {
		return ""
	}

	// Try collection first (TTC)
	collection, err := sfnt.ParseCollection(data)
	if err != nil {
		// Not a collection → try single font
		f, err := sfnt.Parse(data)
		if err != nil {
			return ""
		}
		name, _ := f.Name(nil, sfnt.NameIDFamily) // ← CORRECT
		return name
	}

	// Collection – take the first font
	f, _ := collection.Font(0)
	if f == nil {
		return ""
	}
	name, _ := f.Name(nil, sfnt.NameIDFamily) // ← CORRECT
	return name
}

// ---------------------------------------------------------------------
//  Wi-Fi helpers
// ---------------------------------------------------------------------

func GetAvailableWifiSSIDs() ([]string, error) {
	var cmd *exec.Cmd

	switch {
	case strings.Contains(osName, "windows"):
		cmd = exec.Command("netsh", "wlan", "show", "networks", "mode=Bssid")
	case strings.Contains(osName, "linux"):
		cmd = exec.Command("nmcli", "-t", "-f", "SSID", "dev", "wifi")
	case strings.Contains(osName, "darwin"):
		cmd = exec.Command("/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport", "-s")
	default:
		return nil, fmt.Errorf("unsupported OS: %s", osName)
	}

	output, err := cmd.Output()
	if err != nil {
		return nil, err
	}

	var ssids []string
	scanner := bufio.NewScanner(bytes.NewReader(output))
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" {
			continue
		}

		switch {
		case strings.Contains(osName, "windows"):
			if strings.HasPrefix(line, "SSID ") && strings.Contains(line, " : ") {
				ssid := strings.TrimSpace(strings.SplitN(line, ":", 2)[1])
				if ssid != "" && ssid != "SSID" {
					ssids = append(ssids, ssid)
				}
			}
		case strings.Contains(osName, "linux"):
			if line != "" && !strings.HasPrefix(line, ":") {
				ssids = append(ssids, line)
			}
		case strings.Contains(osName, "darwin"):
			parts := strings.Fields(line)
			if len(parts) > 0 && !strings.HasPrefix(parts[0], "SSID") {
				ssids = append(ssids, parts[0])
			}
		}
	}

	// deduplicate
	unique := make(map[string]bool)
	var result []string
	for _, s := range ssids {
		if !unique[s] {
			unique[s] = true
			result = append(result, s)
		}
	}
	return result, nil
}

// ---------------------------------------------------------------------
//  Connect / Disconnect
// ---------------------------------------------------------------------

func ConnectToWifi(ssid, password string) (bool, error) {
	var cmd *exec.Cmd

	switch {
	case strings.Contains(osName, "windows"):
		profile := fmt.Sprintf(`<?xml version="1.0"?>
<WLANProfile xmlns="http://www.microsoft.com/networking/WLAN/profile/v1">
	<name>%s</name>
	<SSIDConfig>
		<SSID>
			<name>%s</name>
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
				<keyMaterial>%s</keyMaterial>
			</sharedKey>
		</security>
	</MSM>
</WLANProfile>`, ssid, ssid, password)

		tmpFile := filepath.Join(os.TempDir(), "wifi_profile.xml")
		if err := os.WriteFile(tmpFile, []byte(profile), 0600); err != nil {
			return false, err
		}
		defer os.Remove(tmpFile)

		// add profile
		addCmd := exec.Command("netsh", "wlan", "add", "profile", "filename="+tmpFile)
		if out, err := addCmd.CombinedOutput(); err != nil {
			return false, fmt.Errorf("add profile failed: %v, %s", err, out)
		}
		// connect
		cmd = exec.Command("netsh", "wlan", "connect", "name="+ssid)

	case strings.Contains(osName, "linux"):
		cmd = exec.Command("nmcli", "dev", "wifi", "connect", ssid, "password", password)

	case strings.Contains(osName, "darwin"):
		cmd = exec.Command("networksetup", "-setairportnetwork", "en0", ssid, password)

	default:
		return false, fmt.Errorf("unsupported OS")
	}

	out, err := cmd.CombinedOutput()
	if err != nil {
		return false, fmt.Errorf("command failed: %v, output: %s", err, string(out))
	}
	return true, nil
}

// ---------------------------------------------------------------------
//  Status helpers (internal)
// ---------------------------------------------------------------------

func checkWiFiStatus() (string, error) {
	var cmd *exec.Cmd

	switch {
	case strings.Contains(osName, "windows"):
		cmd = exec.Command("netsh", "interface", "show", "interface", "name=Wi-Fi")
	case strings.Contains(osName, "linux"):
		cmd = exec.Command("nmcli", "-t", "-f", "WIFI", "general")
	case strings.Contains(osName, "darwin"):
		cmd = exec.Command("networksetup", "-getairportpower", "en0")
	default:
		return "unsupported", nil
	}

	out, err := cmd.Output()
	if err != nil {
		return "error", err
	}
	s := strings.ToLower(string(out))

	switch {
	case strings.Contains(osName, "windows"):
		if strings.Contains(s, "connected") {
			return "enabled", nil
		}
		return "disabled", nil
	case strings.Contains(osName, "linux"):
		if strings.Contains(s, "enabled") {
			return "enabled", nil
		}
		return "disabled", nil
	case strings.Contains(osName, "darwin"):
		if strings.Contains(s, "on") {
			return "enabled", nil
		}
		return "disabled", nil
	}
	return "unknown", nil
}

func getActiveWiFiConnection() (string, error) {
	var cmd *exec.Cmd

	switch {
	case strings.Contains(osName, "windows"):
		cmd = exec.Command("netsh", "wlan", "show", "interfaces")
	case strings.Contains(osName, "linux"):
		cmd = exec.Command("nmcli", "-t", "-f", "ACTIVE,SSID", "dev", "wifi")
	case strings.Contains(osName, "darwin"):
		cmd = exec.Command("sh", "-c", "networksetup -getairportnetwork en0 | awk '{print $4}'")
	default:
		return "unsupported", nil
	}

	out, err := cmd.Output()
	if err != nil {
		return "error", err
	}
	s := string(out)

	switch {
	case strings.Contains(osName, "windows"):
		for _, line := range strings.Split(s, "\n") {
			if strings.Contains(line, "SSID") && !strings.Contains(line, "BSSID") {
				parts := strings.Split(line, ":")
				if len(parts) > 1 {
					return strings.TrimSpace(parts[1]), nil
				}
			}
		}
	case strings.Contains(osName, "linux"):
		for _, line := range strings.Split(s, "\n") {
			if strings.HasPrefix(line, "yes:") {
				return strings.TrimPrefix(line, "yes:"), nil
			}
		}
	case strings.Contains(osName, "darwin"):
		return strings.TrimSpace(s), nil
	}
	return "disconnected", nil
}

func getWiFiIPAddress() (string, error) {
	ifaces, err := net.Interfaces()
	if err != nil {
		return "", err
	}
	for _, i := range ifaces {
		if i.Flags&net.FlagUp == 0 || i.Flags&net.FlagLoopback != 0 {
			continue
		}
		addrs, err := i.Addrs()
		if err != nil {
			continue
		}
		for _, a := range addrs {
			if ipnet, ok := a.(*net.IPNet); ok && !ipnet.IP.IsLoopback() && ipnet.IP.To4() != nil {
				return ipnet.IP.String(), nil
			}
		}
	}
	return "", nil
}

// ---------------------------------------------------------------------
//  Public Wi-Fi status JSON
// ---------------------------------------------------------------------

func GetWifiStatus() (string, error) {
	mu.Lock()
	defer mu.Unlock()

	status, _ := checkWiFiStatus()
	ssid, _ := getActiveWiFiConnection()
	ip, _ := getWiFiIPAddress()

	connStatus := "disconnected"
	if ssid != "disconnected" && ssid != "" {
		connStatus = "connected"
	}

	if status != previousStatus || ssid != previousSSID {
		fmt.Printf("Wi-Fi Status: %s, SSID: %s, IP: %s\n", status, ssid, ip)
		previousStatus = status
		previousSSID = ssid
	}

	data := map[string]interface{}{
		"status": connStatus,
		"ssid":   ssid,
		"ip":     ip,
	}
	b, err := jsonIter.Marshal(data)
	if err != nil {
		return `{"status":"error"}`, err
	}
	return string(b), nil
}

// ---------------------------------------------------------------------
//  Disconnect
// ---------------------------------------------------------------------

func WifiDisconnect() (bool, error) {
	var cmd *exec.Cmd

	switch {
	case strings.Contains(osName, "windows"):
		cmd = exec.Command("netsh", "wlan", "disconnect")
	case strings.Contains(osName, "linux"):
		cmd = exec.Command("sh", "-c", "nmcli connection down id $(nmcli -t -f NAME connection show --active | head -n1)")
	case strings.Contains(osName, "darwin"):
		// Turn off → on is the macOS way to “disconnect”
		_ = exec.Command("networksetup", "-setairportpower", "en0", "off").Run()
		time.Sleep(time.Second)
		_ = exec.Command("networksetup", "-setairportpower", "en0", "on").Run()
		return true, nil
	default:
		return false, fmt.Errorf("unsupported OS")
	}
	return cmd.Run() == nil, nil
}

func GetWifiConnectionStatus() (bool, error) {
	js, err := GetWifiStatus()
	if err != nil {
		return false, err
	}
	var m map[string]interface{}
	if err := jsonIter.Unmarshal([]byte(js), &m); err != nil {
		return false, err
	}
	return m["status"] == "connected", nil
}

// ---------------------------------------------------------------------
//  Theme / SSE stubs (replace with your real code)
// ---------------------------------------------------------------------

type Theme struct {
	Name   string            `json:"name"`
	Colors map[string]string `json:"colors"`
}

type ThemesManager struct{}

func (ThemesManager) GetByThemeName(name string) Theme {
	// placeholder – load from DB/file/etc.
	return Theme{Name: name, Colors: map[string]string{"bg": "#000"}}
}

// replace with your real SSE broadcaster
type SSENotifierImpl struct{}

var SSENotifier = SSENotifierImpl{}

func (SSENotifierImpl) SetTheme(_ string) {}
func (SSENotifierImpl) LiveClear()      {}

func SetTheme(themeName string) error {
	theme := ThemesManager{}.GetByThemeName(themeName)
	b, _ := jsonIter.Marshal(theme)
	SSENotifier.SetTheme(string(b))
	return nil
}

func LiveClear() {
	SSENotifier.LiveClear()
}

// ---------------------------------------------------------------------
//  Internet check
// ---------------------------------------------------------------------

func IsConnectedToInternet() bool {
	client := &http.Client{Timeout: 3 * time.Second}
	resp, err := client.Get("http://www.google.com")
	if err != nil {
		return false
	}
	defer resp.Body.Close()
	return resp.StatusCode >= 200 && resp.StatusCode < 300
}

// ---------------------------------------------------------------------
//  Simple in-memory cache for link
// ---------------------------------------------------------------------

var linkCache = ""

func GetLink() string { return linkCache }
func SetLink(l string) { linkCache = l }

// ---------------------------------------------------------------------
//  Service control (scripts must be in the same dir)
// ---------------------------------------------------------------------

func DisableService(serviceName string) (bool, error) {
	if serviceName == "" {
		serviceName = "kiosk.service"
	}
	cmd := exec.Command("./disable_service.sh", serviceName)
	return cmd.Run() == nil, nil
}

func EnableService(serviceName string) (bool, error) {
	if serviceName == "" {
		serviceName = "kiosk.service"
	}
	cmd := exec.Command("./enable_service.sh", serviceName)
	return cmd.Run() == nil, nil
}