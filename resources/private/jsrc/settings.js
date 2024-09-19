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
    const topLeftOffset = $("#topLeftOffset", {
        disabled : true,
        onchange : function(ev) {
            previewText.style.marginTop = ev.target.value + "px";
        }
    });
    const topMiddleOffset = $("#topMiddleOffset", {
        disabled : true,
        onchange : function(ev) {
            previewText.style.marginTop = ev.target.value + "px";
        }
    });
    const topRightOffset = $("#topRightOffset", {
        disabled : true,
        onchange : function(ev) {
            previewText.style.marginTop = ev.target.value + "px";
        }
    });
    const leftUpperOffset = $("#leftUpperOffset", {
        disabled : true,
        onchange : function(ev) {
            previewText.style.marginLeft = ev.target.value + "px";
        }
    });
    const rightUpperOffset = $("#rightUpperOffset", {
        disabled : true,
        onchange : function(ev) {
            previewText.style.marginRight = ev.target.value + "px";
        }
    });
    const leftMiddleOffset = $("#leftMiddleOffset", {
        disabled : true,
        onchange : function(ev) {
            previewText.style.marginLeft = ev.target.value + "px";
        }
    });
    const rightMiddleOffset = $("#rightMiddleOffset", {
        disabled : true,
        onchange : function(ev) {
            previewText.style.marginRight = ev.target.value + "px";
        }
    });
    const leftLowerOffset = $("#leftLowerOffset", {
        disabled : true,
        onchange : function(ev) {
            previewText.style.marginLeft = ev.target.value + "px";
        }
    });
    const rightLowerOffset = $("#rightLowerOffset", {
        disabled : true,
        onchange : function(ev) {
            previewText.style.marginRight = ev.target.value + "px";
        }
    });
    const leftBottomOffset = $("#leftBottomOffset", {
        disabled : true,
        onchange : function(ev) {
            previewText.style.marginBottom = ev.target.value + "px";
        }
    });
    const middleBottomOffset = $("#middleBottomOffset", {
        disabled : true,
        onchange : function(ev) {
            previewText.style.marginBottom = ev.target.value + "px";
        }
    });
    const rightBottomOffset = $("#rightBottomOffset", {
        disabled : true,
        onchange : function(ev) {
            previewText.style.marginBottom = ev.target.value + "px";
        }
    });
    const previewContainer = $("#previewContainer");
    const radioTopLeft = $("#radioTopLeft", {
        onclick : function(ev) {
            changeLocation("flex-start", "flex-start");
            resetOffset();
            disabledOffset(false,true,true,false,true,true,true,true,true,true,true,true);
        }
    });
    const radioTopMiddle = $("#radioTopMiddle", {
        onclick : function(ev) {
            changeLocation("flex-start", "center");
            resetOffset();
            disabledOffset(true,false,true,true,true,true,true,true,true,true,true,true);
        }
    });
    const radioTopRight = $("#radioTopRight", {
        onclick : function(ev) {
            changeLocation("flex-start", "flex-end");
            resetOffset();
            disabledOffset(true,true,false,true,false,true,true,true,true,true,true,true);
        }
    });
    const radioLefMiddle = $("#radioLefMiddle", {
        onclick : function(ev) {
            changeLocation("center", "flex-start");
            resetOffset();
            disabledOffset(true,true,true,true,true,false,true,true,true,true,true,true);
        }
    });
    const radioCenter = $("#radioCenter", {
        onload : function(ev) {
            console.log("Default location");
            changeLocation("center", "center");
            disabledOffset(true,false,true,true,true,false,false,true,true,true,false,true);
        },
        onclick : function(ev) {
            changeLocation("center", "center");
            resetOffset();
            disabledOffset(true,false,true,true,true,false,false,true,true,true,false,true);
        }
    });
    const radioRightMiddle = $("#radioRightMiddle", {
        onclick : function(ev) {
            changeLocation("center", "flex-end");
            resetOffset();
            disabledOffset(true,true,true,true,true,true,false,true,true,true,true,true);
        }
    });
    const radioLeftBottom = $("#radioLeftBottom", {
        onclick : function(ev) {
            changeLocation("flex-end", "flex-start");
            resetOffset();
            disabledOffset(true,true,true,true,true,true,true,false,true,false,true,true);
        }
    });
    const radioMiddleBottom = $("#radioMiddleBottom", {
        onclick : function(ev) {
            changeLocation("flex-end", "center");
            resetOffset();
            disabledOffset(true,true,true,true,true,true,true,true,true,true,false,true);
        }
    });
    const radioRightBottom = $("#radioRightBottom", {
        onclick : function(ev) {
            changeLocation("flex-end", "flex-end");
            resetOffset();
            disabledOffset(true,true,true,true,true,true,true,true,false,true,true,false);
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
    const buttonResetOffset = $("#buttonResetOffset", {
        onclick : function(ev) {
            previewText.style.margin = "0";
            resetOffset();
        }
    });
    function resetOffset() {
        topLeftOffset.value = "0";
        topMiddleOffset.value = "0";
        topRightOffset.value = "0";
        leftUpperOffset.value = "0";
        rightUpperOffset.value = "0";
        leftMiddleOffset.value = "0";
        rightMiddleOffset.value = "0";
        leftLowerOffset.value = "0";
        rightLowerOffset.value = "0";
        leftBottomOffset.value = "0";
        middleBottomOffset.value = "0";
        rightBottomOffset.value = "0";
    }
    function disabledOffset(topLeft,topMiddle,topRight,leftUpper,rightUpper,leftMiddle,rightMiddle,leftLower,rightLower,leftBottom,middleBottom,rightBottom) {
        topLeftOffset.disabled = topLeft;
        topMiddleOffset.disabled = topMiddle;
        topRightOffset.disabled = topRight;
        leftUpperOffset.disabled = leftUpper;
        rightUpperOffset.disabled = rightUpper;
        leftMiddleOffset.disabled = leftMiddle;
        rightMiddleOffset.disabled = rightMiddle;
        leftLowerOffset.disabled = leftLower;
        rightLowerOffset.disabled = rightLower;
        leftBottomOffset.disabled = leftBottom;
        middleBottomOffset.disabled = middleBottom;
        rightBottomOffset.disabled = rightBottom;
    }
    function changeLocation(x, y) {
        previewContainer.style.justifyContent = x;
        previewContainer.style.alignItems = y;
    }
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
    tippy('#leftLowerOffset', {
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