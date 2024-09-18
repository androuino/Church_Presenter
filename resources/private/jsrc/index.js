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
});
