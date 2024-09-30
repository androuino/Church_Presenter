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
    const evtSource = new EventSource('/events');
    var select = null;
    var songId = null;
    var songTitle = "";
    var isResizing = false;
    const header = $("#header");
    const container = $(".container");
    const mainControl = $("#mainControl");
    const bubbles = $("#bubbles");
    const tableSong = $("#tableSong");
    const songs = $("#songs");
    const live = $("#live");
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
    const ulLiveLyrics = $("#ulLiveLyrics", {
        template : {
            li : {
                tagName : "li",
                onclick : function(ev) {
                    const id = this.dataset.id;
                    this.classList.add("active");
                    ulLiveLyrics.items.forEach(row => {
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
                }
            },
        },
        items : [],
    });
    const ulSongs = $("#ulSongs", {
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
                        lyricsHeader.text = this.text + " song lyrics";
                        lyricsHeader.style.color = "#ffee00";
                        $.get("/getsonglyrics/" + id, res => {
                            if (res.ok) {
                                lyricsContainer.items.clear();
                                let blocks = res.data.match(/\$\w[\s\S]*?(?=\$\w|$)/g);
                                blocks.forEach(block => {
                                    let trimmedBlock = block.trim();
                                    if (trimmedBlock) {  // Make sure the block is not empty
                                        lyricsContainer.items.push({
                                            dataset : { id : id },
                                            innerHTML : trimmedBlock.replace(/\n/g, '<br>'),
                                        });
                                    }
                                });
                                ulSongs.items.forEach(row => {
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
                        var liveIcon;
                        var selectedSongId = 0;
                        ulSongs.items.forEach(row => {
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
                                ulLiveLyrics.items.clear();
                                let blocks = res.data.match(/\$\w[\s\S]*?(?=\$\w|$)/g);
                                blocks.forEach(block => {
                                    let trimmedBlock = block.trim();
                                    if (trimmedBlock) {  // Make sure the block is not empty
                                        ulLiveLyrics.items.push({
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
                this.removeChild(li);
                lyricsHeader.text = "SONG'S LYRICS";
                lyricsContainer.items.clear();
            }
        }
    });
    const lyricsHeader = $("#lyricsHeader");
    const lyricsContainer = $("#lyricsContainer", {
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
                    var lyrics = "";
                    lyricsContainer.items.forEach(row => {
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
    });
    const tbodySongList = $("#tbodySongList", {
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
                                        ulSongs.items.push({
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
                    tbodySongList.items.forEach(row => {
                        if (row.dataset.id != songId) {
                            row.classList.remove("active");
                            row.style.background = "";
                        } else {
                            row.style.background = "#ffee00";
                            const secondCell = row.querySelectorAll('td')[1];
                            if (secondCell) {
                                songTitle = secondCell.textContent;
                            }
                        }
                    });

                },
                onmouseover : function(ev) {
                    songId = this.dataset.id;
                }
            }
        },
        items : [],
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
                $.post("/login.path", data, res => {
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
    const navNew = $("#navNew", {
        onclick : function(ev) {
            const newWindowUrl = `${window.location.protocol}/create`;
            window.open(newWindowUrl, 'createWindow', 'width=800,height=600,toolbar=no,scrollbars=yes,resizable=yes');
        }
    });
    const navEdit = $("#navEdit", {
        onclick : function(ev) {
            if (select === null) {
                $.failure("Please select a song to edit.");
            } else {
                editSong(songId);
            }
        }
    });
    const navDelete = $("#navDelete", {
        onclick : function(ev) {
            if (select === null) {
                $.failure("Please select a song to delete.");
            } else {
                $.alert("Deleting...");
            }
        }
    });
    const navInfo = $("#navInfo", {
        onclick : function(ev) {
            // todo: show a modal form here
            // info:
            // Software: HWVCI Presenter
            // Version: 1.0
            // Developer: Sem Moreno
            // Website: https://josapedmoreno.xyz
        }
    });
    const navLogout = $("#navLogout", {
        onclick : function(ev) {
            $.confirm("Are you want to log out?", res => {
                if (res) {
                    $.get("/logout.path", res => {
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
    });
    const inputSearch = $("#inputSearch", {
        onkeyup : function(ev) {
            let filter = this.value.toUpperCase();
            let tr = tableSong.getElementsByTagName('tr');
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
    });
    const iconSearch = $("#iconSearch", {
        onclick : function(ev) {
            let filter = inputSearch.value.toUpperCase();
            let tr = tableSong.getElementsByTagName('tr');
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
    });
    const clearLive = $("#clearLive", {
        onclick : function(ev) {
            if (ulLiveLyrics.items.length > 0) {
                $.confirm("Confirm to clear.", res => {
                    if (res) {
                        $.post("/liveclear", res => {
                            if (res.ok) {
                                console.debug("Live cleared.");
                            }
                        }, error => {
                            console.error("Error clearing live.", error);
                        }, true);
                        ulLiveLyrics.items.clear();
                        ulSongs.items.forEach(row => {
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
            }
        }
    });
    const controlClearSongList = $("#controlClearSongList", {
        onclick : function(ev) {
            if (ulSongs.items.length > 0) {
                $.confirm("Confirm to clear the song list?", res => {
                    if (res) {
                        ulSongs.items.clear();
                    }
                });
            }
        }
    });
    const navWiFi = $("#navWiFi", {
        onclick : function(ev) {
            const newWindowUrl = `${window.location.protocol}/wifisettings`;
            window.open(newWindowUrl, 'wifiSettingWindow', 'width=800,height=400,toolbar=no,scrollbars=yes,resizable=yes');
        }
    });
    // todo
    const navSettings = $("#navSettings", {
        onclick : function(ev) {
            $.get("/settings", res => {
                const newWindowUrl = `${window.location.protocol}/settings`;
                window.open(newWindowUrl, 'settingsWindow', 'width=1200,height=700,toolbar=no,scrollbars=yes,resizable=yes');
            }, true);
        }
    });
    function getSongList() {
        $.get("/getsongs", res => {
            if (res.ok) {
                tbodySongList.items.clear();
                res.data.forEach(item => {
                    tbodySongList.items.push({
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
    evtSource.addEventListener("wifi", function (ev) {
        var data = JSON.parse(JSON.parse(ev.data));
        if (data.status === "connected") {
            navWiFi.style.color = "green";
        } else {
            navWiFi.style.color = "";
        }
    });
    const controlViewLive = $("#controlViewLive", {
        onclick : function(ev) {
            const newWindowUrl = `${window.location.protocol}/`;
            window.open(newWindowUrl, 'liveWindow', 'width=800,height=600,toolbar=no,scrollbars=yes,resizable=yes');
        }
    });
    const controlDefault = $("#controlDefault", {
        onclick : function(ev) {
            $.post("/showlyrics", res => {
                if (res.ok) {
                    console.debug("lyrics is shown.");
                }
            }, error => {
                console.error("error showing lyrics.", error);
            }, true);
        }
    });
    const controlBlackScreen = $("#controlBlackScreen", {
        onclick : function(ev) {
            $.post("/blackscreen", res => {
                if (res.ok) {
                    console.debug("black screen activated.");
                }
            }, error => {
                console.error("error setting screen to black.", error);
            }, true);
        }
    });
    const controlHideLyrics = $("#controlHideLyrics", {
        onclick : function(ev) {
            $.post("/hidelyrics", res => {
                if (res.ok) {
                    console.debug("lyrics is hidden.");
                }
            }, error => {
                console.error("error hiding lyrics.", error);
            }, true);
        }
    });
    tippy('#navNew', {
        content: "Create a new song",
        interactive: true,
        placement: 'right',
        animation: 'scale',
    });
    tippy('#navEdit', {
        content: "Edit an existing song",
        interactive: true,
        placement: 'right',
        animation: 'scale',
    });
    tippy('#navDelete', {
        content: "Delete a song",
        interactive: true,
        placement: 'right',
        animation: 'scale',
    });
    tippy('#navInfo', {
        allowHTML: true,
        content: 'About',
        interactive: true,
        placement: 'right',
        animation: 'scale',
    });
    tippy('#navWiFi', {
        content: "Connect the server to a wifi network",
        interactive: true,
        placement: 'right',
        animation: 'scale',
    });
    tippy('#navSettings', {
        content: "Settings",
        interactive: true,
        placement: 'right',
        animation: 'scale',
    });
    tippy('#navLogout', {
        content: "Log out",
        interactive: true,
        placement: 'right',
        animation: 'scale',
    });
    tippy('#iconSearch', {
        content: "Search",
        interactive: true,
        placement: 'top',
        animation: 'scale',
    });
    tippy('#lyricsContainer', {
        content: "Double click to edit",
        interactive: false,
        placement: 'top',
        animation: 'scale',
    });
    tippy('#clearLive', {
        content: "Clear live",
        interactive: false,
        placement: 'top',
        animation: 'scale',
    });
    const autoSaveTippy = tippy("#lyricsContainer", {
        content: "Save edit success!",
        interactive: false,
        placement: 'top',
        trigger: 'manual',
        animation: 'scale',
    });
    tippy('#controlDefault', {
        content: "Default screen",
        interactive: false,
        placement: 'top',
        animation: 'scale',
    });
    tippy('#controlBlackScreen', {
        content: "Set screen to black",
        interactive: false,
        placement: 'top',
        animation: 'scale',
    });
    tippy('#controlHideLyrics', {
        content: "Hide the lyric",
        interactive: false,
        placement: 'top',
        animation: 'scale',
    });
    tippy('#controlClearSongList', {
        content: "Clear song list",
        interactive: false,
        placement: 'top',
        animation: 'scale',
    });
    tippy('#controlViewLive', {
        content: "Live view",
        interactive: false,
        placement: 'top',
        animation: 'scale',
    });
    tippy('#controlPreview', {
        content: "Preview",
        interactive: false,
        placement: 'top',
        animation: 'scale',
    });
});
/*
[Unit]
Description=Your Java Application
After=local-fs.target

[Service]
User=pi
ExecStart=/usr/bin/java -jar /path/to/your/application.jar
SuccessExitStatus=143
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
*/