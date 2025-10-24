package api

import (
    "database/sql"
    "encoding/json"
    "log"
    "net/http"

    _ "github.com/mattn/go-sqlite3"
    "golang.org/x/crypto/bcrypt"
    "github.com/gorilla/sessions"
)
var store = sessions.NewCookieStore([]byte("super-secret-key"))

// Request payload
type loginRequest struct {
    User string `json:"user"`
    Pass string `json:"pass"`
}

// Response payload
type loginResponse struct {
    OK    bool   `json:"ok"`
    Error string `json:"error,omitempty"`
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }

    // Decode JSON body
    var creds loginRequest
    if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
        http.Error(w, "Invalid JSON", http.StatusBadRequest)
        return
    } else {
        log.Println("raw data", json.NewDecoder(r.Body))
        log.Println("user is", creds.User)
        log.Println("password is ", creds.Pass)
    }

    // Open database
    db, err := sql.Open("sqlite3", "./test")
    if err != nil {
        log.Println("DB open error:", err)
        http.Error(w, "Database error", http.StatusInternalServerError)
        return
    }
    defer db.Close()

    // Fetch stored hashed password
    var hashedPassword string
    err = db.QueryRow("SELECT password FROM users WHERE username = ?", creds.User).Scan(&hashedPassword)
    if err != nil {
        if err == sql.ErrNoRows {
            respondJSON(w, loginResponse{OK: false, Error: "user not found"})
            return
        }
        log.Println("DB query error:", err)
        http.Error(w, "Database error", http.StatusInternalServerError)
        return
    }

    // Compare hashed password with bcrypt
    if err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(creds.Pass)); err != nil {
        respondJSON(w, loginResponse{OK: false, Error: "invalid password"})
        return
    }

    // Success!
    session, _ := store.Get(r, "session-name")
    session.Values["username"] = creds.User
    session.Save(r, w)

    respondJSON(w, loginResponse{OK: true})
}

func respondJSON(w http.ResponseWriter, data any) {
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(data)
}

func SessionCheckHandler(w http.ResponseWriter, r *http.Request) {
    session, _ := store.Get(r, "session-name")
    user, ok := session.Values["username"].(string)

    resp := loginResponse{OK: false}

    if ok && user == "admin" {
        resp.OK = true
    }

    respondJSON(w, resp)
}

