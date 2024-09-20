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
    const evtSource = new EventSource('/events');
    const ssid = $("#ssid");
    const ip = $("#ip");
    const wifiSsidList = $("#wifiSsidList", {
        template : {
            ssidName : {
                tagName : "option",
                id : "ssidName",
            }
        },
        items : []
    });
    const wifiPassword = $("#wifiPassword");
    $("#main", {
        onload : function(ev) {
            $.get("/getssid", res => {
                wifiSsidList.items.clear();
                if (res.ok) {
                    res.data.forEach(item => {
                        wifiSsidList.items.push({
                            text : item,
                        });
                    });
                } else {
                    console.debug("The response for getting Wifi SSIDs is empty!");
                }
            }, true);
        }
    });
    const buttonConnectWifi = $("#buttonConnectWifi", {
        onclick : function(ev) {
            if (wifiSsidList.value === "") {
                $.failure("Please choose a wifi to connect to.");
            } else if (wifiPassword.value === "") {
                $.failure("Please provide the wifi password.");
            } else {
                const data = {
                    ssid : wifiSsidList.value,
                    pass : wifiPassword.value
                }
                $.post("/wificonnect", data, res => {
                    if (res.ok) {
                        $.success("Connected to WiFi.");
                    } else {
                        $.failure("Failed to connect to wifi.");
                    }
                }, true);
            }
        }
    });
    const showPassword = $("#showPassword", {
        onclick : function(ev) {
            if (ev.target.text === "visibility_off") {
                this.text = "visibility";
                wifiPassword.type = "text";
            } else {
                this.text = "visibility_off";
                wifiPassword.type = "password";
            }
        }
    });
    const buttonDisconnectWifi = $("#buttonDisconnectWifi", {
        onclick : function(ev) {
            $.confirm("Disconnect will also disable your control", res => {
                if (res) {
                    $.post("/wifidisconnect", res => {
                        if (res.ok) {
                            $.success("WiFi disconnected.");
                        }
                    }, true);
                }
            });
        }
    });
    evtSource.addEventListener("wifi", function (ev) {
        var data = JSON.parse(JSON.parse(ev.data));
        if (data.status === "connected") {
            ssid.text = data.ssid;
            ip.text = data.ip;
        } else {
            ssid.text = "Disconnected";
            ip.text = "";
        }
    });
});