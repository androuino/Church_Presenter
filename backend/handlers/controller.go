package handlers

import (
    "database/sql"
    "encoding/json"
    "log"
    "net/http"
    "strconv"
    "strings"

    _ "github.com/mattn/go-sqlite3"
)

type Song struct {
    ID        int    `json:"id"`
    Author    string `json:"author"`
    SongTitle string `json:"song_title"`
    Lyrics    string `json:"lyrics"`
}

type SongsResponse struct {
    OK    bool   `json:"ok"`
    Data []Song `json:"data"`
}

type SongTitleResponse struct {
    OK    bool   `json:"ok"`
    Title string `json:"title, omitempty"`
    Error string `json:"error, omitempty"`
}

type EditSongResponse struct {
    OK      bool    `json:"ok"`
    Data    *Song   `json:"data, omitempty"`
}

func GetSongsHandler(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodGet {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }

    db, err := sql.Open("sqlite3", "./test")
    if err != nil {
        log.Println("DB open error:", err)
        http.Error(w, "Database error", http.StatusInternalServerError)
        return
    }
    defer db.Close()

    rows, err := db.Query("SELECT * FROM song_table")
    if err != nil {
        log.Println("DB query error:", err)
        http.Error(w, "Database error", http.StatusInternalServerError)
        return
    }
    defer rows.Close()

    var songs []Song
    for rows.Next() {
        var s Song
        if err := rows.Scan(&s.ID, &s.Author, &s.SongTitle, &s.Lyrics); err != nil {
            log.Println("Row scan error:", err)
            continue
        }
        songs = append(songs, s)
    }

    respondJSON(w, SongsResponse{OK: true, Data: songs})
}

// GET /getsongtitle/{id}
func GetSongTitleHandler(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodGet {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }

    // Extract songId from URL
    pathParts := strings.Split(r.URL.Path, "/")
    if len(pathParts) < 3 {
        http.Error(w, "Missing song ID", http.StatusBadRequest)
        return
    }

    idStr := pathParts[2]
    songID, err := strconv.Atoi(idStr)
    if err != nil {
        http.Error(w, "Invalid song ID", http.StatusBadRequest)
        return
    }

    db, err := sql.Open("sqlite3", "./test")
    if err != nil {
        log.Println("DB open error:", err)
        respondJSON(w, SongTitleResponse{OK: false, Error: "Database error"})
        return
    }
    defer db.Close()

    var title string
    err = db.QueryRow("SELECT song_title FROM song_table WHERE id = ?", songID).Scan(&title)
    if err != nil {
        if err == sql.ErrNoRows {
            respondJSON(w, SongTitleResponse{OK: false, Error: "Song not found"})
            return
        }
        log.Println("DB query error:", err)
        respondJSON(w, SongTitleResponse{OK: false, Error: "Database error"})
        return
    }

    respondJSON(w, SongTitleResponse{OK: true, Title: title})
}

func EditSongHandler(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodGet {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }

    // Extract the ID from the URL path, e.g., /editsong/1
    parts := strings.Split(r.URL.Path, "/")
    if len(parts) < 3 {
        http.Error(w, "Invalid song ID", http.StatusBadRequest)
        return
    }

    id, err := strconv.Atoi(parts[2])
    if err != nil {
        http.Error(w, "Invalid song ID", http.StatusBadRequest)
        return
    }

    db, err := sql.Open("sqlite3", "./test")
    if err != nil {
        log.Println("DB open error:", err)
        http.Error(w, "Database error", http.StatusInternalServerError)
        return
    }
    defer db.Close()

    var s Song
    err = db.QueryRow("SELECT * FROM song_table WHERE id = ?", id).
        Scan(&s.ID, &s.Author, &s.SongTitle, &s.Lyrics)
    if err != nil {
        if err == sql.ErrNoRows {
            // Not found
            w.Header().Set("Content-Type", "application/json")
            json.NewEncoder(w).Encode(EditSongResponse{OK: false})
            return
        }
        log.Println("DB query error:", err)
        http.Error(w, "Database error", http.StatusInternalServerError)
        return
    }

    // Return as JSON
    respondJSON(w, EditSongResponse{OK: true, Data: &s})
}

// Helper function to respond with JSON
func respondJSON(w http.ResponseWriter, data any) {
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(data)
}