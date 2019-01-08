//var ping 		= require("net-ping");

// var session = ping.createSession();
// var mensaje = "";

function doingPing() {
	$.ajax({
		type: 'GET',
		url: '/status',
		success: function(data) {
			$('#prueba').text(data.status);
		}
	});
	// session.pingHost("192.168.0.102", function(error, target){
	// 	if (error){
	// 		if(error instanceof ping.RequestTimedOutError)
	// 			console.log(target + ": Not alive");
	// 		else 
	// 			console.log(target + ": "+error.toString());
	// 	} else {
	// 		mensaje += target + ": Alive";
	// 		document.getElementById("prueba").innerHTML = mensaje;
	// 		console.log(mensaje);
	// 	}
	// });
}

setInterval(doingPing, 3000);