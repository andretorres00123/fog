var express		= require("express"),
	bodyParser	=require("body-parser"),
	app			= express(),
	ping 		= require("net-ping");

const port	   = 3000;
var session = ping.createSession();
var mensaje = 0;

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));



function doingPing() {
	session.pingHost("192.168.0.102", function(error, target){
		if (error){
			if(error instanceof ping.RequestTimedOutError)
				console.log(target + ": Not alive");
			else 
				console.log(target + ": "+error.toString());
		} else {
			mensaje++;
		}
	});
}

setInterval(doingPing, 3000);

//INdex de toda la aplicacion
app.get("/", function(req, res){
	res.render("devices/index");
});

//Ruta para crear y guardar los dispositivos en la DB
app.post("/devices", function(req, res){
	res.send("Lo lograste PAPA");
});

//Abre la forma para agregar un nuevo dispositivo
app.get("/devices/new", function(req, res){
	res.render("devices/new");
});



//API para acceder al status de todos los dispositivos
app.get('/status', function(req, res){

	res.json({
		status: mensaje
	});
});



app.listen(port , function(err){
	if(err) {
		return console.log('Something bad happened', err);
	}
	console.log('Serve is listening on ${port}');
});