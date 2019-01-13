var allDevices = [];


function doingPing() {
	$.ajax({
		type: 'GET',
		url: '/status',
		success: function(data) {
			data.map((device) => {
				$(`#${device.name}`).attr('btn-danger', 'btn-success');
			});
		}
	});
}

setInterval(doingPing, 3000);