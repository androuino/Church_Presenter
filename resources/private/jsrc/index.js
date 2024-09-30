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
    const splashScreen = $("#splashScreen");
    const main = $("#main");
    const lyrics = $("#lyrics");
    const videoContainer = $("#videoContainer", {
        show : false,
    });
    const imageContainer = $("#imageContainer", {
        show : false,
    });
    const info = $("#info", {
        show : false,
    });
    const evtSource = new EventSource('/events');
    const body = $("body", {
        onload : function(ev) {
            setTimeout(function() {
                splashScreen.style.display = "none";
                main.style.display = "flex";
                info.show = true;
                videoContainer.show = true;
                videoContainer.src = "assets/tiny.mp4"
            }, 3000);
        },
    });
    evtSource.addEventListener("lyrics", function (ev) {
        let evData = ev.data;
        let lines = evData.split("\\n");
        lines.shift();
        const join = lines.join("\n");
        const formattedText = join.replace(/\\n/g, '\n');
        const clean = formattedText.replace(/\$[a-zA-Z]/, '');
        const finalText = clean.replaceAll('"', '');
        lyrics.textContent = finalText;
    });
    evtSource.addEventListener("settings", function (ev) {
    });
    evtSource.addEventListener("clear", function (ev) {
        lyrics.textContent = "";
    });
    evtSource.addEventListener("theme", function (ev) {
        var data = JSON.parse(JSON.parse(ev.data));
        const id = data.id;
        const font = data.font;
        const fontSize = data.font_size;
        const fontColor = data.font_color;
        const bold = data.bold;
        const italic = data.italic;
        const strikeThrough = data.strike_through;
        const topLeft = data.top_left_offset;
        const topMiddle = data.top_middle_offset;
        const topRight = data.top_right_offset;
        const leftUpper = data.left_upper_offset;
        const rightUpper = data.right_upper_offset;
        const leftMiddle = data.left_middle_offset;
        const rightMiddle = data.right_middle_offset;
        const leftLower = data.left_lower_offset;
        const rightLower = data.right_lower_offset;
        const leftBottom = data.left_bottom_offset;
        const middleBottom = data.middle_bottom_offset;
        const rightBottom = data.right_bottom_offset;
        const textAlign = data.text_align;
        const justifyContent = data.justify_content;
        const alignItems = data.align_items;

        const marginTop = topLeft + topMiddle + topRight;
        const marginBottom = leftBottom + middleBottom + rightBottom;
        const marginLeft = leftUpper + leftMiddle + leftLower;
        const marginRight = rightUpper + rightMiddle + rightLower;

        lyrics.style.marginTop = marginTop + "px";
        lyrics.style.marginBottom = marginBottom + "px";
        lyrics.style.marginLeft = marginLeft + "px";
        lyrics.style.marginRight = marginRight + "px";

        lyrics.style.fontFamily = font;
        lyrics.style.fontSize = fontSize + "px";
        lyrics.style.color = fontColor;
        if (bold) {
            lyrics.style.fontWeight = "bold";
        }
        if (italic) {
            lyrics.style.fontStyle = "italic";
        }
        if (strikeThrough) {
            lyrics.style.textDecoration = "line-through";
        }

        lyrics.style.textAlign = data.text_align;
        main.style.justifyContent = data.justify_content;
        main.style.alignItems = data.align_items;
    });
    evtSource.addEventListener("verse", function (ev) {
        var data = JSON.parse(JSON.parse(ev.data));
        $.post("/searchbibleverse", data, res => {
            if (res.ok) {
                var newLine = "";
                var book = "";
                const data = res.data;
                if (data.length > 1) {
                    newLine = '\n\n';
                }
                const numOfMaps = data.length;
                const numOfKeys = Object.keys(data[0]).length;
                for (let i = 0; i < numOfKeys; i++) {
                    // Create an array to hold the combined values for the current index
                    const combinedValues = [];
                    var verse = "";
                    // Iterate through each map to get the value at the current index
                    for (let j = 0; j < numOfMaps; j++) {
                        verse += data[j][Object.keys(data[j])[i]] + newLine;
                    }
                    for (let j = 0; j < numOfMaps; j++) {
                        // Get the key at the current index
                        const key = Object.keys(data[j])[i];
                        book = key;  // Concatenate the keys with newline
                    }
                }
                lyrics.textContent = verse;
                info.textContent = book;
            }
        }, error => {
            console.error("Error getting verse", error);
        }, true);
    });
    evtSource.addEventListener("media", function (ev) {
    });
    evtSource.addEventListener("hidelyrics", function (ev) {
        lyrics.show = false;
    });
    evtSource.addEventListener("blackscreen", function (ev) {
        lyrics.show = false;
        videoContainer.src = "";
        videoContainer.show = false;
        imageContainer.src = "";
        imageContainer.show = false;
        info.show = false;
    });
    evtSource.addEventListener("showdesktop", function (ev) {
        body.style.opacity = 0;
    });
    // Default
    evtSource.addEventListener("showlyrics", function (ev) {
        lyrics.show = true;
        info.show = true;
    });
    function requestFullScreen() {
        if (document.body.requestFullscreen) {
            document.body.requestFullscreen();
        } else if (document.body.mozRequestFullScreen) { // Firefox
            document.body.mozRequestFullScreen();
        } else if (document.body.webkitRequestFullscreen) { // Chrome, Safari, Opera
            document.body.webkitRequestFullscreen();
        } else if (document.body.msRequestFullscreen) { // IE/Edge
            document.body.msRequestFullscreen();
        }
    }
});
