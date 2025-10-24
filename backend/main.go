package main

import (
    "fmt"
    "log"
    "net/http"

    "backend/handlers"
    "backend/api"
)

func main() {
    publicDir := "resources/public/"

	// -------------------------
	// HTML Pages
	// -------------------------
	pageHandler := func(filename string) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			http.ServeFile(w, r, publicDir+"/"+filename)
		}
	}

    // Serve control.html when accessing /admin
    http.HandleFunc("/admin", pageHandler("control.html"))
    http.HandleFunc("/create", pageHandler("create.html"))
    http.HandleFunc("/", pageHandler("index.html"))
    fs := http.FileServer(http.Dir(publicDir))
    http.Handle("/static/", http.StripPrefix("/static/", fs))

    // Serve static files (css, js, font, uploaded, etc.)
    http.Handle("/assets/", fs)
    //http.Handle("/css/", fs)
    //http.Handle("/js/", fs)
    http.Handle("/font/", fs)
    //http.Handle("/uploaded/", fs)

    http.HandleFunc("/login.path", api.LoginHandler)
    http.HandleFunc("/checksessions", api.SessionCheckHandler)
    http.HandleFunc("/getsongs", handlers.GetSongsHandler)
    http.HandleFunc("/getsongtitle/", handlers.GetSongTitleHandler)
    http.HandleFunc("/editsong/", handlers.EditSongHandler)

    http.HandleFunc("/events", handlers.EventsHandler)
    //http.HandleFunc("/getip", handlers.GetIPHandler)
    //http.HandleFunc("/searchbibleverse", handlers.SearchBibleVerseHandler)
    //http.HandleFunc("/getlink", handlers.GetLinkHandler)

    addr := "0.0.0.0:5555"
    fmt.Println("🚀 Server running at http://0.0.0.0:5555 (accessible from your LAN)")
    err := http.ListenAndServe(addr, nil)
    if err != nil {
        log.Fatal(err)
    }
}
