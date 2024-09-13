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
    let howToContent = "<p>Song sections</p>" +
                       "<p>Small or capital letter is fine</p>" +
                       "<p>--------------------------</p>" +
                       "<p>$I - for INTRO</p>" +
                       "<p>--------------------------</p>" +
                       "<p>$P - for PRE-CHORUS</p>" +
                       "<p>--------------------------</p>" +
                       "<p>$V - for VERSE</p>" +
                       "<p>--------------------------</p>" +
                       "<p>$C - for CHORUS</p>" +
                       "<p>--------------------------</p>" +
                       "<p>$B - for BRIDGE</p>" +
                       "<p>--------------------------</p>" +
                       "<p>$R - for REFRAIN</p>" +
                       "<p>--------------------------</p>" +
                       "<p>$O - for OUTRO</p>" +
                       "<p>--------------------------</p>" +
                       "<p>Example</p>" +
                       "<p>$V</p>" +
                       "<p>The splendor of a King...</p>" +
                       "<p>$c</p>" +
                       "<p>How great is our God</p>" +
                       "<p>$b</p>" +
                       "<p>Name above all names.</p>";
    let placeholder = "v\n" +
                      "The splendor of a King,\n" +
                      "clothed in majesty\n" +
                      "Let all the earth rejoice\n" +
                      "...\n" +
                      "c\n" +
                      "How great is our God\n" +
                      "sing with me\n" +
                      "How great is our God\n" +
                      "...\n" +
                      "b\n" +
                      "Name above all names\n" +
                      "Worthy of our praise\n" +
                      "..."
    var indicator = false;
    var songId = 0;
    $("body", {
        onload : function(ev) {
            if (localStorage.getItem("data") != null) {
                const data = JSON.parse(localStorage.getItem("data"));
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
                    id : songId,
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
    tippy('#howTo', {
        allowHTML: true,
        content: howToContent,
        interactive: true,
        placement: "bottom-end",
        trigger: "click",
        onShow: async (instance) => {
            // call a function here
        }
    });
});