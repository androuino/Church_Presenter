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
    var isBold = false;
    var isItalic = false;
    var isStrikeThrough = false;
    var alignment = "center";
    var justifyContent = "";
    var alignItems = "";
    var bibleVersionInstalled;
    var versionList = [];
    const mainSettings = $("#mainSettings", {
        onload : function(ev) {
            $.get("/getthemes", res => {
                if (res.ok) {
                    themeList.items.clear();
                    res.data.forEach(item => {
                        themeList.items.push({
                            dataset : { id : item.id },
                            text : item.themeName,
                        });
                    });
                }
            }, true);
            $.get("/getbooks", res => {
                if (res.ok) {
                    bibleVersions.items.clear();
                    Object.entries(res.data).forEach(([k,v]) => {
                        bibleVersions.items.push({
                            text : `${k} : ${v}`,
                        });
                    });
                }
            }, error => {
                console.error("Error getting books", error);
            }, true);
            $.get("/getversions", res => {
                if (res.ok) {
                    versionsInstalled.items.clear();
                    selectVersion1.items.clear();
                    selectVersion2.items.clear();
                    selectVersion3.items.clear();
                    Object.entries(res.data).forEach(([k,v]) => {
                        versionsInstalled.items.push({
                            text : `${k} : ${v}`,
                        });
                        selectVersion1.items.push({
                            text : `${k} : ${v}`,
                        });
                        selectVersion2.items.push({
                            text : `${k} : ${v}`,
                        });
                        selectVersion3.items.push({
                            text : `${k} : ${v}`,
                        });
                    });
                }
            }, error => {
                console.error("Error getting installed books", error);
            }, true);
            const data = {
                theme : "Default",
            };
            getTheme(data);
        }
    });
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
            this.value = 24;
        },
        onchange : function(ev) {
            var size = 1;
            if (this.value <= 0) {
                this.value = 1;
            } else {
                size = ev.target.value;
                taFontPreview.style.fontSize = size + "px";
                previewText.style.fontSize = size + "px";
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
            previewText.innerHTML = this.value.replace(/\n/g, '<br>');;
        }
    });
    const settingFont = $("#settingFont", {
        show : true,
        onshow : function(ev) {
            settingLocation.show = false;
            settingThemeList.show = false;
            settingBible.show = false;
        },
    });
    const settingLocation = $("#settingLocation", {
        show : false,
        onshow : function(ev) {
            settingFont.show = false;
            settingThemeList.show = false;
            settingBible.show = false;
            const host = window.location.hostname; // Get the current host
            const protocol = window.location.protocol; // Get the current protocol (http or https)
            const url = `${host}:5555`; // Construct the full URL
            //livePreview.src = `/`; todo: uncomment if needed
        },
    });
    const settingThemeList = $("#settingThemeList", {
        show : false,
        onshow : function(ev) {
            settingFont.show = false;
            settingLocation.show = false;
            settingBible.show = false;
        }
    });
    const settingBible = $("#settingBible", {
        show : false,
        onshow : function(ev) {
            settingFont.show = false;
            settingLocation.show = false;
            settingThemeList.show = false;
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
            navThemeList.classList.remove("active");
            navBibleSettings.classList.remove("active");
        },
    });
    const navLocationSettings = $("#navLocationSettings", {
        onclick : function(ev) {
            settingLocation.show = true;
            this.classList.add("active");
            navFontSettings.classList.remove("active");
            navThemeList.classList.remove("active");
            navBibleSettings.classList.remove("active");
        }
    });
    const navThemeList = $("#navThemeList", {
        onclick : function(ev) {
            settingThemeList.show = true;
            this.classList.add("active");
            navFontSettings.classList.remove("active");
            navLocationSettings.classList.remove("active");
            navBibleSettings.classList.remove("active");
        }
    });
    const navBibleSettings = $("#navBibleSettings", {
        onclick : function(ev) {
            settingBible.show = true;
            this.classList.add("active");
            navFontSettings.classList.remove("active");
            navLocationSettings.classList.remove("active");
            navThemeList.classList.remove("active");
        }
    });
    const fontBold = $("#fontBold", {
        onclick : function(ev) {
            this.classList.toggle("active");
            if (this.classList.contains("active")) {
                taFontPreview.style.fontWeight = 'bold';
                previewText.style.fontWeight = 'bold';
                isBold = true;
            } else {
                taFontPreview.style.fontWeight = '';
                previewText.style.fontWeight = '';
                isBold = false;
            }
            // todo: update db
        }
    });
    const fontItalic = $("#fontItalic", {
        onclick : function(ev) {
            this.classList.toggle("active");
            if (this.classList.contains("active")) {
                taFontPreview.style.fontStyle = 'italic';
                previewText.style.fontStyle = 'italic';
                isItalic = true;
            } else {
                taFontPreview.style.fontStyle = '';
                previewText.style.fontStyle = '';
                isItalic = false;
            }
            // todo: update db
        }
    });
    const fontStrikeThrough = $("#fontStrikeThrough", {
        onclick : function(ev) {
            this.classList.toggle("active");
            if (this.classList.contains("active")) {
                taFontPreview.style.textDecoration = 'line-through';
                previewText.style.textDecoration = 'line-through';
                isStrikeThrough = true;
            } else {
                taFontPreview.style.textDecoration = '';
                previewText.style.textDecoration = '';
                isStrikeThrough = false;
            }
            // todo: update db
        }
    });
    const inputThemeName = $("#inputThemeName");
    const colorPicker = $("#colorPicker", {
        onchange : function(ev) {
            const color = ev.target.value;
            taFontPreview.style.color = color;
            previewText.style.color = color;
            if (color === "#ffffff" || color === "white") {
                taFontPreview.style.backgroundColor = "black";
            } else {
                taFontPreview.style.backgroundColor = "";
            }
        }
    });
    const buttonSaveTheme = $("#buttonSaveTheme", {
        onclick : function(ev) {
            if (inputThemeName.value === "") {
                $.failure("Please type-in a theme's name");
            } else {
                const selected = themeList.options[themeList.selectedIndex];
                const id = selected.dataset.id;
                console.log("the id is", id);
                const data = {
                    id : id,
                    themeName: inputThemeName.value,
                    font: selectFont.value,
                    fontSize: inputFontSize.value,
                    fontColor: colorPicker.value,
                    bold: isBold,
                    italic: isItalic,
                    strikeThrough: isItalic,
                    topLeftOffset: topLeftOffset.value,
                    topMiddleOffset: topMiddleOffset.value,
                    topRightOffset: topRightOffset.value,
                    leftUpperOffset: leftUpperOffset.value,
                    rightUpperOffset: rightUpperOffset.value,
                    leftMiddleOffset: leftMiddleOffset.value,
                    rightMiddleOffset: rightMiddleOffset.value,
                    leftLowerOffset: leftLowerOffset.value,
                    rightLowerOffset: rightLowerOffset.value,
                    leftBottomOffset: leftBottomOffset.value,
                    middleBottomOffset: middleBottomOffset.value,
                    rightBottomOffset: rightBottomOffset.value,
                    textAlign: alignment,
                    justifyContent: justifyContent,
                    alignItems: alignItems
                };
                $.put("/savetheme", data, res => {
                    if (res.ok) {
                        $.success("Theme saved.");
                    } else {
                        $.failure("An error occurred!");
                    }
                }, error => {
                    $.failure("An error occurred!", error);
                }, true);
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
            var offset = ev.target.value;
            if (offset <= 0) {
                offset = 0;
                this.value = offset;
            }
            previewText.style.marginTop = offset + "px";
        }
    });
    const topMiddleOffset = $("#topMiddleOffset", {
        disabled : true,
        onchange : function(ev) {
            var offset = ev.target.value;
            if (offset <= 0) {
                offset = 0;
                this.value = offset;
            }
            previewText.style.marginTop = offset + "px";
        }
    });
    const topRightOffset = $("#topRightOffset", {
        disabled : true,
        onchange : function(ev) {
            var offset = ev.target.value;
            if (offset <= 0) {
                offset = 0;
                this.value = offset;
            }
            previewText.style.marginTop = offset + "px";
        }
    });
    const leftUpperOffset = $("#leftUpperOffset", {
        disabled : true,
        onchange : function(ev) {
            var offset = ev.target.value;
            if (offset <= 0) {
                offset = 0;
                this.value = offset;
            }
            previewText.style.marginLeft = offset + "px";
        }
    });
    const rightUpperOffset = $("#rightUpperOffset", {
        disabled : true,
        onchange : function(ev) {
            var offset = ev.target.value;
            if (offset <= 0) {
                offset = 0;
                this.value = offset;
            }
            previewText.style.marginRight = offset + "px";
        }
    });
    const leftMiddleOffset = $("#leftMiddleOffset", {
        disabled : true,
        onchange : function(ev) {
            var offset = ev.target.value;
            if (offset <= 0) {
                offset = 0;
                this.value = offset;
            }
            previewText.style.marginLeft = offset + "px";
        }
    });
    const rightMiddleOffset = $("#rightMiddleOffset", {
        disabled : true,
        onchange : function(ev) {
            var offset = ev.target.value;
            if (offset <= 0) {
                offset = 0;
                this.value = offset;
            }
            previewText.style.marginRight = offset + "px";
        }
    });
    const leftLowerOffset = $("#leftLowerOffset", {
        disabled : true,
        onchange : function(ev) {
            var offset = ev.target.value;
            if (offset <= 0) {
                offset = 0;
                this.value = offset;
            }
            previewText.style.marginLeft = offset + "px";
        }
    });
    const rightLowerOffset = $("#rightLowerOffset", {
        disabled : true,
        onchange : function(ev) {
            var offset = ev.target.value;
            if (offset <= 0) {
                offset = 0;
                this.value = offset;
            }
            previewText.style.marginRight = offset + "px";
        }
    });
    const leftBottomOffset = $("#leftBottomOffset", {
        disabled : true,
        onchange : function(ev) {
            var offset = ev.target.value;
            if (offset <= 0) {
                offset = 0;
                this.value = offset;
            }
            previewText.style.marginBottom = offset + "px";
        }
    });
    const middleBottomOffset = $("#middleBottomOffset", {
        disabled : true,
        onchange : function(ev) {
            var offset = ev.target.value;
            if (offset <= 0) {
                offset = 0;
                this.value = offset;
            }
            previewText.style.marginBottom = offset + "px";
        }
    });
    const rightBottomOffset = $("#rightBottomOffset", {
        disabled : true,
        onchange : function(ev) {
            var offset = ev.target.value;
            if (offset <= 0) {
                offset = 0;
                this.value = offset;
            }
            previewText.style.marginBottom = offset + "px";
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
            changeLocation("center", "flex-start");
            resetOffset();
            disabledOffset(true,false,true,true,true,true,true,true,true,true,true,true);
        }
    });
    const radioTopRight = $("#radioTopRight", {
        onclick : function(ev) {
            changeLocation("flex-end", "flex-start");
            resetOffset();
            disabledOffset(true,true,false,true,false,true,true,true,true,true,true,true);
        }
    });
    const radioLefMiddle = $("#radioLefMiddle", {
        onclick : function(ev) {
            changeLocation("flex-start", "center");
            resetOffset();
            disabledOffset(true,true,true,true,true,false,true,true,true,true,true,true);
        }
    });
    const radioCenter = $("#radioCenter", {
        onload : function(ev) {
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
            changeLocation("flex-end", "center");
            resetOffset();
            disabledOffset(true,true,true,true,true,true,false,true,true,true,true,true);
        }
    });
    const radioLeftBottom = $("#radioLeftBottom", {
        onclick : function(ev) {
            changeLocation("flex-start", "end");
            resetOffset();
            disabledOffset(true,true,true,true,true,true,true,false,true,false,true,true);
        }
    });
    const radioMiddleBottom = $("#radioMiddleBottom", {
        onclick : function(ev) {
            changeLocation("center", "end");
            resetOffset();
            disabledOffset(true,true,true,true,true,true,true,true,true,true,false,true);
        }
    });
    const radioRightBottom = $("#radioRightBottom", {
        onclick : function(ev) {
            changeLocation("flex-end", "end");
            resetOffset();
            disabledOffset(true,true,true,true,true,true,true,true,false,true,true,false);
        }
    });
    const previewText = $("#previewText", {
        onload : function(ev) {
            this.text = taFontPreview.value;
        },
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
    const fontAlignCenter = $("#fontAlignCenter", {
        onload : function(ev) {
            this.classList.add("active");
            previewText.style.textAlign = "center";
        },
        onclick : function(ev) {
            previewText.style.textAlign = "center";
            this.classList.add("active");
            fontAlignHorRight.classList.remove("active");
            fontAlignJustify.classList.remove("active");
            fontAlignHorLeft.classList.remove("active");
            fontAlignRight.classList.remove("active");
            fontAlignLeft.classList.remove("active");
            alignment = "center";
        }
    });
    const fontAlignHorRight = $("#fontAlignHorRight", {
        onclick : function(ev) {
            previewText.style.textAlign = "end";
            fontAlignCenter.classList.remove("active");
            this.classList.add("active");
            fontAlignJustify.classList.remove("active");
            fontAlignHorLeft.classList.remove("active");
            fontAlignRight.classList.remove("active");
            fontAlignLeft.classList.remove("active");
            alignment = "end";
        }
    });
    const fontAlignJustify = $("#fontAlignJustify", {
        onclick : function(ev) {
            previewText.style.textAlign = "justify";
            fontAlignCenter.classList.remove("active");
            fontAlignHorRight.classList.remove("active");
            this.classList.add("active");
            fontAlignHorLeft.classList.remove("active");
            fontAlignRight.classList.remove("active");
            fontAlignLeft.classList.remove("active");
            alignment = "justify";
        }
    });
    const fontAlignHorLeft = $("#fontAlignHorLeft", {
        onclick : function(ev) {
            previewText.style.textAlign = "start";
            fontAlignCenter.classList.remove("active");
            fontAlignHorRight.classList.remove("active");
            fontAlignJustify.classList.remove("active");
            this.classList.add("active");
            fontAlignRight.classList.remove("active");
            fontAlignLeft.classList.remove("active");
            alignment = "start";
        }
    });
    const fontAlignRight = $("#fontAlignRight", {
        onclick : function(ev) {
            previewText.style.textAlign = "right";
            fontAlignCenter.classList.remove("active");
            fontAlignHorRight.classList.remove("active");
            fontAlignJustify.classList.remove("active");
            fontAlignHorLeft.classList.remove("active");
            this.classList.add("active");
            fontAlignLeft.classList.remove("active");
            alignment = "right";
        }
    });
    const fontAlignLeft = $("#fontAlignLeft", {
        onclick : function(ev) {
            previewText.style.textAlign = "left";
            fontAlignCenter.classList.remove("active");
            fontAlignHorRight.classList.remove("active");
            fontAlignJustify.classList.remove("active");
            fontAlignHorLeft.classList.remove("active");
            fontAlignRight.classList.remove("active");
            this.classList.add("active");
            alignment = "left";
        }
    });
    const themeList = $("#themeList", {
        template : {
            optionTheme : {
                tagName : "option",
                id : "optionTheme",
            }
        },
        items : [],
        onchange : function(ev) {
            const data = {
                theme : ev.target.value,
            };
            getTheme(data);
        }
    });
    const buttonOpenFile = $("#buttonOpenFile", {
        onclick : function(ev) {
            const ups = [];
            $.upload(ev, {
                field   : "file",
                upload  : "/upload",
                parallel : true,
                maxFiles : 30,
                maxSizeMb : 1000,
                onSelect : (files) => {
                    let index = 0;
                    Array.from(files).forEach(file => {
                        ups[index] = { pct : 0, file : file.name }
                    });
                },
                onUpdate : (pct, file, index) => {
                    ups[index] = { pct : pct, file : file.name }
                },
                onResponse : (response) => {
                    console.log(response);
                },
                onDone : (response, allDone) => {
                    response.forEach(res => {
                        ups[res.index] = { pct : 100, file : res.file.name }
                    });
                    if(allDone) {
                        console.log("all done");
                    }
                },
                onError : (response) => {
                    console.log(response);
                    console.log("on error");
                }
            });
        }
    });
    const mediaLink = $("#mediaLink");
    const buttonSetPlay = $("#buttonSetPlay", {
        onclick : function(ev) {
            if (mediaLink.value === "") {
                $.failure("You did not provide a proper link.");
            } else {
                // todo: set the media as background
            }
        }
    });
    const buttonSetTheme = $("#buttonSetTheme", {
        onclick : function(ev) {
            const theme = themeList.value;
            if (theme === "") {
                $.failure("Please choose a theme");
            } else {
                const data = {
                    theme : theme,
                };
                $.post("/settheme", data, res => {
                    if (res.ok) {
                        $.success("Theme set.");
                    } else {
                        $.failure("Error setting theme.");
                    }
                }, true);
            }
        }
    });
    const inputVerseSearch = $("#inputVerseSearch", {
        onkeydown : function(ev) {
            if (ev.key === "Enter") {
                versionList = [];
                if (version1.show === true) {
                    versionList.push(selectVersion1.value.split(":")[0].trim());
                }
                if (version2.show === true) {
                    versionList.push(selectVersion2.value.split(":")[0].trim());
                }
                if (version3.show === true) {
                    versionList.push(selectVersion3.value.split(":")[0].trim());
                }
                searchBible(this.value, versionList);
            }
        }
    });
    const bibleVersions = $("#bibleVersions", {
        template : {
            option : {
                tagName : "option",
                style : {
                    borderBottom : "1px solid black"
                }
            }
        },
        items : [],
    });
    const versionsInstalled = $("#versionsInstalled", {
        template : {
            option : {
                tagName : "option",
                style : {
                    borderBottom : "1px solid black"
                }
            }
        },
        items : [],
    });
    const version1 = $("#version1");
    const version2 = $("#version2", {
        show : false,
    });
    const version3 = $("#version3", {
        show : false,
    });
    const selectVersion1 = $("#selectVersion1", {
        template : {
            option : {
                tagName : "option",
                style : {
                    borderBottom : "1px solid black"
                }
            }
        },
        items : [],
    });
    const selectVersion2 = $("#selectVersion2", {
        template : {
            option : {
                tagName : "option",
                style : {
                    borderBottom : "1px solid black"
                }
            }
        },
        items : [],
    });
    const selectVersion3 = $("#selectVersion3", {
        template : {
            option : {
                tagName : "option",
                style : {
                    borderBottom : "1px solid black"
                }
            }
        },
        items : [],
    });
    const selectVersionsToProject = $("#selectVersionsToProject", {
        onload : function(ev) {
            if (ev.target.value === "1") {
                version1.enabled = true;
                version2.enabled = false;
                version3.enabled = false;
            }
        },
        onchange : function(ev) {
            if (ev.target.value === "1") {
                version1.show = true;
                version2.show = false;
                version3.show = false;
            } else if (ev.target.value === "2") {
                version1.show = true;
                version2.show = true;
                version3.show = false;
            } else if (ev.target.value === "3") {
                version1.show = true;
                version2.show = true;
                version3.show = true;
            }
        }
    });
    const buttonInstall = $("#buttonInstall", {
        onclick : function(ev) {
            const book = bibleVersions.value;
            if (book === "") {
                $.failure("I didn't get that. Empty!");
            } else {
                $.confirm("Please confirm Bible version installation.", yes => {
                    if (yes) {
                        var initials = book.split(":")[0].trim();
                        const data = {
                            initials : initials,
                        };
                        $.post("/installbook", data, res => {
                            if (res.ok) {
                                $.success("Installation is still in progress. Please refresh after 5 minutes.")
                            }
                        }, error => {
                            console.error("Error installing book", error);
                        }, true);
                    }
                });
            }
        }
    });
    const buttonUninstall = $("#buttonUninstall", {
        onclick : function(ev) {
            const book = versionsInstalled.value;
            if (book === "") {
                $.failure("I did not get that. Empty!");
            } else {
                $.confirm("Please confirm on uninstalling version?", yes => {
                    if (yes) {
                        var initials = book.split(":")[0].trim();
                        const data = {
                            initials : initials,
                        };
                        $.delete("/uninstallbook", data, res => {
                            if (res.ok) {
                                $.success("Uninstall is still in progress. Please refresh after 5 minutes.")
                            }
                        }, error => {
                            console.error("Error uninstalling book", error);
                        }, true);
                    }
                });
            }
        }
    });
    const buttonSearch = $("#buttonSearch", {
        onclick : function(ev) {
            versionList = [];
            if (version1.show === true) {
                versionList.push(selectVersion1.value.split(":")[0].trim());
            }
            if (version2.show === true) {
                versionList.push(selectVersion2.value.split(":")[0].trim());
            }
            if (version3.show === true) {
                versionList.push(selectVersion3.value.split(":")[0].trim());
            }
            searchBible(inputVerseSearch.value, versionList);
        }
    });
    const verseList = $("#verseList", {
        template : {
            li : {
                tagName : "li",
                style : {
                    border : "1px solid white",
                    whiteSpace: "normal",
                    cursor: "pointer",
                },
                preVerse : {
                    tagName : "pre",
                    css : "preVerse",
                    style : {
                        whiteSpace: "pre-wrap",
                        wordWrap: "break-word",
                    },
                    onclick : function(ev) {
                        const preElements = document.querySelectorAll("ul#verseList pre");
                        preElements.forEach(pre => {
                            pre.style.backgroundColor = ""; // Reset to original background color
                            pre.style.color = "";
                        });
                        ev.target.style.backgroundColor = "lightgreen";
                        ev.target.style.color = "black";

                        versionList = [];
                        if (version1.show === true) {
                            versionList.push(selectVersion1.value.split(":")[0].trim());
                        }
                        if (version2.show === true) {
                            versionList.push(selectVersion2.value.split(":")[0].trim());
                        }
                        if (version3.show === true) {
                            versionList.push(selectVersion3.value.split(":")[0].trim());
                        }
                        const data = {
                            verse : this.textContent,
                            versions : versionList,
                        };
                        $.post("/projectverse", data, res => {
                            if (res.ok) {
                                console.debug("Success projecting verse");
                            }
                        }, error => {
                            console.error("Error projecting verse.", error);
                        }, true);
                    }
                }
            }
        },
        items : [],
    });
    function searchBible(verse, versions) {
        const data = {
            verse : verse,
            versions : versions,
        };
        $.post("/searchbibleverse", data, res => {
            if (res.ok) {
                var newLine = "";
                const data = res.data;
                if (data.length > 1) {
                    newLine = '\n\n';
                }
                verseList.items.clear();
                const numOfMaps = data.length;
                const numOfKeys = Object.keys(data[0]).length;
                for (let i = 0; i < numOfKeys; i++) {
                    // Create an array to hold the combined values for the current index
                    const combinedValues = [];
                    var verse = "";
                    // Iterate through each map to get the value at the current index
                    /*
                    for (let j = 0; j < numOfMaps; j++) {
                        verse += data[j][Object.keys(data[j])[i]] + newLine;
                    }
                    */
                    for (let j = 0; j < numOfMaps; j++) {
                        // Get the key at the current index
                        const key = Object.keys(data[j])[i];
                        verse = key;  // Concatenate the keys with newline
                    }
                    verseList.items.push({
                        preVerse : {
                            textContent : verse,
                        }
                    });
                }
            }
        }, error => {
            console.error("Error search verse:", error);
        }, true);
    }
    function resetOffset() {
        topLeftOffset.value = 0;
        topMiddleOffset.value = 0;
        topRightOffset.value = 0;
        leftUpperOffset.value = 0;
        rightUpperOffset.value = 0;
        leftMiddleOffset.value = 0;
        rightMiddleOffset.value = 0;
        leftLowerOffset.value = 0;
        rightLowerOffset.value = 0;
        leftBottomOffset.value = 0;
        middleBottomOffset.value = 0;
        rightBottomOffset.value = 0;
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
        justifyContent = x;
        alignItems = y;
        console.log("justify content is ", x);
        console.log("align items is ", y);
    }
    function setLocation(x, y) {
        if (x === "flex-start" && y === "flex-start") {
            radioTopLeft.checked = true;
            disabledOffset(false,true,true,false,true,true,true,true,true,true,true,true);
        } else if (x === "center" && y === "flex-start") {
            radioTopMiddle.checked = true;
            disabledOffset(true,false,true,true,true,true,true,true,true,true,true,true);
        } else if (x === "flex-end" && y === "flex-start") {
            radioTopRight.checked = true;
            disabledOffset(true,true,false,true,false,true,true,true,true,true,true,true);
        } else if (x === "flex-start" && y === "center") {
            radioLefMiddle.checked = true;
            disabledOffset(true,true,true,true,true,false,true,true,true,true,true,true);
        } else if (x === "center" && y === "center") {
            radioCenter.checked = true;
            disabledOffset(true,false,true,true,true,false,false,true,true,true,false,true);
        } else if (x === "flex-end" && y === "center") {
            radioRightMiddle.checked = true;
            disabledOffset(true,true,true,true,true,true,false,true,true,true,true,true);
        } else if (x === "flex-start" && y === "end") {
            radioLeftBottom.checked = true;
            disabledOffset(true,true,true,true,true,true,true,false,true,false,true,true);
        } else if (x === "center" && y === "end") {
            radioMiddleBottom.checked = true;
            disabledOffset(true,true,true,true,true,true,true,true,true,true,false,true);
        } else if (x === "flex-end" && y === "end") {
            radioRightBottom.checked = true;
            disabledOffset(true,true,true,true,true,true,true,true,false,true,true,false);
        }
    }
    function getTheme(data) {
        $.post("/gettheme", data, res => {
            if (res.ok) {
                const font = res.data.font;
                const fontSize = res.data.font_size;
                const fontColor = res.data.font_color;
                const bold = res.data.bold;
                const italic = res.data.italic;
                const strikeThrough = res.data.strike_through;
                const topLeft = res.data.top_left_offset;
                const topMiddle = res.data.top_middle_offset;
                const topRight = res.data.top_right_offset;
                const leftUpper = res.data.left_upper_offset;
                const rightUpper = res.data.right_upper_offset;
                const leftMiddle = res.data.left_middle_offset;
                const rightMiddle = res.data.right_middle_offset;
                const leftLower = res.data.left_lower_offset;
                const rightLower = res.data.right_lower_offset;
                const leftBottom = res.data.left_bottom_offset;
                const middleBottom = res.data.middle_bottom_offset;
                const rightBottom = res.data.right_bottom_offset;
                const textAlign = res.data.text_align;
                const justifyContent = res.data.justify_content;
                const alignItems = res.data.align_items;

                topLeftOffset.value = topLeft;
                leftUpperOffset.value = leftUpper;

                topMiddleOffset.value = topMiddle;

                topRightOffset.value = topRight;
                rightUpperOffset.value = rightUpper;

                leftMiddleOffset.value = leftMiddle;
                rightMiddleOffset.value = rightMiddle;

                leftLowerOffset.value = leftLower;
                leftBottomOffset.value = leftBottom;

                middleBottomOffset.value = middleBottom;

                rightLowerOffset.value = rightLower;
                rightBottomOffset.value = rightBottom;

                const marginTop = topLeft + topMiddle + topRight;
                const marginBottom = leftBottom + middleBottom + rightBottom;
                const marginLeft = leftUpper + leftMiddle + leftLower;
                const marginRight = rightUpper + rightMiddle + rightLower;

                previewText.style.marginTop = marginTop + "px";
                previewText.style.marginBottom = marginBottom + "px";
                previewText.style.marginLeft = marginLeft + "px";
                previewText.style.marginRight = marginRight + "px";

                selectFont.value = font;
                previewText.style.fontFamily = font;
                inputFontSize.value = fontSize;
                previewText.style.fontSize = fontSize;
                colorPicker.value = fontColor;
                previewText.style.color = fontColor;
                taFontPreview.style.color = fontColor;
                if (fontColor === "#ffffff" || color === "white") {
                    taFontPreview.style.backgroundColor = "black";
                } else {
                    taFontPreview.style.backgroundColor = "";
                }

                if (bold) {
                    fontBold.classList.toggle("active");
                    previewText.style.fontWeight = "bold";
                    taFontPreview.style.fontWeight = "bold";
                    isBold = true;
                } else {
                    fontBold.classList.remove("active");
                    previewText.style.fontWeight = "";
                    taFontPreview.style.fontWeight = "";
                }
                if (italic) {
                    fontItalic.classList.toggle("active");
                    previewText.style.fontStyle = "italic";
                    taFontPreview.style.fontStyle = "italic";
                    isItalic = true;
                } else {
                    fontItalic.classList.remove("active");
                    previewText.style.fontStyle = "";
                    taFontPreview.style.fontStyle = "";
                }
                if (strikeThrough) {
                    fontStrikeThrough.classList.toggle("active");
                    previewText.style.textDecoration = "line-through";
                    taFontPreview.style.textDecoration = "line-through";
                    isStrikeThrough = true;
                } else {
                    fontStrikeThrough.classList.remove("active");
                    previewText.style.textDecoration = "";
                    taFontPreview.style.textDecoration = "";
                }
                switch (textAlign) {
                    case "center":
                        fontAlignCenter.classList.add("active");
                        previewText.style.textAlign = "center";
                        break;
                    case "end":
                        fontAlignHorRight.classList.add("active");
                        previewText.style.textAlign = "end";
                        break;
                    case "justify":
                        fontAlignJustify.classList.add("active");
                        previewText.style.textAlign = "justify";
                        break;
                    case "start":
                        fontAlignHorLeft.classList.add("active");
                        previewText.style.textAlign = "start";
                        break;
                    case "right":
                        fontAlignRight.classList.add("active");
                        previewText.style.textAlign = "right";
                        break;
                    case "left":
                        fontAlignLeft.classList.add("active");
                        previewText.style.textAlign = "left";
                        break;
                    default:
                        previewText.style.textAlign = "center";
                        console.error("Unknown text alignment");
                }
                changeLocation(justifyContent, alignItems);
                setLocation(justifyContent, alignItems);
            }
        }, true);
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
    tippy('#navThemeList', {
        content: "List of themes",
        interactive: true,
        placement: 'right',
        animation: 'scale',
        theme: 'light',
    });
    tippy('#navBibleSettings', {
        content: "Manage Bible versions",
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
    tippy('#fontAlignCenter', {
        content: "Text align center",
        interactive: false,
        placement: 'bottom',
        animation: 'scale',
        theme: 'light',
    });
    tippy('#fontAlignHorRight', {
        content: "Text align end",
        interactive: false,
        placement: 'bottom',
        animation: 'scale',
        theme: 'light',
    });
    tippy('#fontAlignJustify', {
        content: "Text align justify",
        interactive: false,
        placement: 'bottom',
        animation: 'scale',
        theme: 'light',
    });
    tippy('#fontAlignHorLeft', {
        content: "Text align start",
        interactive: false,
        placement: 'bottom',
        animation: 'scale',
        theme: 'light',
    });
    tippy('#fontAlignRight', {
        content: "Text align right",
        interactive: false,
        placement: 'bottom',
        animation: 'scale',
        theme: 'light',
    });
    tippy('#fontAlignLeft', {
        content: "Text align left",
        interactive: false,
        placement: 'bottom',
        animation: 'scale',
        theme: 'light',
    });
});