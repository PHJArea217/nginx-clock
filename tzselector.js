var tzList = {
	/* # replaced with "Daylight " / "Standard " and @ replaced with "Summer " / empty string */
	A0: {name: "Alaska #Time", dst: "us", stdo: -9},
	A1: {name: "Pacific #Time", dst: "us", stdo: -8},
	A2: {name: "Mountain #Time", dst: "us", stdo: -7},
	A3: {name: "Central #Time (US/Canada)", dst: "us", stdo: -6},
	A4: {name: "Eastern #Time (US/Canada)", dst: "us", stdo: -5},
	A5: {name: "Atlantic #Time", dst: "us", stdo: -4},
	A6: {name: "Newfoundland #Time", dst: "us", stdo: -3.5},
	A7: {name: "Western European @Time", dst: "eu", stdo: 0},
	A8: {name: "Central European @Time", dst: "eu", stdo: 1},
	A9: {name: "Eastern European @Time", dst: "eu", stdo: 2},
	/* Technically not required but those looking for AWST may be surprised
	 * that it's not located before ACST */
	A10: {name: "Australian Western #Time", dst: "none", stdo: 8},
	A11: {name: "Australian Central #Time", dst: "au", stdo: 9.5},
	A12: {name: "Australian Eastern #Time", dst: "au", stdo: 10},
	/* Quarter-hour UTC offsets not otherwise selectable using the selector */
	A13: {name: "Nepal Standard Time", dst: "none", stdo: 5.75},
	A14: {name: "Australian Central Western Time", dst: "none", stdo: 8.75},
	A15: {name: "Chatham Standard Time", dst: "au", stdo: 12.75}
};
function tzselector_init() {
	/* Restore state of current time zone. */
	var currTz = String(window.location.hash.substring(10));
	
	var d = document.getElementById("tzselector");
	var optionElement = document.createElement('option');
	optionElement.value = "U-9999";
	optionElement.text = "Local Time";
	d.add(optionElement);
	for (var i=-12; i<=14; i += 0.5) {
		optionElement = document.createElement('option');
		optionElement.value = 'U' + i;
		optionElement.text = getUtcOffsetS(i);
		if (currTz === optionElement.value) {
			timeZone = currTz;
			optionElement.selected = true;
		}
		d.add(optionElement);
	}
	for (var key in tzList) {
		optionElement = document.createElement('option');
		optionElement.value = 'X' + key;
		optionElement.text = tzList[key].name.replace(/[#@]/, '');
		if (currTz === optionElement.value) {
			timeZone = currTz;
			optionElement.selected = true;
		}
		d.add(optionElement);
	}
	d.onchange = function () {
		var v = d.options[d.selectedIndex].value;
		window.location.hash = "_________" + v;
		timeZone = String(v);
	};
}
function getUtcOffsetS(offset) {
	offset = Number(offset);
	return "UTC" + (offset >= 0 ? '+' : '') + offset;
}
function convertDSTName(name, isDst) {
	let s = String(name);
	if (s.indexOf("<") >= 0) {
		return '[WARNING: POSSIBLE XSS ATTACK!]';
	}
	return s.replace(/@/, isDst ? 'Summer ' : '').replace(/#/, isDst ? 'Daylight ' : 'Standard ');
}
function getDST(origOffset, type, date, callback) {
	if (type === null || !this.hasOwnProperty('dst')) {
		callback('N/A', 0, 'N/A', -1, false);
		return origOffset;
	}
	var dstData = dst[type];
	if (dstData == undefined) {
		callback('N/A', 0, 'N/A', 0, false);
		return origOffset;
	}
	var key = (dstData.useUTC ? date : new Date(date.getTime() + origOffset)).toISOString();
	var timeList = dstData.times;
	var lastOffset = 0;
	var lastTime = "";
	var nextOffset = 0;
	var nextTime = "";
	for (var t in timeList) {
		if (!timeList.hasOwnProperty(t)) break;
		if (key >= t) {
			lastTime = t;
			lastOffset = timeList[t];
		} else {
			nextTime = t;
			nextOffset = timeList[t];
			break;
		}
	}
	if (callback != undefined && callback !== null) {
		callback(lastTime, lastOffset, nextTime, nextOffset, dstData.useUTC);
	}
	return lastOffset * 3600000 + origOffset;
}
