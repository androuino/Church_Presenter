package handlers

import (
    "fmt"
    "net/http"
)

// sendSSE
func sendSSE(w http.ResponseWriter, event string, data string) {
    fmt.Fprint(w, "event: %s\n", event)
    fmt.Fprint(w, "data: %s\n\n", data)
    if f, ok := w.(http.Flusher); ok {
        f.Flush()
    }
}

// EventsHandler handles /events (SEE stream)
func EventsHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "text/event-stream")
    w.Header().Set("Cache-Control", "no-cache")
    w.Header().Set("Connection", "keep-alive")
    w.Header().Set("Access-Control-Allow-Origin", "")

    _, ok := w.(http.Flusher)
    if !ok {
        http.Error(w, "Streaming unsupported!", http.StatusInternalServerError)
        return
    }

    sendSSE(w, "connected", `"true"`)
}