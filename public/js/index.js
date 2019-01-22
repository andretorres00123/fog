function doingPing() {
	$.ajax({
		type: 'GET',
		url: '/status',
		success: function(data) {
			data.map((device) => {
				$(`#${device.name}`).toggleClass('btn-danger', !device.status);
			});
		}
	});
}

setInterval(doingPing, 3000);