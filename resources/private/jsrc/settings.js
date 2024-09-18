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
    const selectFont = $("#selectFont", {
        template : {
            font : {
                tagName : "option",
                id : "font"
            }
        },
        items : [],
    });
    const inputFontSize = $("#inputFontSize", {
        onload : function(ev) {
            this.value = 14;
        },
        onchange : function(ev) {
            if (this.value <= 0) {
                this.value = 1;
            }
        }
    });
    $("body", {
        onload: function(ev) {
            $.get("/getfonts", res => {
                if (res.ok) {
                    selectFont.items.clear();
                    res.data.forEach(item => {
                        selectFont.items.push({
                            text : item,
                        });
                    });
                    if (selectFont.items.length > 0) {
                        selectFont.value = "Arial";
                    }
                }
            }, true);
        }
    });
});