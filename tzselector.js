var tzList = [
	/* # replaced with "Daylight " / "Standard " and @ replaced with "Summer " / empty string */
	{name: "Aleutian #Time", dst: "us", stdo: -9, dsto: -8},
	{name: "Pacific #Time", dst: "us", stdo: -8, dsto: -7},
	{name: "Mountain #Time", dst: "us", stdo: -7, dsto: -6},
	{name: "Central #Time (US/Canada)", dst: "us", stdo: -6, dsto: -5},
	{name: "Eastern #Time (US/Canada)", dst: "us", stdo: -5, dsto: -4},
	{name: "Atlantic #Time", dst: "us", stdo: -4, dsto: -3},
	{name: "Newfoundland #Time", dst: "us", stdo: -3.5, dsto: -2.5},
	{name: "Western European @Time", dst: "eu", stdo: 0, dsto: 1},
	{name: "Central European @Time", dst: "eu", stdo: 1, dsto: 2},
	{name: "Eastern European @Time", dst: "eu", stdo: 2, dsto: 3},
	/* Technically not required but those looking for AWST may be surprised
	 * that it's not located before ACST */
	{name: "Australian Western #Time", dst: "none", stdo: 8},
	{name: "Australian Central #Time", dst: "au", stdo: 9.5, dsto: 10.5},
	{name: "Australian Eastern #Time", dst: "au", stdo: 10, dsto: 11},
	/* Quarter-hour UTC offsets not otherwise selectable using the selector */
	{name: "Nepal Standard Time", dst: "none", stdo: 5.75},
	{name: "Australian Central Western Time", dst: "none", stdo: 8.75},
	{name: "Chatham Standard Time", dst: "au", stdo: 12.75, dsto: 13.75}
];
function tzselector_init() {
	var iHtml = '<option value="-9999">Local Time</option>';
	for (var i=-12; i<=14; i += 0.5) {
		iHtml += '<option value="' + i + '">UTC' + (i >= 0 ? "+" : "") + i + '</option>';
	}
	var d = document.getElementById("tzselector");
	d.innerHTML = iHtml;
	d.onchange = function () {
		var v = d.options[d.selectedIndex].value;
		window.location.hash = "_________U" + v;
		timeZone = parseFloat(v, 10);
	};
}