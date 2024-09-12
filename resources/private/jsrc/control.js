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
    var select = null;
    var songId = null;
    var songTitle = "";
    const header = $("#header");
    const container = $(".container");
    const mainControl = $("#mainControl");
    const bubbles = $("#bubbles");
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
                        console.log(ev.target.dataset.id);
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
                    }
                }
            }
        },
        items : [],
        onclick : function(ev) {
            if (ev.target.id && ev.target.id.startsWith('spanRemove')) {
                const li = ev.target.closest('li');
                this.removeChild(li);
            }
        }
    });
    const lyricsContainer = $("#lyricsContainer", {
        template : {
            li : {
                tagName : "li",
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
                        text : "delete",
                        style : {
                            color : "red",
                        },
                        onload : function(ev) {
                            tippy(this, {
                                content: "Delete",
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
                                $.get("/editsong/" + songId, res => {
                                    if (res.ok) {
                                        localStorage.setItem("data", JSON.stringify(res.data));
                                        window.open('http://localhost:5555/create', 'newWindow', 'width=800,height=600,toolbar=no,scrollbars=yes,resizable=yes');
                                    }
                                });
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
                                ulSongs.items.push({
                                    dataset : { id : songId },
                                    pSongTitle : {
                                        dataset : { id : songId },
                                        text : songTitle
                                    },
                                });
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
            window.open('http://localhost:5555/create', 'newWindow', 'width=800,height=600,toolbar=no,scrollbars=yes,resizable=yes');
        }
    });
    const navEdit = $("#navEdit", {
        onclick : function(ev) {
            if (select === null) {
                $.failure("Please select a song to edit.");
            } else {
                $.alert("Editing...");
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
    const navInfo = $("#navInfo");
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
        onkeypress : function(ev) {
            if (ev.key === "Enter") {
                if (this.value === "") {
                    $.failure("I did not get that!");
                } else {
                    $.alert("Searching...");
                }
            }
        }
    });
    const iconSearch = $("#iconSearch", {
        onclick : function(ev) {
            if (inputSearch.value === "") {
                $.failure("I did not get that!");
            } else {
                $.alert("Searching...");
            }
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
    tippy('#navNew', {
        content: "Create a new song",
        interactive: true,
        placement: 'top',
        animation: 'scale',
    });
    tippy('#navEdit', {
        content: "Edit an existing song",
        interactive: true,
        placement: 'top',
        animation: 'scale',
    });
    tippy('#navDelete', {
        content: "Delete a song",
        interactive: true,
        placement: 'top',
        animation: 'scale',
    });
    tippy('#navInfo', {
        allowHTML: true,
        content: '<p>Application: HWVCI Presenter</p>\n<p>Software version: 1.0</p>\n<p>Developer: Sem Moreno</p>\n<p>Website: <a href="https://josapedmoreno.xyz" target="_blank">josapedmoreno.xyz</a></p>',
        interactive: true,
        trigger: "click",
        onShow: async (instance) => {
            // call a function here
        }
    });
    tippy('#navLogout', {
        content: "Log out",
        interactive: true,
        placement: 'top',
        animation: 'scale',
    });
    tippy('#iconSearch', {
        content: "Search",
        interactive: true,
        placement: 'top',
        animation: 'scale',
    });
});