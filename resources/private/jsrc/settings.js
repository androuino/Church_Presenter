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
        onchange : function(ev) {
            taFontPreview.style.fontFamily = selectFont.value;
        }
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
                    var defaultFont = "";
                    selectFont.items.clear();
                    res.data.forEach(item => {
                        if (item === "Arial") {
                            defaultFont = item;
                        } else if (item === "Ubuntu") {
                            defaultFont = item;
                        } else if (item === "San Francisco") {
                            defaultFont = item
                        }
                        selectFont.items.push({
                            text : item,
                        });
                    });
                    if (selectFont.items.length > 0) {
                        selectFont.value = defaultFont;
                    }
                }
            }, true);
        }
    });
    const taFontPreview = $("#taFontPreview", {
        onchange : function(ev) {
            previewText.text = this.value;
        }
    });
    const settingFont = $("#settingFont", {
        show : true,
        onshow : function(ev) {
            settingLocation.show = false;
            settingMedia.show = false;
            settingThemeList.show = false;
        },
    });
    const settingLocation = $("#settingLocation", {
        show : false,
        onshow : function(ev) {
            settingFont.show = false;
            settingMedia.show = false;
            settingThemeList.show = false;
            const host = window.location.hostname; // Get the current host
            const protocol = window.location.protocol; // Get the current protocol (http or https)
            const url = `${host}:5555`; // Construct the full URL
            console.log(url);
            //livePreview.src = `/`; todo: uncomment if needed
        },
    });
    const settingMedia = $("#settingMedia", {
        show : false,
        onshow : function(ev) {
            settingFont.show = false;
            settingLocation.show = false;
            settingThemeList.show = false;
        },
    });
    const settingThemeList = $("#settingThemeList", {
        show : false,
        onshow : function(ev) {
            settingFont.show = false;
            settingLocation.show = false;
            settingMedia.show = false;
        }
    });
    const navFontSettings = $("#navFontSettings", {
        onload : function(ev) {
            this.classList.add("active");
        },
        onclick : function(ev) {
            settingFont.show = true;
            this.classList.add("active");
            navLocationSettings.classList.remove("active");
            navMediaSettings.classList.remove("active");
            navThemeList.classList.remove("active");
        },
    });
    const navLocationSettings = $("#navLocationSettings", {
        onclick : function(ev) {
            settingLocation.show = true;
            this.classList.add("active");
            navFontSettings.classList.remove("active");
            navMediaSettings.classList.remove("active");
            navThemeList.classList.remove("active");
        }
    });
    const navMediaSettings = $("#navMediaSettings", {
        onclick : function(ev) {
            settingMedia.show = true
            this.classList.add("active");
            navFontSettings.classList.remove("active");
            navLocationSettings.classList.remove("active");
            navThemeList.classList.remove("active");
        }
    });
    const navThemeList = $("#navThemeList", {
        onclick : function(ev) {
            settingThemeList.show = true;
            this.classList.add("active");
            navFontSettings.classList.remove("active");
            navLocationSettings.classList.remove("active");
            navMediaSettings.classList.remove("active");
        }
    });
    const fontBold = $("#fontBold", {
        onclick : function(ev) {
            this.classList.toggle("active");
            if (this.classList.contains("active")) {
                taFontPreview.style.fontWeight = 'bold';
            } else {
                taFontPreview.style.fontWeight = '';
            }
            // todo: update db
        }
    });
    const fontItalic = $("#fontItalic", {
        onclick : function(ev) {
            this.classList.toggle("active");
            if (this.classList.contains("active")) {
                taFontPreview.style.fontStyle = 'italic';
            } else {
                taFontPreview.style.fontStyle = '';
            }
            // todo: update db
        }
    });
    const fontStrikeThrough = $("#fontStrikeThrough", {
        onclick : function(ev) {
            this.classList.toggle("active");
            if (this.classList.contains("active")) {
                taFontPreview.style.textDecoration = 'line-through';
            } else {
                taFontPreview.style.textDecoration = '';
            }
            // todo: update db
        }
    });
    const inputThemeName = $("#inputThemeName");
    const buttonSaveTheme = $("#buttonSaveTheme", {
        onclick : function(ev) {
            if (inputThemeName.value === "") {
                $.failure("Please type-in a theme's name");
            } else {
                // todo: save to db
                inputThemeName.value = "";
            }
        }
    });
    /*
    const livePreview = $("#livePreview", {
        onload : function(ev) {
            this.style.height = this.contentWindow.document.body.scrollHeight + 'px';
        }
    });
    */
    const previewContainer = $("#previewContainer");
    const radioTopLeft = $("#radioTopLeft", {
        onclick : function(ev) {
            previewContainer.style.justifyContent = "flex-start";
            previewContainer.style.alignItems = "flex-start";
        }
    });
    const radioTopMiddle = $("#radioTopMiddle", {
        onclick : function(ev) {
            previewContainer.style.justifyContent = "flex-start";
            previewContainer.style.alignItems = "center";
        }
    });
    const radioTopRight = $("#radioTopRight", {
        onclick : function(ev) {
            previewContainer.style.justifyContent = "flex-start";
            previewContainer.style.alignItems = "flex-end";
        }
    });
    const radioLefMiddle = $("#radioLefMiddle", {
        onclick : function(ev) {
            previewContainer.style.justifyContent = "center";
            previewContainer.style.alignItems = "flex-start";
        }
    });
    const radioCenter = $("#radioCenter", {
        onload : function(ev) {
            if (this.checked === true) {
                previewContainer.style.justifyContent = "center";
                previewContainer.style.alignItems = "center";
            }
        },
        onclick : function(ev) {
            previewContainer.style.justifyContent = "center";
            previewContainer.style.alignItems = "center";
        }
    });
    const radioRightMiddle = $("#radioRightMiddle", {
        onclick : function(ev) {
            previewContainer.style.justifyContent = "center";
            previewContainer.style.alignItems = "flex-end";
        }
    });
    const radioLeftBottom = $("#radioLeftBottom", {
        onclick : function(ev) {
            previewContainer.style.justifyContent = "flex-end";
            previewContainer.style.alignItems = "flex-start";
        }
    });
    const radioMiddleBottom = $("#radioMiddleBottom", {
        onclick : function(ev) {
            previewContainer.style.justifyContent = "flex-end";
            previewContainer.style.alignItems = "center";
        }
    });
    const radioRightBottom = $("#radioRightBottom", {
        onclick : function(ev) {
            previewContainer.style.justifyContent = "flex-end";
            previewContainer.style.alignItems = "flex-end";
        }
    });
    const previewText = $("#previewText", {
        onload : function(ev) {
            this.text = taFontPreview.value;
        }
    });
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('click', (event) => {
            // Uncheck all other radios except the one clicked
            document.querySelectorAll('input[type="radio"]').forEach(otherRadio => {
                if (otherRadio !== event.target) {
                    otherRadio.checked = false;
                }
            });
        });
    });
    tippy('#navFontSettings', {
        content: "Font settings (Font style and size)",
        interactive: true,
        placement: 'right',
        animation: 'scale',
        theme: 'light',
    });
    tippy('#navLocationSettings', {
        content: "Setting for the location of text on the screen",
        interactive: true,
        placement: 'right',
        animation: 'scale',
        theme: 'light',
    });
    tippy('#navMediaSettings', {
        content: "Media settings for adding background",
        interactive: true,
        placement: 'right',
        animation: 'scale',
        theme: 'light',
    });
    tippy('#navThemeList', {
        content: "List of themes",
        interactive: true,
        placement: 'right',
        animation: 'scale',
        theme: 'light',
    });
    tippy('#fontBold', {
        content: "Bold",
        interactive: true,
        placement: 'bottom',
        animation: 'scale',
        theme: 'light',
    });
    tippy('#fontItalic', {
        content: "Italic",
        interactive: true,
        placement: 'bottom',
        animation: 'scale',
        theme: 'light',
    });
    tippy('#fontStrikeThrough', {
        content: "Strike through",
        interactive: true,
        placement: 'bottom',
        animation: 'scale',
        theme: 'light',
    });
    tippy('#topLeftOffset', {
        content: "Top-left offset",
        interactive: false,
        placement: 'top',
        animation: 'scale',
        theme: 'light',
    });
    tippy('#topMiddleOffset', {
        content: "Top-middle offset",
        interactive: false,
        placement: 'top',
        animation: 'scale',
        theme: 'light',
    });
    tippy('#topRightOffset', {
        content: "Top-right offset",
        interactive: false,
        placement: 'top',
        animation: 'scale',
        theme: 'light',
    });
    tippy('#leftUpperOffset', {
        content: "Left-upper offset",
        interactive: false,
        placement: 'right',
        animation: 'scale',
        theme: 'light',
    });
    tippy('#rightUpperOffset', {
        content: "Right-upper offset",
        interactive: false,
        placement: 'right',
        animation: 'scale',
        theme: 'light',
    });
    tippy('#leftMiddleOffset', {
        content: "Left-middle offset",
        interactive: false,
        placement: 'right',
        animation: 'scale',
        theme: 'light',
    });
    tippy('#rightMiddleOffset', {
        content: "Right-middle offset",
        interactive: false,
        placement: 'right',
        animation: 'scale',
        theme: 'light',
    });
    tippy('#bottomLowerOffset', {
        content: "Bottom-lower offset",
        interactive: false,
        placement: 'right',
        animation: 'scale',
        theme: 'light',
    });
    tippy('#rightLowerOffset', {
        content: "Right-lower offset",
        interactive: false,
        placement: 'right',
        animation: 'scale',
        theme: 'light',
    });
    tippy('#leftBottomOffset', {
        content: "Left-bottom offset",
        interactive: false,
        placement: 'bottom',
        animation: 'scale',
        theme: 'light',
    });
    tippy('#middleBottomOffset', {
        content: "Middle-bottom offset",
        interactive: false,
        placement: 'bottom',
        animation: 'scale',
        theme: 'light',
    });
    tippy('#rightBottomOffset', {
        content: "Right-bottom offset",
        interactive: false,
        placement: 'bottom',
        animation: 'scale',
        theme: 'light',
    });
});