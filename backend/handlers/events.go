package handlers

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"backend/controller"
)

// -----------------------------------------------------
// Background Wi-Fi SCANNER (SSID list) – already there
// -----------------------------------------------------

func StartWiFiScanner() {
	go func() {
		ticker := time.NewTicker(5 * time.Second)
		defer ticker.Stop()

		var lastSSIDs []string

		for range ticker.C {
			ssids, err := controller.GetAvailableWifiSSIDs()
			if err != nil {
				log.Printf("WiFi scan error: %v", err)
				continue
			}
			if !equal(ssids, lastSSIDs) {
				broadcaster.BroadcastJSON("wifi-scan", map[string][]string{
					"networks": ssids,
				})
				lastSSIDs = ssids
			}
		}
	}()
}

// -----------------------------------------------------
// NEW: Background Wi-Fi STATUS broadcaster
// -----------------------------------------------------

func StartWiFiStatusBroadcaster() {
	go func() {
		ticker := time.NewTicker(5 * time.Second)
		defer ticker.Stop()

		var lastStatus string

		for range ticker.C {
			statusJSON, err := controller.GetWifiStatus()
			if err != nil {
				log.Printf("WiFi status error: %v", err)
				continue
			}
			// Only push when the JSON changes
			if statusJSON != lastStatus {
				broadcaster.Broadcast("wifi-status", statusJSON)
				lastStatus = statusJSON
			}
		}
	}()
}

// -----------------------------------------------------
// EventsHandler – start BOTH scanners ONCE
// -----------------------------------------------------

func EventsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "Streaming not supported", http.StatusInternalServerError)
		return
	}

	// -----------------------------------------------------------------
	// IMPORTANT: start the background goroutines **only once**
	// -----------------------------------------------------------------
	staticOnce.Do(func() {
		StartWiFiScanner()          // existing SSID scanner
		StartWiFiStatusBroadcaster() // NEW status broadcaster
	})

	// Create client
	client := &Client{send: make(chan []byte, 10)}
	broadcaster.join <- client
	defer func() { broadcaster.leave <- client }()

	// Send initial "connected" event
	sendSSE(w, "connected", `"true"`)
	flusher.Flush()

	// Keepalive loop
	for {
		select {
		case <-r.Context().Done():
			return
		case msg, ok := <-client.send:
			if !ok {
				return
			}
			fmt.Fprint(w, string(msg))
			flusher.Flush()
		}
	}
}

// -----------------------------------------------------------------
// Global once – guarantees scanners start only once
// -----------------------------------------------------------------
var staticOnce sync.Once

// sendSSE helper (unchanged)
func sendSSE(w http.ResponseWriter, event string, data string) {
	fmt.Fprintf(w, "event: %s\ndata: %s\n\n", event, data)
}

// equal helper (unchanged)
func equal(a, b []string) bool {
	if len(a) != len(b) {
		return false
	}
	seen := make(map[string]bool)
	for _, v := range a {
		seen[v] = true
	}
	for _, v := range b {
		if !seen[v] {
			return false
		}
	}
	return true
}