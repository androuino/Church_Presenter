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
    var select = null;
    const header = $("#header");
    const container = $(".container");
    const mainControl = $("#mainControl");
    const bubbles = $("#bubbles");
    const tbodySongList = $("#tbodySongList", {
        template : {
            tr : {
                tagName : "tr",
                author : {
                    tagName : "td",
                    css : "author",
                },
                song : {
                    tagName : "td",
                    css : "song",
                },
                dateAdded : {
                    tagName : "td",
                    css : "dateAdded",
                },
                onclick : function(ev) {
                    const id = this.dataset.id;
                    select = id;
                    this.classList.add("active");
                    tbodySongList.items.forEach(row => {
                        if (row.dataset.id != id) {
                            row.classList.remove("active");
                            row.style.background = "";
                        } else {
                            row.style.background = "#ffee00";
                        }
                    });

                }
            }
        },
        items : [],
    });
    const wrapper = $(".wrapper", {
        onload : function(ev) {
            if (localStorage.getItem("login")) {
                container.show = false;
                bubbles.show = false;
                header.show = true;
                mainControl.show = true;
                // todo: get data from database
                for (var i = 0; i < 10; i++) {
                    tbodySongList.items.push({
                        dataset : { id : i },
                        author : { text : "Name " + i },
                        song : { text : "Song " + i },
                        dateAdded : { text : "Date " + i }
                    });
                }
            } else {
                header.show = false;
                mainControl.show = false;
                container.show = true
                bubbles.show = true;
            }
        }
    });
    const form = $(".form");
    const inputUsername = $("#inputUsername");
    const inputPassword = $("#inputPassword");
    const loginButton = $("#loginButton", {
        onclick : function(ev) {
            ev.preventDefault();
            const username = inputUsername.value;
            const password = inputPassword.value;
            if (username === "" || password === "") {
                $.failure("Username or Password cannot be empty!");
            } else {
                const data = {
                    user : username,
                    pass : password
                };
                $.post("/login.path", data, res => {
                    if (res.ok) {
                        form.show = false;
                        wrapper.classList.add("form-success");
                        localStorage.setItem("login", true);
                        location.reload();
                    } else {
                        $.failure("Error: ", res.message);
                    }
                }, true);
            }
        }
    });
    const navNew = $("#navNew", {
        onclick : function(ev) {
            $.alert("Creating...");
        }
    });

    const navEdit = $("#navEdit", {
        onclick : function(ev) {
            if (select === null) {
                $.failure("Please select a song to edit.");
            } else {
                $.alert("Editing...");
            }
        }
    });
    const navDelete = $("#navDelete", {
        onclick : function(ev) {
            if (select === null) {
                $.failure("Please select a song to delete.");
            } else {
                $.alert("Deleting...");
            }
        }
    });
    const navInfo = $("#navInfo");
    const navLogout = $("#navLogout", {
        onclick : function(ev) {
            $.confirm("Are you want to log out?", res => {
                if (res) {
                    $.get("/logout.path", res => {
                        if (res.ok) {
                            header.show = false;
                            mainControl.show = false;
                            container.show = true
                            bubbles.show = true;
                            localStorage.clear();
                        }
                    })
                }
            })
        }
    });
    const inputSearch = $("#inputSearch", {
        onkeypress : function(ev) {
            if (ev.key === "Enter") {
                if (this.value === "") {
                    $.failure("I did not get that!");
                } else {
                    $.alert("Searching...");
                }
            }
        }
    });
    const iconSearch = $("#iconSearch", {
        onclick : function(ev) {
            if (inputSearch.value === "") {
                $.failure("I did not get that!");
            } else {
                $.alert("Searching...");
            }
        }
    });
    tippy('#navNew', {
        content: "Create a new song",
        interactive: true,
        placement: 'top',
        animation: 'scale',
    });
    tippy('#navEdit', {
        content: "Edit an existing song",
        interactive: true,
        placement: 'top',
        animation: 'scale',
    });
    tippy('#navDelete', {
        content: "Delete a song",
        interactive: true,
        placement: 'top',
        animation: 'scale',
    });
    tippy('#navInfo', {
        allowHTML: true,
        content: '<p>Application: HWVCI Presenter</p>\n<p>Software version: 1.0</p>\n<p>Developer: Sem Moreno</p>\n<p>Website: <a href="https://josapedmoreno.xyz" target="_blank">josapedmoreno.xyz</a></p>',
        interactive: true,
        trigger: "click",
        onShow: async (instance) => {
            // call a function here
        }
    });
    tippy('#navLogout', {
        content: "Log out",
        interactive: true,
        placement: 'top',
        animation: 'scale',
    });
    tippy('#iconSearch', {
        content: "Search",
        interactive: true,
        placement: 'top',
        animation: 'scale',
    });
});