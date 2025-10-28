package handlers

import (
    "os"
    "log"
    "io/fs"
    "strconv"
    "runtime"
    "strings"
    "net/http"
    "io/ioutil"
    "database/sql"
    "encoding/json"
    "path/filepath"

    _ "github.com/mattn/go-sqlite3"
    "golang.org/x/image/font/sfnt"
)

type Song struct {
    ID        int    `json:"id"`
    Author    string `json:"author"`
    SongTitle string `json:"songTitle"`
    Lyrics    string `json:"lyrics"`
}

type Theme struct {
    ID                  int `json:"id"`
    ThemeName           string `json:"themeName"`
    Font                string `json:"font"`
    FontSize            int `json:"fontSize"`
    FontColor           string `json:"fontColor"`
    Bold                bool `json:"bold"`
    Italic              bool `json:"italic"`
    StrikeThrough       bool `json:"strikeThrough"`
    TopLeftOffset       int `json:"topLeftOffset"`
    TopMiddleOffset     int `json:"topMiddleOffset"`
    TopRightOffset      int `json:"topRightOffset"`
    LeftUpperOffset     int `json:"leftUpperOffset"`
    RightUpperOffset    int `json:"rightUpperOffset"`
    LeftMiddleOffset    int `json:"leftMiddleOffset"`
    RightMiddleOffset   int `json:"rightMiddleOffset"`
    LeftLowerOffset     int `json:"leftLowerOffset"`
    RightLowerOffset    int `json:"rightLowerOffset"`
    LeftBottomOffset    int `json:"leftBottomOffset"`
    MiddleBottomOffset  int `json:"middleBottomOffset"`
    RightBottomOffset   int `json:"rightBottomOffset"`
    TextAlign           string `json:"textAlign"`
    JustifyContent      string `json:"justifyContent"`
    AlignItems          string `json:"alignItems"`
}

type ThemeRequest struct {
	Theme string `json:"theme"`
}

type DefaultResponse struct {
    OK  bool `json:"ok"`
}

type SongsResponse struct {
    OK      bool   `json:"ok"`
    Data    []Song `json:"data"`
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

type ThemesResponse struct {
    OK      bool `json:"ok"`
    Data    []Theme `json:"data"`
}

type SetThemesResponse struct {
    OK      bool `json:"ok"`
    Data    interface{} `json:"data, omitempty"`
}

type FontsResponse struct {
    OK      bool `json:"ok"`
    Data    []string `json:"data"`
}

// Save a song
func SaveSongHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var song Song
	err := json.NewDecoder(r.Body).Decode(&song)
	if err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	db, err := sql.Open("sqlite3", "./test")
	if err != nil {
		log.Println("DB open error:", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer db.Close()

    log.Println("Saving changes to the chosen theme")
	// If ID > 0, update existing theme, otherwise insert new
	if song.ID > 0 {
		_, err = db.Exec(`
			UPDATE song_table SET
				author = ?, song_title = ?, lyrics = ?
			WHERE id = ?
		`,
			song.Author, song.SongTitle, song.Lyrics,
			song.ID,
		)
		if err != nil {
			log.Println("DB update error:", err)
			http.Error(w, "Database error", http.StatusInternalServerError)
			return
		}
	} else {
		_, err = db.Exec(`
			INSERT INTO song_table (
				author, song_title, lyrics
			) VALUES (?, ?, ?)
		`,
			song.Author, song.SongTitle, song.Lyrics,
		)
		if err != nil {
			log.Println("DB insert error:", err)
			http.Error(w, "Database error", http.StatusInternalServerError)
			return
		}
	}

    respondJSON(w, DefaultResponse{OK: true})
}

// GetSystemFontDirs returns standard font directories for each OS.
func GetSystemFontDirs() []string {
	switch runtime.GOOS {
	case "windows":
		return []string{`C:\Windows\Fonts`}
	case "darwin":
		return []string{
			"/Library/Fonts",
			"/System/Library/Fonts",
			filepath.Join(os.Getenv("HOME"), "Library/Fonts"),
		}
	default: // linux / unix
		return []string{
			"/usr/share/fonts",
			"/usr/local/share/fonts",
			filepath.Join(os.Getenv("HOME"), ".fonts"),
		}
	}
}

// GetFontFamilyName reads a font file and extracts its family name using sfnt.
func GetFontFamilyName(path string) (string, error) {
	data, err := ioutil.ReadFile(path)
	if err != nil {
		return "", err
	}

	font, err := sfnt.Parse(data)
	if err != nil {
		return "", err
	}

	const nameIDFontFamily = 1 // OpenType constant for "Font Family" name
	name, err := font.Name(nil, nameIDFontFamily)
	if err != nil {
		return "", err
	}

	// Clean up null bytes and spaces
	name = strings.TrimSpace(strings.ReplaceAll(name, "\x00", ""))
	return name, nil
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

func GetThemesHandler(w http.ResponseWriter, r *http.Request) {
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

    themeList, err := db.Query("SELECT * FROM themes")
    if err != nil {
        log.Println("DB query error:", err)
        http.Error(w, "Database error", http.StatusInternalServerError)
        return
    }
    defer themeList.Close()

    var themes []Theme
    for themeList.Next() {
        var t Theme
        if err := themeList.Scan(
            &t.ID,
            &t.ThemeName,
            &t.Font,
            &t.FontSize,
            &t.FontColor,
            &t.Bold,
            &t.Italic,
            &t.StrikeThrough,
            &t.TopLeftOffset,
            &t.TopMiddleOffset,
            &t.TopRightOffset,
            &t.LeftUpperOffset,
            &t.RightUpperOffset,
            &t.LeftMiddleOffset,
            &t.RightMiddleOffset,
            &t.LeftLowerOffset,
            &t.RightLowerOffset,
            &t.LeftBottomOffset,
            &t.MiddleBottomOffset,
            &t.RightBottomOffset,
            &t.TextAlign,
            &t.JustifyContent,
            &t.AlignItems,
        ); err != nil {
            log.Println("Row scan error:", err)
            continue
        }
        themes = append(themes, t)
    }

    // Return as JSON
    respondJSON(w, ThemesResponse{OK: true, Data: themes})
}

func GetFontsHandler(w http.ResponseWriter, r *http.Request) {
	fonts := make(map[string]bool)

	for _, dir := range GetSystemFontDirs() {
		filepath.WalkDir(dir, func(path string, d fs.DirEntry, err error) error {
			if err != nil || d.IsDir() {
				return nil
			}

			ext := filepath.Ext(path)
			if ext == ".ttf" || ext == ".otf" {
				if name, err := GetFontFamilyName(path); err == nil && name != "" {
					fonts[name] = true
				}
			}
			return nil
		})
	}

	// Convert map keys to slice
	names := []string{}
	for name := range fonts {
		names = append(names, name)
	}

    respondJSON(w, FontsResponse{OK: true, Data: names})
}

func SetThemeHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse JSON body
	var req ThemeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	log.Println("Requested theme:", req.Theme)

	// Open DB
	db, err := sql.Open("sqlite3", "./test")
	if err != nil {
		log.Println("DB open error:", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer db.Close()

	// Query for theme
	var t Theme
	err = db.QueryRow("SELECT * FROM themes WHERE theme_name = ?", req.Theme).
		Scan(
            &t.ID,
            &t.ThemeName,
            &t.Font,
            &t.FontSize,
            &t.FontColor,
            &t.Bold,
            &t.Italic,
            &t.StrikeThrough,
            &t.TopLeftOffset,
            &t.TopMiddleOffset,
            &t.TopRightOffset,
            &t.LeftUpperOffset,
            &t.RightUpperOffset,
            &t.LeftMiddleOffset,
            &t.RightMiddleOffset,
            &t.LeftLowerOffset,
            &t.RightLowerOffset,
            &t.LeftBottomOffset,
            &t.MiddleBottomOffset,
            &t.RightBottomOffset,
            &t.TextAlign,
            &t.JustifyContent,
            &t.AlignItems,
        )

	if err == sql.ErrNoRows {
		http.Error(w, "Theme not found", http.StatusNotFound)
		return
	} else if err != nil {
		log.Println("DB query error:", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

    respondJSON(w, SetThemesResponse{OK: true, Data: t})
}

func SaveThemeHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var t Theme
	err := json.NewDecoder(r.Body).Decode(&t)
	if err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()
	log.Println("theme name is", t.ThemeName)

	db, err := sql.Open("sqlite3", "./test")
	if err != nil {
		log.Println("DB open error:", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer db.Close()

    log.Println("Saving changes to the chosen theme")
	// If ID > 0, update existing theme, otherwise insert new
	if t.ID > 0 {
		_, err = db.Exec(`
			UPDATE themes SET
				theme_name = ?, font = ?, font_size = ?, font_color = ?,
				bold = ?, italic = ?, strike_through = ?,
				top_left_offset = ?, top_middle_offset = ?, top_right_offset = ?,
				left_upper_offset = ?, right_upper_offset = ?, left_middle_offset = ?, right_middle_offset = ?,
				left_lower_offset = ?, right_lower_offset = ?, left_bottom_offset = ?, middle_bottom_offset = ?, right_bottom_offset = ?,
				text_align = ?, justify_content = ?, align_items = ?
			WHERE id = ?
		`,
			t.ThemeName, t.Font, t.FontSize, t.FontColor,
			t.Bold, t.Italic, t.StrikeThrough,
			t.TopLeftOffset, t.TopMiddleOffset, t.TopRightOffset,
			t.LeftUpperOffset, t.RightUpperOffset, t.LeftMiddleOffset, t.RightMiddleOffset,
			t.LeftLowerOffset, t.RightLowerOffset, t.LeftBottomOffset, t.MiddleBottomOffset, t.RightBottomOffset,
			t.TextAlign, t.JustifyContent, t.AlignItems,
			t.ID,
		)
		if err != nil {
			log.Println("DB update error:", err)
			http.Error(w, "Database error", http.StatusInternalServerError)
			return
		}
	} else {
		_, err = db.Exec(`
			INSERT INTO themes (
				theme_name, font, font_size, font_color,
				bold, italic, strike_through,
				top_left_offset, top_middle_offset, top_right_offset,
				left_upper_offset, right_upper_offset, left_middle_offset, right_middle_offset,
				left_lower_offset, right_lower_offset, left_bottom_offset, middle_bottom_offset, right_bottom_offset,
				text_align, justify_content, align_items
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`,
			t.ThemeName, t.Font, t.FontSize, t.FontColor,
			t.Bold, t.Italic, t.StrikeThrough,
			t.TopLeftOffset, t.TopMiddleOffset, t.TopRightOffset,
			t.LeftUpperOffset, t.RightUpperOffset, t.LeftMiddleOffset, t.RightMiddleOffset,
			t.LeftLowerOffset, t.RightLowerOffset, t.LeftBottomOffset, t.MiddleBottomOffset, t.RightBottomOffset,
			t.TextAlign, t.JustifyContent, t.AlignItems,
		)
		if err != nil {
			log.Println("DB insert error:", err)
			http.Error(w, "Database error", http.StatusInternalServerError)
			return
		}
	}

    respondJSON(w, DefaultResponse{OK: true})
}

// Helper function to respond with JSON
func respondJSON(w http.ResponseWriter, data any) {
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(data)
}