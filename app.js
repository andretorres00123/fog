var express = require('express'),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  app = express(),
  Device = require('./models/device'),
  Log = require('./models/log'),
  ping = require('net-ping');

const port = 3502;
var session = ping.createSession();
var mensaje = 0;

mongoose.connect(
  'mongodb://localhost/net_app_v1',
  { useNewUrlParser: true }
);
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

function doingPing(ipAddress, id) {
  //Se colo la direccion IP a la que se quiere hacer ping
  session.pingHost(ipAddress, function(error, target) {
    if (error) {
      if (error instanceof ping.RequestTimedOutError) {
        console.log(target + ': Not alive');
        Device.findById(id, function(err, foundDevice){
          if(foundDevice.status){
            foundDevice.status = false;
            Device.findByIdAndUpdate(id, foundDevice, function(err, updatedDevice){
              if(err){
                console.log('Error', err);
              } else {
                var newLog = {
                  device: {
                    id: foundDevice.id,
                    name: updatedDevice.name,
                    ipAddress: updatedDevice.ipAddress,
                    image: updatedDevice.image,
                    latitud: updatedDevice.latitud,
                    longitud: updatedDevice.longitud,
                    status: updatedDevice.status
                  },
                  updated: new Date(),
                };
                Log.create(newLog, function(err, newlyLog) {
                  if(err){
                    console.log(err);
                  } else {
                      //  redirect back to campgrounds page
                      console.log(newlyLog);
                      console.log(`El dispositivo ${target} se ha desconectado`);
                  }
                });
              }
            });
          }   
        });
      } else console.log(target + ': ' + error.toString());
    } else {
      // console.log(mensaje++);
      Device.findById(id, function(err, foundDevice){
        if (!foundDevice.status){
          foundDevice.status = true;
          Device.findByIdAndUpdate(id, foundDevice, function(err, updatedDevice){
            if(err){
              console.log('Error', err);
            } else {
              var newLog = {
                name: updatedDevice.name,
                ipAddress: updatedDevice.ipAddress,
                latitud: updatedDevice.latitud,
                longitud: updatedDevice.longitud,
                status: updatedDevice.status
              };
              Log.create(newLog, function(err, newlyLog) {
                if(err){
                  console.log(err);
                } else {
                    //  redirect back to campgrounds page
                    console.log(newlyLog);
                    console.log(`El dispositivo ${target} se ha conectado`);
                }
              });
            }
          });
        } else {
          console.log(`Ping ${target}`);
        }
      });
    }
  });
};

//INdex de toda la aplicacion
app.get('/', function(req, res) {
  res.render('devices/index');
});

//SHOW- Muestra todos los dispositivos
app.get('/devices', function(req, res) {
  Device.find({}, function(err, allDevices) {
    if (err) {
      console.log(err);
    } else {
      res.render('devices/index', { devices: allDevices });
    }
  });
});

//Ruta para crear y guardar los dispositivos en la DB
app.post('/devices', function(req, res) {
  var newDevice = {
    name: req.body.name,
    ipAddress: req.body.ip,
    image: req.body.image,
    latitud: req.body.latitud,
    longitud: req.body.longitud,
    status: true
  };

  //Guardar en la base de datos
  Device.create(newDevice, function(err, newlyCreated) {
    if (err) {
      console.log(err);
    } else {
      console.log(newlyCreated);
      setInterval(doingPing, 3000, newlyCreated.ipAddress ,newlyCreated.id);
      res.redirect('/devices');
    }
  });
});

//Abre la forma para agregar un nuevo dispositivo
app.get('/devices/new', function(req, res) {
  res.render('devices/new');
});

Device.remove({}, function(err) {
  if (err) {
    console.log('ERROR en la DB');
  } else {
    console.log();
  }
});
Log.remove({}, function(err) {
  if (err) {
    console.log('ERROR en la DB');
  } else {
    console.log();
  }
});

app.get('/status', function(req, res) {
  Device.find({}, (err, devices) => {
    res.json(devices);
  });
});

app.listen(port, function(err) {
  if (err) {
    return console.log('Something bad happened', err);
  }
  console.log(`Serve is listening on ${port}`);
});
