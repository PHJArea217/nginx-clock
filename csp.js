document.getElementById('pjtl-webclock-btn-12hr').addEventListener('click', function() {set_ampm(true);});
document.getElementById('pjtl-webclock-btn-24hr').addEventListener('click', function() {set_ampm(false);});
document.getElementById('pjtl-webclock-btn-techinfo').addEventListener('click', show_resync);
document.getElementById('pjtl-webclock-btn-resync').addEventListener('click', function() {
	get_time_from_server(true);
});
document.getElementById('ipAddr-show-btn').addEventListener('click', function(e) {
	document.getElementById('ipAddr-hide').style.display = 'inline-block';
	document.getElementById('ipAddr-show').style.display = 'none';
	e.preventDefault();
});
try_performance_now();
get_time_from_server(true);
tzselector_init();
read_iers_bulletin();
