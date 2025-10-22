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
    const mediaContainer = $("#mediaContainer");
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
                loadMedia("assets/tiny.mp4");

                $.get("/getip", res => {
                    console.log(res);
                    if (res.ok) {
                        if (res.data.status === "connected") {
                            info.textContent = res.data.ip;
                        }
                    }
                }, error => {
                    console.error("Error getting ip.", error);
                }, true);
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
    evtSource.addEventListener("settings", function (ev) {});
    evtSource.addEventListener("clear", function (ev) {
        console.log("clear received.");
        lyrics.textContent = "";
        info.textContent = "HWVCI Presenter";
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
        mediaContainer.innerHTML = "";
        info.show = false;
    });
    evtSource.addEventListener("showdesktop", function (ev) {
    });
    // Default
    evtSource.addEventListener("showlyrics", function (ev) {
        lyrics.show = true;
        info.show = true;
    });
    evtSource.addEventListener("removebackground", function (ev) {
        mediaContainer.innerHTML = "";
    });
    evtSource.addEventListener("title", function (ev) {
        info.textContent = ev.data.replaceAll('"', "");
    });
    evtSource.addEventListener("changebackground", function (ev) {
        const origName = ev.data.replaceAll('"', "");
        if (origName === "link") {
            $.get("/getlink", res => {
                if (res.ok) {
                    console.log(res.link);
                    loadMedia(res.link);
                } else {
                    console.log("Failed to get link");
                }
            }, error => {
                console.error("Error get bg link", error);
            }, true);
        } else {
            const file = "uploaded/" + origName;
            loadMedia(file);
        }
    });
    evtSource.addEventListener("connected", function (ev) {
        const res = ev.data.replaceAll('"', "");
        if (res === "true") {
            info.textContent = "info";
        }
    });
    evtSource.addEventListener("apmode", function (ev) {
        const res = ev.data.replaceAll('"', "");
        info.textContent = res;
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
    function loadMediaOld(file) {
        mediaContainer.innerHTML = ''; // Clear any previous content

        if (file.endsWith('.mp4') || file.endsWith('.webm') || file.endsWith('.ogg')) {
            let mimeType = '';

            // Determine the correct MIME type based on the file extension
            if (file.endsWith('.mp4')) {
                mimeType = 'video/mp4';
            } else if (file.endsWith('.webm')) {
                mimeType = 'video/webm';
            } else if (file.endsWith('.ogg')) {
                mimeType = 'video/ogg';
            }

            // Insert the video element with the appropriate MIME type
            mediaContainer.innerHTML = `
                <video id="player" style="object-fit: cover;" autoplay muted loop>
                    <source src="${file}" type="${mimeType}" />
                    Your browser does not support the video tag.
                </video>
            `;
            const player = new Plyr('#player'); // Initialize Plyr
        } else if (file.endsWith('.jpeg') || file.endsWith('.jpg') || file.endsWith('.png')) {
            mediaContainer.innerHTML = `<img id="imgContainer" style="object-fit: cover;" src="${file}" alt="Image"/>`;
        } else {
            mediaContainer.innerHTML = "";
        }
    }
    function loadMedia(fileOrLink) {
        mediaContainer.innerHTML = ''; // Clear previous content

        const isLink = fileOrLink.startsWith('http://') || fileOrLink.startsWith('https://') || fileOrLink.startsWith('www.');

        // Attempt to get an embed URL for supported services
        const embedUrl = isLink ? getEmbedUrl(fileOrLink) : null;

        if (embedUrl) {
            // It's a third-party video (YouTube/Vimeo/Dailymotion)
            mediaContainer.innerHTML = `
                <iframe
                    width="100%"
                    height="100%"
                    src="${embedUrl}"
                    frameborder="0"
                    allow="autoplay; encrypted-media"
                    allowfullscreen>
                </iframe>
            `;
        }
        // Self-hosted video
        else if (
            fileOrLink.endsWith('.mp4') ||
            fileOrLink.endsWith('.webm') ||
            fileOrLink.endsWith('.ogg') ||
            (isLink && (fileOrLink.includes('.mp4') || fileOrLink.includes('.webm') || fileOrLink.includes('.ogg')))
        ) {
            let mimeType = '';
            if (fileOrLink.endsWith('.mp4') || (isLink && fileOrLink.includes('.mp4'))) mimeType = 'video/mp4';
            else if (fileOrLink.endsWith('.webm') || (isLink && fileOrLink.includes('.webm'))) mimeType = 'video/webm';
            else if (fileOrLink.endsWith('.ogg') || (isLink && fileOrLink.includes('.ogg'))) mimeType = 'video/ogg';

            mediaContainer.innerHTML = `
                <video id="player" style="object-fit: cover; width:100%; height:100%;" autoplay muted loop playsinline>
                    <source src="${fileOrLink}" type="${mimeType}" />
                    Your browser does not support the video tag.
                </video>
            `;

            // Initialize Plyr after element is in DOM
            const playerElement = document.getElementById('player');
            if (playerElement) {
                const player = new Plyr(playerElement);
            }
        }
        // Image
        else if (
            fileOrLink.endsWith('.jpeg') ||
            fileOrLink.endsWith('.jpg') ||
            fileOrLink.endsWith('.png') ||
            (isLink && (fileOrLink.includes('.jpeg') || fileOrLink.includes('.jpg') || fileOrLink.includes('.png')))
        ) {
            mediaContainer.innerHTML = `
                <img id="imgContainer" style="object-fit: cover; width:100%; height:100%;" src="${fileOrLink}" alt="Image"/>
            `;
        }
        // Unsupported media
        else {
            mediaContainer.innerHTML = "Unsupported media format.";
        }
    }
    function getEmbedUrl(url) {
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            let videoId = '';
            if (url.includes('youtu.be')) videoId = url.split('/').pop().split('?')[0];
            else videoId = new URL(url).searchParams.get('v');

            if (!videoId) return null;

            return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&loop=1&playlist=${videoId}`;
        }
        else if (url.includes('vimeo.com')) {
            let videoId = url.split('/').pop().split('?')[0];
            return `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&loop=1&title=0&byline=0&portrait=0`;
        }
        else if (url.includes('dailymotion.com')) {
            let videoId = url.split('/').pop().split('_')[0];
            return `https://www.dailymotion.com/embed/video/${videoId}?autoplay=1&mute=1&controls=0`;
        }
        // Add more services here...
        else {
            return null; // Unsupported
        }
    }
});
