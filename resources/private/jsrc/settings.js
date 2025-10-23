const db = new Dexie("ServiceDB");
db.version(1).stores({
    media: "id, link",
});
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
    let isBold = false;
    let isItalic = false;
    let isStrikeThrough = false;
    let alignment = "center";
    let justifyContent = "";
    let alignItems = "";
    let bibleVersionInstalled;
    let versionList = [];
    let listBibleVersions = [];
    let listInstalledBibleVersions = [];

    const main = $("main", {
        onready : function(ev) {
            $.get("/getthemes", res => {
                if (res.ok) {
                    main.themeList.items.clear();
                    res.data.forEach(item => {
                        main.themeList.items.push({
                            dataset : { id : item.id },
                            text : item.themeName,
                        });
                        main.themeList2.items.push({
                            dataset : { id : item.id },
                            text : item.themeName,
                        });
                    });
                    loadFromDB();
                }
            }, true);
        },
        navFontSettings : {
            onready : function(ev) {
                main.navFontSettings.classList.add("active");
            },
            onclick : function(ev) {
                main.settingFont.show = true;
                main.navFontSettings.classList.add("active");
                main.navLocationSettings.classList.remove("active");
                main.navThemeList.classList.remove("active");
                main.navBibleSettings.classList.remove("active");
            },
        },
        navLocationSettings : {
            onclick : function(ev) {
                main.settingLocation.show = true;
                main.navLocationSettings.classList.add("active");
                main.navFontSettings.classList.remove("active");
                main.navThemeList.classList.remove("active");
                main.navBibleSettings.classList.remove("active");
                main.previewText.text = taFontPreview.value;
            }
        },
        navThemeList : {
            onclick : function(ev) {
                main.settingThemeList.show = true;
                main.navThemeList.classList.add("active");
                main.navFontSettings.classList.remove("active");
                main.navLocationSettings.classList.remove("active");
                main.navBibleSettings.classList.remove("active");
            }
        },
        navBibleSettings : {
            onclick : function(ev) {
                main.settingBible.show = true;
                main.navBibleSettings.classList.add("active");
                main.navFontSettings.classList.remove("active");
                main.navLocationSettings.classList.remove("active");
                main.navThemeList.classList.remove("active");
            }
        },
        settingFont : {
            show : true,
            onshow : function(ev) {
                main.settingLocation.show = false;
                main.settingThemeList.show = false;
                main.settingBible.show = false;
            },
        },
        fontBold : {
            onclick : function(ev) {
                main.fontBold.classList.toggle("active");
                if (fontBold.classList.contains("active")) {
                    taFontPreview.style.fontWeight = 'bold';
                    main.previewText.style.fontWeight = 'bold';
                    isBold = true;
                } else {
                    taFontPreview.style.fontWeight = '';
                    main.previewText.style.fontWeight = '';
                    isBold = false;
                }
                // todo: update db
            }
        },
        fontItalic : {
            onclick : function(ev) {
                main.fontItalic.classList.toggle("active");
                if (main.fontItalic.classList.contains("active")) {
                    taFontPreview.style.fontStyle = 'italic';
                    main.previewText.style.fontStyle = 'italic';
                    isItalic = true;
                } else {
                    taFontPreview.style.fontStyle = '';
                    main.previewText.style.fontStyle = '';
                    isItalic = false;
                }
                // todo: update db
            }
        },
        fontStrikeThrough : {
            onclick : function(ev) {
                main.fontStrikeThrough.classList.toggle("active");
                if (main.fontStrikeThrough.classList.contains("active")) {
                    taFontPreview.style.textDecoration = 'line-through';
                    main.previewText.style.textDecoration = 'line-through';
                    isStrikeThrough = true;
                } else {
                    taFontPreview.style.textDecoration = '';
                    main.previewText.style.textDecoration = '';
                    isStrikeThrough = false;
                }
                // todo: update db
            }
        },
        settingLocation : {
            show : false,
            onshow : function(ev) {
                main.settingFont.show = false;
                main.settingThemeList.show = false;
                main.settingBible.show = false;
                const host = window.location.hostname; // Get the current host
                const protocol = window.location.protocol; // Get the current protocol (http or https)
                const url = `${host}:5555`; // Construct the full URL
                //livePreview.src = `/`; todo: uncomment if needed
            },
        },
        topLeftOffset : {
            disabled : true,
            onchange : function(ev) {
                var offset = ev.target.value;
                if (offset <= 0) {
                    offset = 0;
                    main.topLeftOffset.value = offset;
                }
                main.previewText.style.marginTop = offset + "px";
            }
        },
        topMiddleOffset : {
            disabled : true,
            onchange : function(ev) {
                var offset = ev.target.value;
                if (offset <= 0) {
                    offset = 0;
                    main.topMiddleOffset.value = offset;
                }
                main.previewText.style.marginTop = offset + "px";
            }
        },
        topRightOffset : {
            disabled : true,
            onchange : function(ev) {
                var offset = ev.target.value;
                if (offset <= 0) {
                    offset = 0;
                    main.topRightOffset.value = offset;
                }
                main.previewText.style.marginTop = offset + "px";
            }
        },
        leftUpperOffset : {
            disabled : true,
            onchange : function(ev) {
                var offset = ev.target.value;
                if (offset <= 0) {
                    offset = 0;
                    main.leftUpperOffset.value = offset;
                }
                main.previewText.style.marginLeft = offset + "px";
            }
        },
        radioTopLeft : {
            onclick : function(ev) {
                changeLocation("flex-start", "flex-start");
                resetOffset();
                disabledOffset(false,true,true,false,true,true,true,true,true,true,true,true);
            }
        },
        radioTopMiddle : {
            onclick : function(ev) {
                changeLocation("center", "flex-start");
                resetOffset();
                disabledOffset(true,false,true,true,true,true,true,true,true,true,true,true);
            }
        },
        radioTopRight : {
            onclick : function(ev) {
                changeLocation("flex-end", "flex-start");
                resetOffset();
                disabledOffset(true,true,false,true,false,true,true,true,true,true,true,true);
            }
        },
        rightUpperOffset : {
            disabled : true,
            onchange : function(ev) {
                var offset = ev.target.value;
                if (offset <= 0) {
                    offset = 0;
                    main.rightUpperOffset.value = offset;
                }
                main.previewText.style.marginRight = offset + "px";
            }
        },
        leftMiddleOffset : {
            disabled : true,
            onchange : function(ev) {
                var offset = ev.target.value;
                if (offset <= 0) {
                    offset = 0;
                    main.leftMiddleOffset.value = offset;
                }
                main.previewText.style.marginLeft = offset + "px";
            }
        },
        radioLefMiddle : {
            onclick : function(ev) {
                changeLocation("flex-start", "center");
                resetOffset();
                disabledOffset(true,true,true,true,true,false,true,true,true,true,true,true);
            }
        },
        radioCenter : {
            onready : function(ev) {
                changeLocation("center", "center");
                disabledOffset(true,false,true,true,true,false,false,true,true,true,false,true);
            },
            onclick : function(ev) {
                changeLocation("center", "center");
                resetOffset();
                disabledOffset(true,false,true,true,true,false,false,true,true,true,false,true);
            }
        },
        radioRightMiddle : {
            onclick : function(ev) {
                changeLocation("flex-end", "center");
                resetOffset();
                disabledOffset(true,true,true,true,true,true,false,true,true,true,true,true);
            }
        },
        rightMiddleOffset : {
            disabled : true,
            onchange : function(ev) {
                var offset = ev.target.value;
                if (offset <= 0) {
                    offset = 0;
                    main.rightMiddleOffset.value = offset;
                }
                main.previewText.style.marginRight = offset + "px";
            }
        },
        leftLowerOffset : {
            disabled : true,
            onchange : function(ev) {
                var offset = ev.target.value;
                if (offset <= 0) {
                    offset = 0;
                    main.leftLowerOffset.value = offset;
                }
                main.previewText.style.marginLeft = offset + "px";
            }
        },
        radioLeftBottom : {
            onclick : function(ev) {
                changeLocation("flex-start", "end");
                resetOffset();
                disabledOffset(true,true,true,true,true,true,true,false,true,false,true,true);
            }
        },
        radioMiddleBottom : {
            onclick : function(ev) {
                changeLocation("center", "end");
                resetOffset();
                disabledOffset(true,true,true,true,true,true,true,true,true,true,false,true);
            }
        },
        radioRightBottom : {
            onclick : function(ev) {
                changeLocation("flex-end", "end");
                resetOffset();
                disabledOffset(true,true,true,true,true,true,true,true,false,true,true,false);
            }
        },
        rightLowerOffset : {
            disabled : true,
            onchange : function(ev) {
                var offset = ev.target.value;
                if (offset <= 0) {
                    offset = 0;
                    main.rightLowerOffset.value = offset;
                }
                main.previewText.style.marginRight = offset + "px";
            }
        },
        leftBottomOffset : {
            disabled : true,
            onchange : function(ev) {
                var offset = ev.target.value;
                if (offset <= 0) {
                    offset = 0;
                    main.leftBottomOffset.value = offset;
                }
                main.previewText.style.marginBottom = offset + "px";
            }
        },
        middleBottomOffset : {
            disabled : true,
            onchange : function(ev) {
                var offset = ev.target.value;
                if (offset <= 0) {
                    offset = 0;
                    main.middleBottomOffset.value = offset;
                }
                main.previewText.style.marginBottom = offset + "px";
            }
        },
        rightBottomOffset : {
            disabled : true,
            onchange : function(ev) {
                var offset = ev.target.value;
                if (offset <= 0) {
                    offset = 0;
                    main.rightBottomOffset.value = offset;
                }
                main.previewText.style.marginBottom = offset + "px";
            }
        },
        fontAlignCenter : {
            onready : function(ev) {
                main.fontAlignCenter.classList.add("active");
                main.previewText.style.textAlign = "center";
            },
            onclick : function(ev) {
                main.previewText.style.textAlign = "center";
                main.fontAlignCenter.classList.add("active");
                main.fontAlignHorRight.classList.remove("active");
                main.fontAlignJustify.classList.remove("active");
                main.fontAlignHorLeft.classList.remove("active");
                main.fontAlignRight.classList.remove("active");
                main.fontAlignLeft.classList.remove("active");
                alignment = "center";
            }
        },
        fontAlignHorRight : {
            onclick : function(ev) {
                main.previewText.style.textAlign = "end";
                main.fontAlignCenter.classList.remove("active");
                main.fontAlignHorRight.classList.add("active");
                main.fontAlignJustify.classList.remove("active");
                main.fontAlignHorLeft.classList.remove("active");
                main.fontAlignRight.classList.remove("active");
                main.fontAlignLeft.classList.remove("active");
                alignment = "end";
            }
        },
        fontAlignJustify : {
            onclick : function(ev) {
                main.previewText.style.textAlign = "justify";
                main.fontAlignCenter.classList.remove("active");
                main.fontAlignHorRight.classList.remove("active");
                main.fontAlignJustify.classList.add("active");
                main.fontAlignHorLeft.classList.remove("active");
                main.fontAlignRight.classList.remove("active");
                main.fontAlignLeft.classList.remove("active");
                alignment = "justify";
            }
        },
        fontAlignHorLeft : {
            onclick : function(ev) {
                main.previewText.style.textAlign = "start";
                main.fontAlignCenter.classList.remove("active");
                main.fontAlignHorRight.classList.remove("active");
                main.fontAlignJustify.classList.remove("active");
                main.fontAlignHorLeft.classList.add("active");
                main.fontAlignRight.classList.remove("active");
                main.fontAlignLeft.classList.remove("active");
                alignment = "start";
            }
        },
        fontAlignRight : {
            onclick : function(ev) {
                main.previewText.style.textAlign = "right";
                main.fontAlignCenter.classList.remove("active");
                main.fontAlignHorRight.classList.remove("active");
                main.fontAlignJustify.classList.remove("active");
                main.fontAlignHorLeft.classList.remove("active");
                main.fontAlignRight.classList.add("active");
                main.fontAlignLeft.classList.remove("active");
                alignment = "right";
            }
        },
        fontAlignLeft : {
            onclick : function(ev) {
                main.previewText.style.textAlign = "left";
                main.fontAlignCenter.classList.remove("active");
                main.fontAlignHorRight.classList.remove("active");
                main.fontAlignJustify.classList.remove("active");
                main.fontAlignHorLeft.classList.remove("active");
                main.fontAlignRight.classList.remove("active");
                main.fontAlignLeft.classList.add("active");
                alignment = "left";
            }
        },
        buttonResetOffset : {
            onclick : function(ev) {
                main.previewText.style.margin = "0";
                resetOffset();
            }
        },
        themeList : {
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
                main.inputThemeName.value = ev.target.value;
                setTheme(data);
            }
        },
        buttonSetTheme : {
            onclick : function(ev) {
                const theme = main.themeList.value;
                if (theme === "") {
                    $.failure("Please choose a theme");
                } else {
                    const data = {
                        theme : theme,
                    };
                    setTheme(data);
                }
            }
        },
        buttonOpenFile : {
            onclick : function(ev) {
                const ups = [];
                $.upload(ev, {
                    field   : "file",
                    upload  : "/upload",
                    parallel : true,
                    maxFiles : 30,
                    maxSizeMb : 5000,
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
        },
        buttonSetPlay : {
            onclick : function(ev) {
                if (mediaLink.value === "") {
                    $.failure("You did not provide a proper link.");
                } else {
                    saveToLocalDB("media", { id: "videolink", link: mediaLink.value });
                    const data = {
                        link: mediaLink.value
                    };
                    $.post("/bglink", data, res => {
                        if (res.ok) {
                            console.debug("Setting bg with link success.");
                        }
                    }, error => {
                        console.error("Error setting background with provided link.", error);
                    }, true);
                }
            }
        },
        buttonClearMedia : {
            onclick : function(ev) {
                $.post("/removebackground", res => {
                    if (res.ok) {
                        if (mediaLink.value != "") {
                            mediaLink.value = "";
                            db.media.delete("videolink");
                        }
                    }
                });
            }
        },
        previewContainer : {},
        previewText : {},
        settingThemeList : {
            show : false,
            onshow : function(ev) {
                main.settingFont.show = false;
                main.settingLocation.show = false;
                main.settingBible.show = false;
            }
        },
        themeList2 : {
            template : {
                optionTheme2 : {
                    tagName : "option",
                    id : "optionTheme2"
                }
            },
            items : [],
        },
        buttonDeleteTheme : {
            onclick : function(ev) {
                $.confirm("Confirm deleting this theme?", yes => {
                    if (yes) {
                        if (main.themeList2.value === "default") {
                            $.failure("Cannot delete default theme");
                        } else {
                            const selected = main.themeList2.options[main.themeList2.selectedIndex];
                            const id = selected.dataset.id;
                            console.log("selected id is", id);
                            $.post("/deletetheme/" + id, res => {
                                if (res.ok) {
                                    $.success("Deleting theme success.");
                                }
                            }, error => {
                                $.failure("Error deleting a theme.", error);
                            }, true);
                        }
                    }
                });
            }
        },
        buttonDisableService : {
            onclick : function(ev) {
                $.confirm("Confirm to disable projector service?", yes => {
                    if (yes) {
                        if (main.buttonDisableService.text === "Disable projector") {
                            $.post("/disableservice", res => {
                                if (res.ok) {
                                    $.success("Success!");
                                    main.buttonDisableService.text = "Enable projector";
                                } else {
                                    $.failure("Something's wrong disabling the service.");
                                }
                            }, error => {
                                console.error("Error disabling kiosk service.", error);
                            }, true);
                        } else {
                            $.post("/enableservice", res => {
                                if (res.ok) {
                                    $.success("Success!");
                                    main.buttonDisableService.text = "Disable projector";
                                } else {
                                    $.failure("Something's wrong enabling the service.");
                                }
                            }, error => {
                                console.error("Error enabling kiosk service.", error);
                            }, true);
                        }
                    }
                });
            }
        },
        settingBible : {
            show : false,
            onshow : function(ev) {
                main.settingFont.show = false;
                main.settingLocation.show = false;
                main.settingThemeList.show = false;
            }
        },
        buttonInstall : {
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
        },
        buttonUninstall : {
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
        },
        selectVersionsToProject : {
            onready : function(ev) {
                if (ev.target.value === "1") {
                    main.version1.enabled = true;
                    main.version2.enabled = false;
                    main.version3.enabled = false;
                }
            },
            onchange : function(ev) {
                if (ev.target.value === "1") {
                    main.version1.show = true;
                    main.version2.show = false;
                    main.version3.show = false;
                } else if (ev.target.value === "2") {
                    main.version1.show = true;
                    main.version2.show = true;
                    main.version3.show = false;
                } else if (ev.target.value === "3") {
                    main.version1.show = true;
                    main.version2.show = true;
                    main.version3.show = true;
                }
            }
        },
        version1 : {},
        version2 : {
            show : false,
        },
        version3 : {
            show : false,
        },
        buttonSearch : {
            onclick : function(ev) {
                versionList = [];
                if (main.version1.show === true) {
                    versionList.push(selectVersion1.value.split(":")[0].trim());
                }
                if (main.version2.show === true) {
                    versionList.push(selectVersion2.value.split(":")[0].trim());
                }
                if (main.version3.show === true) {
                    versionList.push(selectVersion3.value.split(":")[0].trim());
                }
                searchBible(inputVerseSearch.value, versionList);
            }
        },
        verseList : {
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
                            const preElements = document.querySelectorAll("ul.verseList pre");
                            preElements.forEach(pre => {
                                pre.style.backgroundColor = ""; // Reset to original background color
                                pre.style.color = "";
                            });
                            ev.target.style.backgroundColor = "lightgreen";
                            ev.target.style.color = "black";

                            versionList = [];
                            if (main.version1.show === true) {
                                versionList.push(selectVersion1.value.split(":")[0].trim());
                            }
                            if (main.version2.show === true) {
                                versionList.push(selectVersion2.value.split(":")[0].trim());
                            }
                            if (main.version3.show === true) {
                                versionList.push(selectVersion3.value.split(":")[0].trim());
                            }
                            const data = {
                                verse : main.verseList.textContent,
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
        },
        inputThemeName : {},
        buttonSaveTheme : {
            onclick : function(ev) {
                if (main.inputThemeName.value === "") {
                    $.failure("Please type-in a theme's name");
                } else {
                    const selected = main.themeList.options[main.themeList.selectedIndex];
                    const id = selected.dataset.id;
                    console.log("the id is", id);
                    const data = {
                        id : id,
                        themeName: main.inputThemeName.value.toLowerCase(),
                        font: selectFont.value,
                        fontSize: inputFontSize.value,
                        fontColor: colorPicker.value,
                        bold: isBold,
                        italic: isItalic,
                        strikeThrough: isItalic,
                        topLeftOffset: main.topLeftOffset.value,
                        topMiddleOffset: main.topMiddleOffset.value,
                        topRightOffset: main.topRightOffset.value,
                        leftUpperOffset: main.leftUpperOffset.value,
                        rightUpperOffset: main.rightUpperOffset.value,
                        leftMiddleOffset: main.leftMiddleOffset.value,
                        rightMiddleOffset: main.rightMiddleOffset.value,
                        leftLowerOffset: main.leftLowerOffset.value,
                        rightLowerOffset: main.rightLowerOffset.value,
                        leftBottomOffset: main.leftBottomOffset.value,
                        middleBottomOffset: main.middleBottomOffset.value,
                        rightBottomOffset: main.rightBottomOffset.value,
                        textAlign: alignment,
                        justifyContent: justifyContent,
                        alignItems: alignItems
                    };
                    $.put("/savetheme", data, res => {
                        if (res.ok) {
                            console.log("data is", data);
                            $.success("Theme saved.");
                        } else {
                            $.failure("An error occurred!");
                        }
                    }, error => {
                        $.failure("An error occurred!", error);
                    }, true);
                }
            }
        },
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
        onready : function(ev) {
            this.value = 24;
        },
        onchange : function(ev) {
            var size = 1;
            if (this.value <= 0) {
                this.value = 1;
            } else {
                size = ev.target.value;
                taFontPreview.style.fontSize = size + "px";
                main.previewText.style.fontSize = size + "px";
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
            main.previewText.innerHTML = this.value.replace(/\n/g, '<br>');;
        }
    });
    const colorPicker = $("#colorPicker", {
        onchange : function(ev) {
            const color = ev.target.value;
            taFontPreview.style.color = color;
            main.previewText.style.color = color;
            if (color === "#ffffff" || color === "white") {
                taFontPreview.style.backgroundColor = "black";
            } else {
                taFontPreview.style.backgroundColor = "";
            }
        }
    });
    /*
    const livePreview = $("#livePreview", {
        onready : function(ev) {
            this.style.height = this.contentWindow.document.body.scrollHeight + 'px';
        }
    });
    */
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
    const mediaLink = $("#mediaLink");
    const inputVerseSearch = $("#inputVerseSearch", {
        onkeydown : function(ev) {
            if (ev.key === "Enter") {
                versionList = [];
                if (main.version1.show === true) {
                    versionList.push(selectVersion1.value.split(":")[0].trim());
                }
                if (main.version2.show === true) {
                    versionList.push(selectVersion2.value.split(":")[0].trim());
                }
                if (main.version3.show === true) {
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
                main.verseList.items.clear();
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
                    main.verseList.items.push({
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
        main.topLeftOffset.value = 0;
        main.topMiddleOffset.value = 0;
        main.topRightOffset.value = 0;
        main.leftUpperOffset.value = 0;
        main.rightUpperOffset.value = 0;
        main.leftMiddleOffset.value = 0;
        main.rightMiddleOffset.value = 0;
        main.leftLowerOffset.value = 0;
        main.rightLowerOffset.value = 0;
        main.leftBottomOffset.value = 0;
        main.middleBottomOffset.value = 0;
        main.rightBottomOffset.value = 0;
    }
    function disabledOffset(topLeft,topMiddle,topRight,leftUpper,rightUpper,leftMiddle,rightMiddle,leftLower,rightLower,leftBottom,middleBottom,rightBottom) {
        main.topLeftOffset.disabled = topLeft;
        main.topMiddleOffset.disabled = topMiddle;
        main.topRightOffset.disabled = topRight;
        main.leftUpperOffset.disabled = leftUpper;
        main.rightUpperOffset.disabled = rightUpper;
        main.leftMiddleOffset.disabled = leftMiddle;
        main.rightMiddleOffset.disabled = rightMiddle;
        main.leftLowerOffset.disabled = leftLower;
        main.rightLowerOffset.disabled = rightLower;
        main.leftBottomOffset.disabled = leftBottom;
        main.middleBottomOffset.disabled = middleBottom;
        main.rightBottomOffset.disabled = rightBottom;
    }
    function changeLocation(x, y) {
        main.previewContainer.style.justifyContent = x;
        main.previewContainer.style.alignItems = y;
        justifyContent = x;
        alignItems = y;
        console.log("justify content is ", x);
        console.log("align items is ", y);
    }
    function setLocation(x, y) {
        if (x === "flex-start" && y === "flex-start") {
            main.radioTopLeft.checked = true;
            disabledOffset(false,true,true,false,true,true,true,true,true,true,true,true);
        } else if (x === "center" && y === "flex-start") {
            main.radioTopMiddle.checked = true;
            disabledOffset(true,false,true,true,true,true,true,true,true,true,true,true);
        } else if (x === "flex-end" && y === "flex-start") {
            main.radioTopRight.checked = true;
            disabledOffset(true,true,false,true,false,true,true,true,true,true,true,true);
        } else if (x === "flex-start" && y === "center") {
            main.radioLefMiddle.checked = true;
            disabledOffset(true,true,true,true,true,false,true,true,true,true,true,true);
        } else if (x === "center" && y === "center") {
            main.radioCenter.checked = true;
            disabledOffset(true,false,true,true,true,false,false,true,true,true,false,true);
        } else if (x === "flex-end" && y === "center") {
            main.radioRightMiddle.checked = true;
            disabledOffset(true,true,true,true,true,true,false,true,true,true,true,true);
        } else if (x === "flex-start" && y === "end") {
            main.radioLeftBottom.checked = true;
            disabledOffset(true,true,true,true,true,true,true,false,true,false,true,true);
        } else if (x === "center" && y === "end") {
            main.radioMiddleBottom.checked = true;
            disabledOffset(true,true,true,true,true,true,true,true,true,true,false,true);
        } else if (x === "flex-end" && y === "end") {
            main.radioRightBottom.checked = true;
            disabledOffset(true,true,true,true,true,true,true,true,false,true,true,false);
        }
    }
    function setTheme(data) {
        $.post("/settheme", data, res => {
            if (res.ok) {
                console.log("Theme is set to", res.data.theme_name);
                saveToLocalDB("theme", { id: "settheme", theme: res.data.theme_name });
                console.log("theme to set is", res.data);
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

                main.topLeftOffset.value = topLeft;
                main.leftUpperOffset.value = leftUpper;

                main.topMiddleOffset.value = topMiddle;

                main.topRightOffset.value = topRight;
                main.rightUpperOffset.value = rightUpper;

                main.leftMiddleOffset.value = leftMiddle;
                main.rightMiddleOffset.value = rightMiddle;

                main.leftLowerOffset.value = leftLower;
                main.leftBottomOffset.value = leftBottom;

                main.middleBottomOffset.value = middleBottom;

                main.rightLowerOffset.value = rightLower;
                main.rightBottomOffset.value = rightBottom;

                const marginTop = topLeft + topMiddle + topRight;
                const marginBottom = leftBottom + middleBottom + rightBottom;
                const marginLeft = leftUpper + leftMiddle + leftLower;
                const marginRight = rightUpper + rightMiddle + rightLower;

                main.previewText.style.marginTop = marginTop + "px";
                main.previewText.style.marginBottom = marginBottom + "px";
                main.previewText.style.marginLeft = marginLeft + "px";
                main.previewText.style.marginRight = marginRight + "px";

                selectFont.value = font;
                main.previewText.style.fontFamily = font;
                inputFontSize.value = fontSize;
                main.previewText.style.fontSize = fontSize + "px";
                colorPicker.value = fontColor;
                main.previewText.style.color = fontColor;
                taFontPreview.style.color = fontColor;
                if (fontColor === "#ffffff" || fontColor === "white") {
                    taFontPreview.style.backgroundColor = "black";
                } else {
                    taFontPreview.style.backgroundColor = "";
                }

                if (bold) {
                    main.fontBold.classList.toggle("active");
                    main.previewText.style.fontWeight = "bold";
                    taFontPreview.style.fontWeight = "bold";
                    isBold = true;
                } else {
                    main.fontBold.classList.remove("active");
                    main.previewText.style.fontWeight = "";
                    taFontPreview.style.fontWeight = "";
                }
                if (italic) {
                    main.fontItalic.classList.toggle("active");
                    main.previewText.style.fontStyle = "italic";
                    taFontPreview.style.fontStyle = "italic";
                    isItalic = true;
                } else {
                    main.fontItalic.classList.remove("active");
                    main.previewText.style.fontStyle = "";
                    taFontPreview.style.fontStyle = "";
                }
                if (strikeThrough) {
                    main.fontStrikeThrough.classList.toggle("active");
                    main.previewText.style.textDecoration = "line-through";
                    taFontPreview.style.textDecoration = "line-through";
                    isStrikeThrough = true;
                } else {
                    main.fontStrikeThrough.classList.remove("active");
                    main.previewText.style.textDecoration = "";
                    taFontPreview.style.textDecoration = "";
                }
                switch (textAlign) {
                    case "center":
                        main.fontAlignCenter.classList.add("active");
                        main.previewText.style.textAlign = "center";
                        break;
                    case "end":
                        main.fontAlignHorRight.classList.add("active");
                        main.previewText.style.textAlign = "end";
                        break;
                    case "justify":
                        main.fontAlignJustify.classList.add("active");
                        main.previewText.style.textAlign = "justify";
                        break;
                    case "start":
                        main.fontAlignHorLeft.classList.add("active");
                        main.previewText.style.textAlign = "start";
                        break;
                    case "right":
                        main.fontAlignRight.classList.add("active");
                        main.previewText.style.textAlign = "right";
                        break;
                    case "left":
                        main.fontAlignLeft.classList.add("active");
                        main.previewText.style.textAlign = "left";
                        break;
                    default:
                        main.previewText.style.textAlign = "center";
                        console.error("Unknown text alignment");
                }
                changeLocation(justifyContent, alignItems);
                setLocation(justifyContent, alignItems);
            }
        }, true);
    }
    async function loadFromDB() {
        await db.media.get("videolink").then(media => {
            if (media) {
                mediaLink.value = media.link;
            } else {
                console.log("media is empty");
            }
        });
        await db.media.get("settheme").then(theme => {
            if (theme) {
                console.log("theme from db", theme);
                Array.from(main.themeList.options).forEach(option => {
                    if (option.text === theme.name) {
                        main.themeList.value = option.value;
                        main.inputThemeName.value = theme.name;
                        setTheme({theme : theme.name});
                    }
                });
            } else {
                console.log("No theme set.");
            }
        });
        await db.media.get("versions").then(versions => {
            if (versions) {
                bibleVersions.items.clear();
                versions.list.forEach(item => {
                    bibleVersions.items.push({ text: item });
                });
            } else {
                console.log("No Bible versions saved.")
                $.get("/getbooks", res => {
                    if (res.ok) {
                        bibleVersions.items.clear();
                        Object.entries(res.data).forEach(([k,v]) => {
                            listBibleVersions.push(`${k} : ${v}`);
                            bibleVersions.items.push({
                                text : `${k} : ${v}`,
                            });
                        });
                        saveToLocalDB("bibleversions", { list: listBibleVersions });
                    }
                }, error => {
                    console.error("Error getting books", error);
                }, true);
            }
        });
        await db.media.get("installed").then(versions => {
            if (versions) {
                versionsInstalled.items.clear();
                selectVersion1.items.clear();
                selectVersion2.items.clear();
                selectVersion3.items.clear();
                versions.list.forEach(item => {
                    versionsInstalled.items.push({
                        text : item,
                    });
                    selectVersion1.items.push({
                        text : item,
                    });
                    selectVersion2.items.push({
                        text : item,
                    });
                    selectVersion3.items.push({
                        text : item,
                    });
                });
            } else {
                console.log("No Bible versions saved.")
                $.get("/getversions", res => {
                    if (res.ok) {
                        versionsInstalled.items.clear();
                        selectVersion1.items.clear();
                        selectVersion2.items.clear();
                        selectVersion3.items.clear();
                        Object.entries(res.data).forEach(([k,v]) => {
                            listInstalledBibleVersions.push(`${k} : ${v}`);
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
                        saveToLocalDB("installedversions", { list: listInstalledBibleVersions });
                    }
                });
            }
        });
    }
    async function saveToLocalDB(key, data) {
        switch (key) {
            case "media":
                await db.media.put({ id: data.id, link: data.link });
                break;
            case "theme":
                await db.media.put({ id: data.id, name: data.theme });
                break;
            case "bibleversions":
                await db.media.put({ id: "versions", list: data.list });
                break;
            case "installedversions":
                await db.media.put({ id: "installed", list: data.list });
                break;
            default:
                break;
        }
    }

    tippy('.navFontSettings', {
        content: "Font settings (Font style and size)",
        interactive: true,
        placement: 'right',
        animation: 'scale',
        theme: 'light',
    });
    tippy('.navLocationSettings', {
        content: "Setting for the location of text on the screen",
        interactive: true,
        placement: 'right',
        animation: 'scale',
        theme: 'light',
    });
    tippy('.navThemeList', {
        content: "List of themes",
        interactive: true,
        placement: 'right',
        animation: 'scale',
        theme: 'light',
    });
    tippy('.navBibleSettings', {
        content: "Manage Bible versions",
        interactive: true,
        placement: 'right',
        animation: 'scale',
        theme: 'light',
    });
    tippy('.fontBold', {
        content: "Bold",
        interactive: true,
        placement: 'bottom',
        animation: 'scale',
        theme: 'light',
    });
    tippy('.fontItalic', {
        content: "Italic",
        interactive: true,
        placement: 'bottom',
        animation: 'scale',
        theme: 'light',
    });
    tippy('.fontStrikeThrough', {
        content: "Strike through",
        interactive: true,
        placement: 'bottom',
        animation: 'scale',
        theme: 'light',
    });
    tippy('.topLeftOffset', {
        content: "Top-left offset",
        interactive: false,
        placement: 'top',
        animation: 'scale',
        theme: 'light',
    });
    tippy('.topMiddleOffset', {
        content: "Top-middle offset",
        interactive: false,
        placement: 'top',
        animation: 'scale',
        theme: 'light',
    });
    tippy('.topRightOffset', {
        content: "Top-right offset",
        interactive: false,
        placement: 'top',
        animation: 'scale',
        theme: 'light',
    });
    tippy('.leftUpperOffset', {
        content: "Left-upper offset",
        interactive: false,
        placement: 'right',
        animation: 'scale',
        theme: 'light',
    });
    tippy('.rightUpperOffset', {
        content: "Right-upper offset",
        interactive: false,
        placement: 'right',
        animation: 'scale',
        theme: 'light',
    });
    tippy('.leftMiddleOffset', {
        content: "Left-middle offset",
        interactive: false,
        placement: 'right',
        animation: 'scale',
        theme: 'light',
    });
    tippy('.rightMiddleOffset', {
        content: "Right-middle offset",
        interactive: false,
        placement: 'right',
        animation: 'scale',
        theme: 'light',
    });
    tippy('.leftLowerOffset', {
        content: "Bottom-lower offset",
        interactive: false,
        placement: 'right',
        animation: 'scale',
        theme: 'light',
    });
    tippy('.rightLowerOffset', {
        content: "Right-lower offset",
        interactive: false,
        placement: 'right',
        animation: 'scale',
        theme: 'light',
    });
    tippy('.leftBottomOffset', {
        content: "Left-bottom offset",
        interactive: false,
        placement: 'bottom',
        animation: 'scale',
        theme: 'light',
    });
    tippy('.middleBottomOffset', {
        content: "Middle-bottom offset",
        interactive: false,
        placement: 'bottom',
        animation: 'scale',
        theme: 'light',
    });
    tippy('.rightBottomOffset', {
        content: "Right-bottom offset",
        interactive: false,
        placement: 'bottom',
        animation: 'scale',
        theme: 'light',
    });
    tippy('.fontAlignCenter', {
        content: "Text align center",
        interactive: false,
        placement: 'bottom',
        animation: 'scale',
        theme: 'light',
    });
    tippy('.fontAlignHorRight', {
        content: "Text align end",
        interactive: false,
        placement: 'bottom',
        animation: 'scale',
        theme: 'light',
    });
    tippy('.fontAlignJustify', {
        content: "Text align justify",
        interactive: false,
        placement: 'bottom',
        animation: 'scale',
        theme: 'light',
    });
    tippy('.fontAlignHorLeft', {
        content: "Text align start",
        interactive: false,
        placement: 'bottom',
        animation: 'scale',
        theme: 'light',
    });
    tippy('.fontAlignRight', {
        content: "Text align right",
        interactive: false,
        placement: 'bottom',
        animation: 'scale',
        theme: 'light',
    });
    tippy('.fontAlignLeft', {
        content: "Text align left",
        interactive: false,
        placement: 'bottom',
        animation: 'scale',
        theme: 'light',
    });
});