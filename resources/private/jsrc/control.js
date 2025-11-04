const db = new Dexie("ServiceDB");
db.version(1).stores({
    songs: "id, list",
    live: "id, lyricsId, lyrics",
});
m2d2.load($ => {
    $.dict.set({
        yes : {
            en : "YES"
        },
        no : {
            en : "NO"
        },
        ok : {
            en : "OK"
        },
        send : {
            en : "SEND"
        },
        cancel : {
            en : "CANCEL"
        }
    });
});
m2d2.ready($ => {
    //const evtSource = new EventSource('/events');
    let select = null;
    let songId = null;
    let songTitle = "";
    let isResizing = false;
    let songList = [];
    const header = $("#header");
    const container = $(".container");
    const bubbles = $(".bubbles");

    const mainControl = $("#mainControl", {
        navNew : {
            onclick : function(ev) {
                const newWindowUrl = `${window.location.protocol}/create`;
                window.open(newWindowUrl, 'createWindow', 'width=800,height=600,toolbar=no,scrollbars=yes,resizable=yes');
            }
        },
        navEdit : {
            onclick : function(ev) {
                if (select === null) {
                    $.failure("Please select a song to edit.");
                } else {
                    editSong(songId);
                }
            }
        },
        navDelete : {
            onclick : function(ev) {
                if (select === null) {
                    $.failure("Please select a song to delete.");
                } else {
                    $.alert("Deleting...");
                }
            }
        },
        navStartProjector : {
            onclick : function(ev) {
                $.post("/startprojector", res => {
                    if (res.ok) {
                        console.log("Projector started.");
                    } else {
                        $.failure("Is either google chrome is not installed or no extended monitor is connected");
                    }
                }, true);
            }
        },
        navStopProjector : {
            onclick : function(ev) {
                $.post("/stopprojector", res => {
                    if (res.ok) {
                        console.log("Projector stopped.");
                    } else {
                        console.log("Failed to stop projector.")
                    }
                }, true);
            }
        },
        navInfo : {
            onclick : function(ev) {
                // todo: show a modal form here
                // info:
                // Software: HWVCI Presenter
                // Version: 1.0
                // Developer: Sem Moreno
                // Website: https://josapedmoreno.xyz
            }
        },
        navWiFi : {
            onclick : function(ev) {
                const newWindowUrl = `${window.location.protocol}/wifisettings`;
                window.open(newWindowUrl, 'wifiSettingWindow', 'width=800,height=400,toolbar=no,scrollbars=yes,resizable=yes');
            }
        },
        navSettings : {
            onclick : function(ev) {
                $.get("/settings", res => {
                    const newWindowUrl = `${window.location.protocol}/settings`;
                    window.open(newWindowUrl, 'settingsWindow', 'width=1200,height=700,toolbar=no,scrollbars=yes,resizable=yes');
                }, true);
            }
        },
        navLogout : {
            onclick : function(ev) {
                $.confirm("Please confirm to log out?", res => {
                    if (res) {
                        $.get("/logout", res => {
                            if (res.ok) {
                                header.show = false;
                                mainControl.show = false;
                                container.show = true
                                bubbles.show = true;
                                localStorage.clear();
                            }
                        })
                    }
                })
            }
        },
    });
    const songs = $(".songs", {
        inputSearch : {
            onkeyup : function(ev) {
                let filter = this.value.toUpperCase();
                let tr = song.tableSong.getElementsByTagName('tr');
                if (ev.key === 'Escape') {
                    this.value = "";
                    for (let i = 1; i < tr.length; i++) {  // Start from 1 to skip the header
                        tr[i].style.display = '';
                    }
                } else if (filter === '') {
                    // If the input is cleared, show all rows
                    for (let i = 1; i < tr.length; i++) {  // Start from 1 to skip the header
                        tr[i].style.display = '';
                    }
                } else if (ev.key === "Enter") {
                    if (this.value === "") {
                        $.failure("I did not get that!");
                    } else {
                        for (let i = 1; i < tr.length; i++) {  // Start from 1 to skip the header
                            let tds = tr[i].getElementsByTagName('td');
                            let rowText = '';

                            // Concatenate text from all cells in the row
                            for (let j = 0; j < tds.length; j++) {
                                rowText += tds[j].textContent || tds[j].innerText;
                            }

                            // Check if the row text matches the filter
                            if (rowText.toUpperCase().indexOf(filter) > -1) {
                                tr[i].style.display = '';
                            } else {
                                tr[i].style.display = 'none';
                            }
                        }
                    }
                }
            }
        },
        iconSearch : {
            onclick : function(ev) {
                let filter = inputSearch.value.toUpperCase();
                let tr = songs.tableSong.getElementsByTagName('tr');
                if (inputSearch.value === "") {
                    $.failure("I did not get that!");
                } else {
                    for (let i = 1; i < tr.length; i++) {  // Start from 1 to skip the header
                        let tds = tr[i].getElementsByTagName('td');
                        let rowText = '';

                        // Concatenate text from all cells in the row
                        for (let j = 0; j < tds.length; j++) {
                            rowText += tds[j].textContent || tds[j].innerText;
                        }

                        // Check if the row text matches the filter
                        if (rowText.toUpperCase().indexOf(filter) > -1) {
                            tr[i].style.display = '';
                        } else {
                            tr[i].style.display = 'none';
                        }
                    }
                }
            }
        },
        tableSong : {},
        tbodySongList : {
            template : {
                tr : {
                    tagName : "tr",
                    author : {
                        tagName : "td",
                        css : "author",
                    },
                    songTitle : {
                        tagName : "td",
                        css : "songTitle",
                    },
                    deleteSong : {
                        tagName : "td",
                        css : "deleteSong",
                        span : {
                            tagName : "span",
                            id : "iconDeleteSong",
                            css : "gicon",
                            text : "delete_forever",
                            style : {
                                color : "red",
                            },
                            onload : function(ev) {
                                tippy(this, {
                                    content: "Delete forever",
                                    interactive: false,
                                    placement: 'top',
                                    animation: 'scale',
                                });
                            },
                            onclick : function(ev) {
                                if (songId != null) {
                                    $.confirm("Confirmation to delete this song?", res => {
                                        if (res) {
                                            $.delete("/deletesong/" + songId, res => {
                                                if (res.ok) {
                                                    $.success("Song is deleted.");
                                                    getSongList();
                                                } else {
                                                    $.failure("Something went wrong.");
                                                }
                                            }, true);
                                        }
                                    });
                                } else {
                                    $.alert("Please pick a song on the list.");
                                }
                            },
                        }
                    },
                    editSong : {
                        tagName : "td",
                        css : "editSong",
                        span : {
                            tagName : "span",
                            id : "iconEditSong",
                            css : "gicon",
                            text : "edit_document",
                            onload : function(ev) {
                                tippy(this, {
                                    content: "Edit",
                                    interactive: false,
                                    placement: 'top',
                                    animation: 'scale',
                                });
                            },
                            onclick : function(ev) {
                                if (songId != null) {
                                    editSong(songId);
                                } else {
                                    $.alert("Please pick a song on the list.");
                                }
                            }
                        }
                    },
                    toService : {
                        tagName : "td",
                        css : "toService",
                        span : {
                            tagName : "span",
                            id : "iconAddToService",
                            css : "gicon",
                            text : "playlist_add",
                            onload : function(ev) {
                                tippy(this, {
                                    content: "Add to service",
                                    interactive: false,
                                    placement: 'top',
                                    animation: 'scale',
                                });
                            },
                            onclick : function(ev) {
                                if (songId != null) {
                                    $.get("/getsongtitle/" + songId, res => {
                                        if (res.ok) {
                                            songTitle = res.title;
                                            live.ulSongs.items.push({
                                                dataset : { id : songId },
                                                pSongTitle : {
                                                    dataset : { id : songId },
                                                    text : res.title
                                                },
                                            });
                                        } else {
                                            console.debug("There's an error getting the song title.");
                                        }
                                    }, true);
                                } else {
                                    $.alert("Please click a song on the list.");
                                }
                            }
                        }
                    },
                    onclick : function(ev) {
                        songId = this.dataset.id;
                        select = songId;
                        this.classList.add("active");
                        songs.tbodySongList.items.forEach(row => {
                            if (row.dataset.id != songId) {
                                row.classList.remove("active");
                                row.style.background = "";
                            } else {
                                row.style.background = "#ffee00";
                                const secondCell = row.querySelectorAll('td')[1];
                                if (secondCell) {
                                    songTitle = secondCell.textContent;
                                    songList.push([songId, songTitle]);
                                }
                            }
                        });
                        saveToLocalDB("songs", songList)
                    },
                    onmouseover : function(ev) {
                        songId = this.dataset.id;
                    }
                }
            },
            items : [],
        },
    });
    const live = $(".live", {
        clearLive : {
            onclick : function(ev) {
                if (live.ulLiveLyrics.items.length > 0) {
                    $.confirm("Confirm to clear.", res => {
                        if (res) {
                            $.post("/liveclear", res => {
                                if (res.ok) {
                                    console.debug("Live cleared.");
                                    deleteFromLocalDB("live");
                                }
                            }, error => {
                                console.error("Error clearing live.", error);
                            }, true);
                            live.ulLiveLyrics.items.clear();
                            live.ulSongs.items.forEach(row => {
                                const p = row.children[0];
                                if (p.classList.contains("active")) {
                                    p.classList.remove("active");
                                    if (p.classList.contains("live")) {
                                        p.style.color = "black";
                                        p.style.background = "#3ff53f";
                                    } else {
                                        p.style.color = "";
                                        p.style.background = "";
                                    }
                                } else {
                                    if (p.classList.contains("live")) {
                                        p.classList.remove("live")
                                        p.style.color = "";
                                        p.style.background = "";
                                    }
                                }
                            });
                        }
                    });
                } else {
                    $.post("/liveclear", res => {
                        if (res.ok) {
                            console.debug("Live cleared.");
                        }
                    }, error => {
                        console.error("Error clearing live.", error);
                    }, true);
                }
            }
        },
        controlDefault : {
            onclick : function(ev) {
                $.post("/showlyrics", res => {
                    if (res.ok) {
                        console.debug("lyrics is shown.");
                    }
                }, error => {
                    console.error("error showing lyrics.", error);
                }, true);
            }
        },
        controlBlackScreen : {
            onclick : function(ev) {
                $.post("/blackscreen", res => {
                    if (res.ok) {
                        console.debug("black screen activated.");
                    }
                }, error => {
                    console.error("error setting screen to black.", error);
                }, true);
            }
        },
        controlHideLyrics : {
            onclick : function(ev) {
                $.post("/hidelyrics", res => {
                    if (res.ok) {
                        console.debug("lyrics is hidden.");
                    }
                }, error => {
                    console.error("error hiding lyrics.", error);
                }, true);
            }
        },
        controlRemoveBackground : {
            onclick : function(ev) {
                $.post("/removebackground", res => {
                    if (res.ok) {
                        console.debug("remove background success.");
                    }
                }, error => {
                    console.error("error removing background", error);
                }, true);
            }
        },
        ulLiveLyrics : {
            template : {
                li : {
                    tagName : "li",
                    onclick : function(ev) {
                        const id = this.dataset.id;
                        this.classList.add("active");
                        live.ulLiveLyrics.items.forEach(row => {
                            if (id !== row.dataset.id) {
                                row.classList.remove("active");
                            } else {
                                const data = {
                                    lyrics : row.text
                                };
                                $.post("/stream", data, res => {
                                    if (res.ok) {
                                        console.debug("lyrics sent.");
                                    }
                                }, true);
                            }
                        });
                    },
                },
            },
            items : [],
            onkeyup : function(ev) {
                this.getElementsByTagName("li");
                let selectedIndex = -1;
                console.log(ev.key);
            }
        },
        ulSongs : {
            template : {
                li : {
                    tagName : "li",
                    pSongTitle : {
                        tagName : "p",
                        id : "pSongTitle",
                        onload : function(ev) {
                            tippy(this, {
                                content: "Click to view the lyrics",
                                interactive: false,
                                placement: 'top',
                                animation: 'scale',
                            });
                        },
                        onclick : function(ev) {
                            const id = ev.target.dataset.id;
                            this.classList.add("active");
                            live.lyricsHeader.text = this.text + " song lyrics";
                            live.lyricsHeader.style.color = "#ffee00";
                            $.get("/getsonglyrics/" + id, res => {
                                if (res.ok) {
                                    live.lyricsContainer.items.clear();
                                    let blocks = (res.data?.match(/\$\w[\s\S]*?(?=\$\w|$)/g)) || [];
                                    blocks.forEach(block => {
                                        let trimmedBlock = block.trim();
                                        if (trimmedBlock) {  // Make sure the block is not empty
                                            live.lyricsContainer.items.push({
                                                dataset : { id : id },
                                                innerHTML : trimmedBlock.replace(/\n/g, '<br>'),
                                            });
                                        }
                                    });
                                    live.ulSongs.items.forEach(row => {
                                        const p = row.children[0];
                                        if (id === p.dataset.id) {
                                            if (this.classList.contains("live")) {
                                                this.style.background = "linear-gradient(to right, #ffee00, #3ff53f)";
                                            }
                                        } else {
                                            p.classList.remove("active");
                                            if (p.classList.contains("live")) {
                                                p.style.color = "black";
                                                p.style.background = "#3ff53f";
                                            } else {
                                                p.style.color = "";
                                                p.style.background = "";
                                            }
                                        }
                                    });
                                }
                            }, true);
                        }
                    },
                    spanRemove : {
                        tagName : "span",
                        id : "spanRemove",
                        css : "gicon",
                        text : "delete",
                        style : {
                            color : "red",
                        },
                        onload : function(ev) {
                            tippy(this, {
                                content: "Remove from service",
                                interactive: false,
                                placement: 'top',
                                animation: 'scale',
                            });
                        },
                    },
                    spanEdit : {
                        tagName : "span",
                        id : "spanEdit",
                        css : "gicon",
                        text : "edit_document",
                        style : {
                            color : "#3be3c6",
                        },
                        onload : function(ev) {
                            tippy(this, {
                                content: "Edit on the go",
                                interactive: false,
                                placement: 'top',
                                animation: 'scale',
                            });
                        }
                    },
                    spanToLive : {
                        tagName : "span",
                        id : "spanToLive",
                        css : "gicon",
                        text : "play_arrow",
                        style : {
                            color : "#3ff53f",
                        },
                        onload : function(ev) {
                            tippy(this, {
                                content: "To live",
                                interactive: false,
                                placement: 'top',
                                animation: 'scale',
                            });
                        },
                        onclick : function(ev) {
                            let liveIcon;
                            let selectedSongId = 0;
                            live.ulSongs.items.forEach(row => {
                                const p = row.children[0];
                                if (this === row.children[3]) {
                                    liveIcon = row.children[3];
                                    selectedSongId = p.dataset.id;
                                    p.classList.add("live");
                                    if (p.classList.contains("active")) {
                                        p.style.background = "linear-gradient(to right, #ffee00, #3ff53f)";
                                    } else {
                                        p.style.color = "black";
                                        p.style.background = "#3ff53f";
                                    }
                                } else {
                                    p.classList.remove("live");
                                    if (p.classList.contains("active")) {
                                        p.style.background = "#ffee00";
                                    } else {
                                        p.style.color = "";
                                        p.style.background = "";
                                    }
                                }
                            });
                            $.get("/getsonglyrics/" + selectedSongId, res => {
                                if (res.ok) {
                                    live.ulLiveLyrics.items.clear();
                                    let blocks = (res.data?.match(/\$\w[\s\S]*?(?=\$\w|$)/g)) || [];
                                    const toDB = {
                                        lyricsId: selectedSongId,
                                        blocks: blocks
                                    };
                                    console.log("toDB is", toDB);
                                    saveToLocalDB("live", toDB);
                                    blocks.forEach(block => {
                                        let trimmedBlock = block.trim();
                                        if (trimmedBlock) {  // Make sure the block is not empty
                                            live.ulLiveLyrics.items.push({
                                                pre : {
                                                    tagName : "pre",
                                                    text : trimmedBlock
                                                },
                                                innerHTML : trimmedBlock.replace(/\n/g, '<br>'),
                                            });
                                        }
                                    });
                                }
                            }, true);
                        }
                    }
                }
            },
            items : [],
            onclick : function(ev) {
                if (ev.target.id && ev.target.id.startsWith('spanRemove')) {
                    const li = ev.target.closest('li');
                    const p = li.querySelector('p');
                    console.log(li.dataset.id);
                    console.log(p.text);
                    const index = songList.findIndex(item => item[0] === li.dataset.id && item[1] === p.text);
                    if (index !== -1) {
                        songList.splice(index, 1);
                    }
                    console.log(songList);
                    saveToLocalDB("songs", songList);
                    this.removeChild(li);
                    live.lyricsHeader.text = "SONG'S LYRICS";
                    live.lyricsContainer.items.clear();
                }
            }
        },
        controlCloseEditMode : {
            onclick : function(ev) {
                if (live.lyricsContainer.items.length > 0) {
                    $.confirm("Confirm to close editing?", res => {
                        if (res) {
                            live.lyricsContainer.items.clear();
                        }
                    });
                }
            }
        },
        controlClearSongList : {
            onclick : function(ev) {
                if (live.ulSongs.items.length > 0) {
                    $.confirm("Confirm to clear the song list?", res => {
                        if (res) {
                            live.ulSongs.items.clear();
                            $.post("/liveclear", res => {
                                if (res.ok) {
                                    console.debug("Live cleared.");
                                }
                            }, error => {
                                console.error("Error clearing live.", error);
                            }, true);
                            live.ulLiveLyrics.items.clear();
                            live.lyricsContainer.items.clear();
                            deleteFromLocalDB("songs");
                        }
                    });
                }
            }
        },
        controlViewLive : {
            onclick : function(ev) {
                // todo: stream live here
                $.alert("Sorry, this is not implemented yet.");
            }
        },
        controlPreview : {
            onclick : function(ev) {
                const newWindowUrl = `${window.location.protocol}/`;
                window.open(newWindowUrl, 'previewWindow', 'width=800,height=600,toolbar=no,scrollbars=yes,resizable=yes');
            }
        },
        lyricsHeader : {},
        lyricsContainer : {
            template : {
                li : {
                    tagName : "li",
                    style : {
                        borderBottom : "1px solid white",
                    },
                    ondblclick : function(ev) {
                        this.contentEditable = true;
                        this.focus();
                        this.style.backgroundColor = "yellow";
                        this.style.color = "black";
                    },
                    onblur : function(ev) {
                        this.contentEditable = false;
                        this.style.backgroundColor = "";
                        this.style.color = "";
                        let lyrics = "";
                        live.lyricsContainer.items.forEach(row => {
                            lyrics += row.text + "\n";
                        });
                        const data = {
                            id : this.dataset.id,
                            lyrics : lyrics.trimEnd()
                        };
                        $.post("/saveeditedsong", data, res => {
                            if (res.ok) {
                                autoSaveTippy[0].show();
                            } else {
                                $.failure("Something's wrong saving your edits.");
                            }
                        }, true);
                    },
                    onkeydown : function(ev) {
                        if (ev.key === "Enter" && !ev.shiftKey) {
                            document.execCommand('insertHTML', false, '<br><br>'); // Insert a new line with a break
                            ev.preventDefault();
                        }
                    }
                },
            },
            items : [],
        },
    });
    loadSnapshot();
    const resizer = $("#resizer", {
        onmousedown : function(ev) {
            isResizing = true;
            document.body.style.cursor = 'col-resize';
        }
    });
    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;

        const containerRect = wrapper.getBoundingClientRect();
        const newWidth = e.clientX - containerRect.left; // Calculate the new width for section1

        songs.style.flexBasis = `${newWidth}px`;
        live.style.flexBasis = `calc(100% - ${newWidth}px - 4px)`; // Adjust section2 width
    });

    document.addEventListener('mouseup', () => {
        isResizing = false;
        document.body.style.cursor = 'default';
    });
    const wrapper = $(".wrapper", {
        onload : function(ev) {
            $.get("/checksessions", res => {
                if (res.ok) {
                    container.show = false;
                    bubbles.show = false;
                    header.show = true;
                    mainControl.show = true;
                    getSongList();
                    localStorage.setItem("login", true);
                    const wifi = JSON.parse(res.wifistatus);
                    if (wifi.status === "connected") {
                        mainControl.navWiFi.style.color = "green";
                    } else {
                        mainControl.navWiFi.style.color = "";
                    }
                } else {
                    header.show = false;
                    mainControl.show = false;
                    container.show = true
                    bubbles.show = true;
                    localStorage.clear();
                }
            }, true);
        }
    });
    const form = $(".form");
    const inputUsername = $("#inputUsername");
    const inputPassword = $("#inputPassword");
    const loginButton = $("#loginButton", {
        onclick : function(ev) {
            ev.preventDefault();
            const username = inputUsername.value;
            const password = inputPassword.value;
            if (username === "" || password === "") {
                $.failure("Username or Password cannot be empty!");
            } else {
                const data = {
                    user : username,
                    pass : password
                };
                $.post("/login", data, res => {
                    if (res.ok) {
                        form.show = false;
                        wrapper.classList.add("form-success");
                        localStorage.setItem("login", true);
                        location.reload();
                    } else {
                        $.failure("Error: ", res.message);
                    }
                }, true);
            }
        }
    });
    function getSongList() {
        $.get("/getsongs", res => {
            if (res.ok) {
                songs.tbodySongList.items.clear();
                res.data.forEach(item => {
                    songs.tbodySongList.items.push({
                        dataset : { id : item.id },
                        author : { text : item.author },
                        songTitle : { text : item.songTitle }
                    });
                });
            } else {
                console.debug("Error getting all the songs");
            }
        });
    }
    function editSong(songId) {
        $.get("/editsong/" + songId, res => {
            if (res.ok) {
                localStorage.setItem("data", JSON.stringify(res.data));
                const newWindowUrl = `${window.location.protocol}/create`;
                window.open(newWindowUrl, 'createWindow', 'width=800,height=600,toolbar=no,scrollbars=yes,resizable=yes');
            }
        });
    }
/*
    evtSource.addEventListener("wifi", function (ev) {
        const res = JSON.parse(ev.data);
        if (res.data.status === "connected") {
            mainControl.navWiFi.style.color = "green";
        } else {
            mainControl.navWiFi.style.color = "";
        }
    });
*/
    const liElements = live.ulLiveLyrics.getElementsByTagName('li');
    let selectedIndex = -1;
    document.addEventListener('keydown', function(event) {
        console.log(event.key);
        if (event.key === 'ArrowDown') {
            // Prevent default scroll behavior
            event.preventDefault();
            // Move to the next item if not already at the last one
            if (selectedIndex < liElements.length - 1) {
                changeSelection(1);
            }
        } else if (event.key === 'ArrowUp') {
            // Prevent default scroll behavior
            event.preventDefault();
            // Move to the previous item if not already at the first one
            if (selectedIndex > 0) {
                changeSelection(-1);
            }
        }
    });
    function changeSelection(direction) {
        // Remove the class from the currently selected item
        if (selectedIndex >= 0) {
            liElements[selectedIndex].classList.remove("active");
        }
        // Update the selected index
        selectedIndex += direction;
        const currentlySelected = liElements[selectedIndex];
        // Add the class to the newly selected item
        currentlySelected.classList.add("active");
        // Scroll the item into view if necessary (optional)
        currentlySelected.scrollIntoView({ block: 'nearest' });

        console.log(currentlySelected);

        /*const data = {
            lyrics : row.text
        };
        $.post("/stream", data, res => {
            if (res.ok) {
                console.debug("lyrics sent.");
            }
        }, true);*/
    }
    async function loadSnapshot() {
        const liveSong = db.live.get("live").then(liveSong => {
            if (liveSong) {
                live.ulLiveLyrics.items.clear();
                const selectedSongId = liveSong.lyricsId;
                const blocks = liveSong.lyrics;
                blocks.forEach(block => {
                    let trimmedBlock = block.trim();
                    if (trimmedBlock) {
                        live.ulLiveLyrics.items.push({
                            pre : {
                                tagName : "pre",
                                text : trimmedBlock
                            },
                            innerHTML : trimmedBlock.replace(/\n/g, '<br>'),
                        });
                    }
                });
            } else {
                console.log("No saved live song");
            }
        });
        const listSong = db.songs.get("songs").then(list => {
            if (list) {
                list.list.forEach(song => {
                    const id = song[0];
                    const title = song[1];
                    songList.push([id, title]);
                    live.ulSongs.items.push({
                        dataset : { id : id },
                        pSongTitle : {
                            dataset : { id : id },
                            text : title
                        }
                    });
                });
            } else {
                console.log("No saved song list");
            }
        });
    }
    async function saveToLocalDB(key, data) {
        try {
            switch (key) {
                case "live":
                    console.log("Saving live data:", data);
                    if (!data.lyricsId || !data.blocks) {
                        console.error("Invalid data for live store: lyricsId or blocks missing");
                        return;
                    }
                    await db.live.put({ id: "live", lyricsId: data.lyricsId, lyrics: data.blocks });
                    const liveSong = await db.live.get("live");
                    console.log("Saved live song - ID:", liveSong.lyricsId, "Lyrics:", liveSong.lyrics);
                    break;
                case "songs":
                    console.log("Saving songs data:", data);
                    if (!data) {
                        console.error("Invalid data for songs store: id or list missing");
                        return;
                    }
                    await db.songs.put({ id: "songs", list: data });
                    const songList = await db.songs.get("songs"); // Use data.id instead of hardcoded "songs"
                    console.log("Saved song list - ID:", songList.id, "List:", songList.list);
                    break;
                default:
                    console.warn("Unknown key for saveToLocalDB:", key);
                    break;
            }
        } catch (error) {
            console.error("Error saving to local DB:", error);
        }
    }
    async function deleteFromLocalDB(key) {
        switch (key) {
            case "live":
                await db.live.delete("live");
                break;
            case "songs":
                await db.songs.delete("songs");
                await db.live.delete("live");
                break;
            default:
                break;
        }
    }
});