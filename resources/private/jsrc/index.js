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
        try {
            const outer = JSON.parse(ev.data);
            let raw = outer.data;
            const lines = raw.split(/\r?\n/);  // Handles \n, \r\n
            if (lines.length > 0 && /^\$[a-zA-Z]/.test(lines[0])) {
                lines.shift();  // Remove $v, $c, etc.
            }
            const finalText = lines.join('\n');
            lyrics.textContent = finalText;

            console.log("Cleaned lyrics:", finalText);
        } catch (err) {
            console.error("Failed to parse lyrics event:", err, ev.data);
        }
    });
    evtSource.addEventListener("settings", function (ev) {});
    evtSource.addEventListener("clear", function (ev) {
        console.log("clear received.");
        lyrics.textContent = "";
        info.textContent = "HWVCI Presenter";
    });
    evtSource.addEventListener("theme", function (ev) {
        var payload = JSON.parse(ev.data);
        let data;
        if (payload.type === "application/json") {
            data = JSON.parse(payload.data);
        } else {
            data = payload;
        }
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
        const data = JSON.parse(ev.data);
        console.log("verse is", data.data);
        $.post("/searchbibleverse", data, res => {
            if (res.ok) {
                let newLine = "";
                let book = "";
                const data = res.data;
                if (data.length > 1) {
                    newLine = '\n\n';
                }
                const numOfMaps = data.length;
                const numOfKeys = Object.keys(data[0]).length;
                for (let i = 0; i < numOfKeys; i++) {
                    // Create an array to hold the combined values for the current index
                    const combinedValues = [];
                    let verse = "";
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
        const data = JSON.parse(ev.data);
        info.textContent = data.data.replaceAll('"', "");
    });
    evtSource.addEventListener("changebackground", function (ev) {
        const data = JSON.parse(ev.data);
        let origName = data.data.replaceAll('"', "");
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
        const data = JSON.parse(ev.data);
        res = data.data.replaceAll('"', "");
        if (res === "true") {
            info.textContent = "info";
        }
    });
    evtSource.addEventListener("apmode", function (ev) {
        const data = JSON.parse(ev.data);
        const res = data.data.replaceAll('"', "");
        info.textContent = res;
    });
    evtSource.addEventListener("presentation", function (ev) {
        const data = JSON.parse(ev.data);
        console.log("presentation data is", data);
        loadRevealPresentation(data);
    });
    evtSource.addEventListener("next", function (ev) {
        if (window.Reveal) Reveal.next();
    });
    evtSource.addEventListener("previous", function (ev) {
        if (window.Reveal) Reveal.prev();
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
            console.log("Media is a link");
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
            console.log("Media is a video", fileOrLink);
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
            console.log("Media is an image", fileOrLink);
            mediaContainer.innerHTML = `
                <img id="imgContainer" style="object-fit: cover; width:100%; height:100%;" src="${fileOrLink}" alt="Image"/>
            `;
        }
        // Unsupported media
        else {
            console.log("Unsupported media.");
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
    async function loadRevealPresentation(dirPath) {
        mediaContainer.innerHTML = `
            <div class="reveal">
                <div class="slides" id="revealSlides"></div>
            </div>
        `;

        // Fetch the file list from server (you can expose an endpoint for this)
        let files = [];
        await $.get(`/list-files?dir=${encodeURIComponent(dirPath)}`, res => {
            if (res.ok) {
                files = res.data;
            }
        }, error => {
            console.error(error);
        }, true);

        const slidesContainer = document.getElementById("revealSlides");
        files.forEach(filename => {
            const section = document.createElement("section");
            section.innerHTML = `<img src="/presentations/${filename}" style="width:100%;height:100%;object-fit:contain;">`;
            slidesContainer.appendChild(section);
        });

        // Initialize Reveal
        Reveal.initialize({
            width: "100%",
            height: "100%",
            controls: true,
            progress: false,
            loop: true,
            //autoSlide: 5000, // auto-advance every 5s (optional)
            transition: 'fade'
        });
    }
});
