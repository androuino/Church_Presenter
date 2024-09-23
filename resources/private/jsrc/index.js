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
    const main = $("#main");
    const lyrics = $("#lyrics");
    const evtSource = new EventSource('/events');
    evtSource.addEventListener("lyrics", function (ev) {
        // Check for escaped newlines and convert to actual line breaks
        const parse = ev.data.replace(/\\n/g, '\n').replace(/\n/g, '<br>');
        const clean = parse.replaceAll('"', '');
        const remove = clean.replace(/\$[a-zA-Z]/, '');
        lyrics.innerHTML = remove;
    });
    evtSource.addEventListener("settings", function (ev) {
    });
    evtSource.addEventListener("theme", function (ev) {
        var data = JSON.parse(JSON.parse(ev.data));
        console.log(data);
        lyrics.dataset.id = data.id;
        lyrics.style.fontFamily = data.font;
        lyrics.style.fontSize = data.font_size + "px";
        lyrics.style.fontColor = data.font_color;
        if (data.bold) {
            lyrics.style.fontWeight = "bold";
        } else if (data.italic) {
            lyrics.style.fontStyle = "italic";
        } else if (data.strike_through) {
            lyrics.style.textDecoration = "line-through";
        }
        lyrics.style.marginTop = data.top_left_offset;
        lyrics.style.marginLeft = data.left_middle_offset;
        lyrics.style.marginBottom = data.left_bottom_offset;
        lyrics.style.marginRight = data.left_middle_offset;
        lyrics.style.textAlign = data.text_align;
        main.style.justifyContent = data.justify_content;
        main.style.alignItems = data.align_items;
    });
});
