const evtSource = new EventSource('/events');
evtSource.addEventListener("lyrics", function (ev) {
    console.log(JSON.parse(ev.data))
});
