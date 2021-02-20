document.getElementById('pjtl-webclock-btn-12hr').addEventListener('click', function() {set_ampm(true);});
document.getElementById('pjtl-webclock-btn-24hr').addEventListener('click', function() {set_ampm(false);});
document.getElementById('pjtl-webclock-btn-techinfo').addEventListener('click', show_resync);
document.getElementById('pjtl-webclock-btn-resync').addEventListener('click', function() {
	get_time_from_server(true);
});
try_performance_now();
get_time_from_server(true);
tzselector_init();
read_iers_bulletin();
