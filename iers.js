var IERS_BULCD_JSON = "iers-bulcd.json";
var iersXHR = null;
function read_iers_bulletin() {
	iersXHR = new XMLHttpRequest();
	iersXHR.onreadystatechange = iers_bulletin_callback;
	iersXHR.open("GET", IERS_BULCD_JSON, true);
	iersXHR.send();
}

function iers_bulletin_callback() {
	if (iersXHR.readyState != 4) {
		return;
	}
	if (iersXHR.status != 200) {
		return;
	}
	var displayStr = "";
	var iersData = JSON.parse(iersXHR.responseText);
	var bulcData = iersData.bulc;
	var i = 0;
	for (; i<bulcData.length; i++) {
		displayStr += "TAI&minus;UTC = " + bulcData[i].taiutc + " s since " + new Date(bulcData[i].from * 1000).toUTCString() + "<br />";
	}
	var buldData = iersData.buld;
	var currentTime = new Date().getTime();
	var useIndex = 0;
	if (((buldData[0].from * 1000) > currentTime) && (buldData[1].from !== 0)) {
		useIndex = 1;
	}
	displayStr += "DUT1 = " + buldData[useIndex].dut1 + " s since " + new Date(buldData[useIndex].from * 1000).toUTCString() + "<br />";
	document.getElementById("iersbulcd").innerHTML = displayStr;
}