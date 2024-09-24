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
        lyrics.style.fontColor = fontColor;
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
});
