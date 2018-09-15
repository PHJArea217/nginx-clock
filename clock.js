
var xhrObj = null;
/* syncAt based on local time */
var programState = {"startTime": 0, "timerObj": 0, "usePNow": true, "timeDiff": 0, "syncCtr": 0, "elapsed": 0, syncActive: false};
var allowUpdate = true;
var server_time = null;
var timeZone = -9999;
/* show/hide the "resynchronize now" link */
function showResynchronize(t) {
	document.getElementById("resync_now_button").style.display = t ? "" : "none";
}
/* determine whether window.performance.now is available */
function try_performance_now() {
	var testVal = -1234567;
	try {
		testVal = window.performance.now();
	} catch (e) {
	}
	if ((testVal == -1234567) || (testVal === null)) {
		console.log("using realtime clock");
		programState.usePNow = false;
	}
}
/* determine if window.performance.now and new date.gettime drift by more than 1 s */
function get_time_diff(save) {
	if (!programState.usePNow) return false;
	var d = window.performance.now() - new Date().getTime();
	if (save) {
		programState.timeDiff = d;
		return d;
	} else {
		return Math.abs(programState.timeDiff - d) > 1000;
	}
}
function get_current_time() {
	if (programState.usePNow) {
		return window.performance.now();
	} else {
		return new Date().getTime();
	}
}
function set_display(f, v) {
	document.getElementById(f).innerHTML = v;
}
function get_time_from_server_part2() {
	if (xhrObj.readyState != 4) return;
	xhrObj.onreadystatechange = null;
	if (xhrObj.status != 200) {
		set_display("status", "An unexpected error (" + xhrObj.status + ") has occurred.");
		set_display("status2", "Click below to resynchronize again");
		setTimeout(() => showResynchronize(true), 1000);
		return;
	}
	if (programState.timerObj != 0) clearTimeout(programState.timerObj);
	var localTime = get_current_time();
	/* half rtt */
	var latency = (localTime - programState.startTime) / 2;
	var remoteTime = JSON.parse(xhrObj.responseText).time * 1000;
	/* when local time is lbase, remote time is rbase */
	server_time = {"lbase": localTime, "rbase": remoteTime + latency};
	set_display("status", "Latency: " + Math.round(latency) + " ms, Correction: " + Math.round(server_time.rbase - new Date().getTime()) + " ms");
	get_time_diff(true);
	programState.syncCtr = 1000;
	programState.syncActive = true;
	/* display button quickly if latency is high and the time is therefore inaccurate */
	setTimeout(() => showResynchronize(true), (latency > 300) ? 100 : 5000);
	display_time();
}
function get_time_from_server(do_clear) {
	if (do_clear) {
		/* stop clock, reset zero */
		if (programState.timerObj != 0) clearTimeout(programState.timerObj);
		programState.timerObj = 0;
		set_display("time", "0000-00-00<br>00:00:00");
	}
	showResynchronize(false); /* hide the button to prevent repeated clicking */
	programState.syncActive = false;
	set_display("status2", "Resynchronizing now.");
	if (xhrObj !== null) xhrObj.abort();
	/* create request and record start time */
	xhrObj = new XMLHttpRequest();
	programState.startTime = get_current_time();
	xhrObj.onreadystatechange = get_time_from_server_part2;
	xhrObj.open("GET", (isDemo ? "https://us-central1-webclockbackend.cloudfunctions.net/insvc-time" : "/insvc/time") + "?random=" + Math.random(), true);
	xhrObj.send(null);
}
function display_time() {
	var newltime = get_current_time();
	var incr = newltime - server_time.lbase;
	/* add elapsed time to remote time since request */
	var newrtime = new Date(server_time.rbase + incr);
	var timeTillNextSecond = 1000 - newrtime.getUTCMilliseconds();
	newrtime.setUTCMilliseconds(0);
	set_display("time", new Date(newrtime.getTime() + ((timeZone == -9999) ? (newrtime.getTimezoneOffset() * -60000) : (timeZone * 3600000))).toISOString().replace(/T/, "<br>").replace(/\....Z/, ""));
	programState.timerObj = setTimeout(display_time, timeTillNextSecond);
	/* display the utc offset */
	/* = newrtime.getTimezoneOffset() / -60.0; */
	/* sync */
	if (programState.syncActive) {
		if (get_time_diff(false)) {
			programState.syncActive = false;
			set_display("status2", "Local clock drifted, resynchronizing.");
			setTimeout(() => get_time_from_server(false), 2000);
		} else if (programState.syncCtr <= 0) {
			get_time_from_server(false);
		} else {
			set_display("status2", "Resynchronizing in " + --programState.syncCtr + " seconds.");
		}
	}
}
