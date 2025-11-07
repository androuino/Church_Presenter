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
    const placeholder = "$v\n" +
                      "The splendor of a King,\n" +
                      "clothed in majesty\n" +
                      "Let all the earth rejoice\n" +
                      "...\n" +
                      "$c\n" +
                      "How great is our God\n" +
                      "sing with me\n" +
                      "How great is our God\n" +
                      "...\n" +
                      "$b\n" +
                      "Name above all names\n" +
                      "Worthy of our praise\n" +
                      "..."
    let indicator = false;
    let songId = 0;
    $("body", {
        onload : function(ev) {
            const data = JSON.parse(localStorage.getItem("data"));
            if (data != null) {
                songId = data.id;
                inputAuthor.value = data.author;
                inputSongTitle.value = data.songTitle;
                taLyrics.value = data.lyrics;
                indicator = true;
            }
        }
    });
    const inputAuthor = $("#inputAuthor");
    const inputSongTitle = $("#inputSongTitle");
    const taLyrics = $("#taLyrics", {
        placeholder : placeholder,
    });
    const buttonSave = $("#buttonSave", {
        onclick : function(ev) {
            if (inputAuthor.value === "" || inputSongTitle.value === "" || taLyrics.value === "") {
                $.failure("You're leaving some field/s blank.");
            } else {
                const data = {
                    id: songId,
                    author: inputAuthor.value,
                    title: inputSongTitle.value,
                    lyrics: taLyrics.value
                };
                $.put("/savesong", data, res => {
                    if (res.ok) {
                        $.success("Saving song success!");
                        if (indicator) {
                            localStorage.setItem("data", null);
                        }
                    } else {
                        $.failure("Something's wrong.");
                    }
                }, true);
            }
        }
    });
    window.addEventListener('unload', function () {
        localStorage.setItem("data", null);
    });
});