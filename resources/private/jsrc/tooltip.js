m2d2.ready($ => {
    const howToContent = "<p>Song sections</p>" +
                       "<p>Small or capital letter is fine</p>" +
                       "<p>--------------------------</p>" +
                       "<p>$I - for INTRO</p>" +
                       "<p>--------------------------</p>" +
                       "<p>$P - for PRE-CHORUS</p>" +
                       "<p>--------------------------</p>" +
                       "<p>$V - for VERSE</p>" +
                       "<p>--------------------------</p>" +
                       "<p>$C - for CHORUS</p>" +
                       "<p>--------------------------</p>" +
                       "<p>$B - for BRIDGE</p>" +
                       "<p>--------------------------</p>" +
                       "<p>$R - for REFRAIN</p>" +
                       "<p>--------------------------</p>" +
                       "<p>$O - for OUTRO</p>" +
                       "<p>--------------------------</p>" +
                       "<p>Example</p>" +
                       "<p>$V</p>" +
                       "<p>The splendor of a King...</p>" +
                       "<p>$c</p>" +
                       "<p>How great is our God</p>" +
                       "<p>$b</p>" +
                       "<p>Name above all names.</p>";
    /*
     * CONTROL HTML
    */
    tippy('.navNew', {
        content: "Create a new song",
        interactive: true,
        placement: 'right',
        animation: 'scale',
    });
    tippy('.navEdit', {
        content: "Edit an existing song",
        interactive: true,
        placement: 'right',
        animation: 'scale',
    });
    tippy('.navDelete', {
        content: "Delete a song",
        interactive: true,
        placement: 'right',
        animation: 'scale',
    });
    tippy('.navStartProjector', {
        content: "Start Projector",
        interactive: true,
        placement: 'right',
        animation: 'scale',
    });
    tippy('.navStopProjector', {
        content: "Stop Projector",
        interactive: true,
        placement: 'right',
        animation: 'scale',
    });
    tippy('.navInfo', {
        allowHTML: true,
        content: 'Version: 2.0\nDeveloper: Sem Moreno\nSince: 2024\nandrouino.info@gmail.com',
        interactive: true,
        placement: 'right',
        animation: 'scale',
    });
    tippy('.navWiFi', {
        content: "Connect the server to a wifi network",
        interactive: true,
        placement: 'right',
        animation: 'scale',
    });
    tippy('.navSettings', {
        content: "Settings",
        interactive: true,
        placement: 'right',
        animation: 'scale',
    });
    tippy('.navLogout', {
        content: "Log out",
        interactive: true,
        placement: 'right',
        animation: 'scale',
    });
    tippy('#iconSearch', {
        content: "Search",
        interactive: true,
        placement: 'top',
        animation: 'scale',
    });
    tippy('.lyricsContainer', {
        content: "Double click to edit",
        interactive: false,
        placement: 'top',
        animation: 'scale',
    });
    tippy('.clearLive', {
        content: "Clear live",
        interactive: false,
        placement: 'top',
        animation: 'scale',
    });
    tippy('.controlDefault', {
        content: "Default screen",
        interactive: false,
        placement: 'top',
        animation: 'scale',
    });
    tippy('.controlBlackScreen', {
        content: "Set screen to black",
        interactive: false,
        placement: 'top',
        animation: 'scale',
    });
    tippy('.controlHideLyrics', {
        content: "Hide the lyric",
        interactive: false,
        placement: 'top',
        animation: 'scale',
    });
    tippy('.controlRemoveBackground', {
        content: "Remove the background",
        interactive: false,
        placement: 'top',
        animation: 'scale',
    });
    tippy('.controlCloseEditMode', {
        content: "Clear editing",
        interactive: false,
        placement: 'top',
        animation: 'scale',
    });
    tippy('.controlClearSongList', {
        content: "Clear song list",
        interactive: false,
        placement: 'top',
        animation: 'scale',
    });
    tippy('.controlViewLive', {
        content: "Live view",
        interactive: false,
        placement: 'top',
        animation: 'scale',
    });
    tippy('.controlPreview', {
        content: "Preview",
        interactive: false,
        placement: 'top',
        animation: 'scale',
    });
    /*
     * CREATE HTML
    */
    tippy('#howTo', {
        allowHTML: true,
        content: howToContent,
        interactive: true,
        placement: "bottom-end",
        trigger: "click",
        onShow: async (instance) => {
            // call a function here
        }
    });
    /*
     * SETTINGS HTML
    */
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
    tippy('.navMessage', {
        content: "Project speaker's message",
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
    tippy('.saveMessage', {
        content: "Save, set and start the presentation",
        interactive: false,
        placement: 'bottom',
        animation: 'scale',
        theme: 'light',
    });
    tippy('.previousSlide', {
        content: "To previous slide",
        interactive: false,
        placement: 'bottom',
        animation: 'scale',
        theme: 'light',
    });
    tippy('.nextSlide', {
        content: "To next slide",
        interactive: false,
        placement: 'bottom',
        animation: 'scale',
        theme: 'light',
    });
    tippy('.switch', {
        content: "Enable/Disable background",
        interactive: false,
        placement: 'bottom',
        animation: 'scale',
        theme: 'light',
    });
    /*
     * WIFI HTML
    */
});