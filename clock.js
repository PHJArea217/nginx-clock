
var xhrObj = null;
/* syncAt based on local time */
var programState = {"startTime": 0, "timerObj": 0, "usePNow": true, "timeDiff": 0, "syncCtr": 0, "elapsed": 0, syncActive: false};
var allowUpdate = true;
var useAMPM = false;
var server_time = null;
var timeZone = "U-9999";
/* show/hide the "resynchronize now" link */
function showResynchronize(t) {
	document.getElementById("resync_now_button").style.display = t ? "" : "none";
}
function show_resync() {
	document.getElementById("resync_control").style.display = "";
	document.getElementById("resync_control_show_button").style.display = "none";
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
	if (xhrObj.readyState !== 4) return;
	xhrObj.onreadystatechange = null;
	if (xhrObj.status !== 200) {
		set_display("status", "An unexpected error (" + xhrObj.status + ") has occurred.");
		set_display("status2", "Click below to resynchronize again");
		setTimeout(() => showResynchronize(true), 1000);
		return;
	}
	if (programState.timerObj != 0) clearTimeout(programState.timerObj);
	var localTime = get_current_time();
	/* half rtt */
	var latency = (localTime - programState.startTime) / 2;
	/* latency > 500 ms usually due to stalling server */
	if (latency >= 500) latency = 500;
	var resultJson = JSON.parse(xhrObj.responseText);
	var remoteTime = resultJson.time * 1000;
	/* when local time is lbase, remote time is rbase */
	server_time = {"lbase": localTime, "rbase": remoteTime + latency};
	set_display("status", "Latency: " + Math.round(latency) + " ms, Correction: " + Math.round(server_time.rbase - new Date().getTime()) + " ms");
	set_display("ipaddr", resultJson.remoteIP);
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
		if (programState.timerObj !== 0) clearTimeout(programState.timerObj);
		programState.timerObj = 0;
		set_display("time", "00:00:00");
		set_display("date", "&nbsp;");
	}
	showResynchronize(false); /* hide the button to prevent repeated clicking */
	programState.syncActive = false;
	set_display("status2", "Resynchronizing now.");
	if (xhrObj !== null) xhrObj.abort();
	/* create request and record start time */
	xhrObj = new XMLHttpRequest();
	programState.startTime = get_current_time();
	xhrObj.onreadystatechange = get_time_from_server_part2;
	xhrObj.open("GET", (isDemo ? "https://apps-vm2.peterjin.org/time" : "/insvc/time") + "?random=" + Math.random(), true);
	xhrObj.send(null);
}
function set_ampm(ampm) {
	useAMPM = ampm;
}
function displayTimeToString(time, useAMPM) {
	var ampm = '';
	var h = time.getUTCHours();
	if (useAMPM) {
		ampm = h >= 12 ? 'p.m.' : 'a.m.';
		h = h % 12;
		if (h === 0) h = 12;
	}
	var p = m => m < 10 ? '0' : '';
	var m = time.getUTCMinutes();
	var s = time.getUTCSeconds();
	return `${p(h)}${h}:${p(m)}${m}:${p(s)}${s} ${ampm}`;
}
function displayDateToString(time) {
	var daysOfTheWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	var p = m => m < 10 ? '0' : '';
	var y = time.getUTCFullYear();
	var m = time.getUTCMonth() + 1;
	var d = time.getUTCDate();
	return `${daysOfTheWeek[time.getUTCDay()]} ${y}-${p(m)}${m}-${p(d)}${d}`;
}
function display_time() {
	var newltime = get_current_time();
	var incr = newltime - server_time.lbase;
	/* add elapsed time to remote time since request */
	var newrtime = new Date(server_time.rbase + incr);
	var timeTillNextSecond = 1000 - newrtime.getUTCMilliseconds();
	newrtime.setUTCMilliseconds(0);
	/* Calculate the time zone offset */
	var ofs = 0;
	if (timeZone.match(/^U.*/)) {
		/* UTC+-N including localtime */
		var offset = parseFloat(timeZone.substring(1), 10);
		if (offset === null || offset === -9999) {
			ofs = newrtime.getTimezoneOffset() * -60000;
		} else {
			ofs = offset * 3600000;
		}
		set_display("tzInfo", getUtcOffsetS(ofs / 3600000) + '<br />&nbsp;');
	} else if (timeZone.match(/^X.*/)) {
		/* Predefined time zone */
		var key = timeZone.substring(1);
		var data = tzList[key];
		var callback = function(tTime, tOff, nTime, nOff, useUTC) {
			var nTimeAdjust = new Date(nTime + "Z");
			if (!useUTC) nTimeAdjust = new Date(nTimeAdjust.getTime() + 3600000 * tOff);
			var nTimeStr = displayDateToString(nTimeAdjust) + " " + displayTimeToString(nTimeAdjust, useAMPM);
			var nextDST = nTime === 'N/A' ? '&nbsp;' : `Next DST: ${nOff !== 0 ? 'begins' : 'ends'} at ${nTimeStr + (useUTC ? ' (UTC)' : '')}`;
			set_display("tzInfo", `
			${convertDSTName(data.name, tOff !== 0)} (${getUtcOffsetS(data.stdo + tOff)})<br>&nbsp;
			${nextDST}`);
		};
		if (data !== undefined && data !== null) {
			ofs = Number(getDST(data.stdo * 3600000, data.dst, newrtime, callback));
		}
	}
	var displayTime = new Date(newrtime.getTime() + ofs);
	set_display("time", displayTimeToString(displayTime, useAMPM));
	set_display("date", displayDateToString(displayTime));
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
