var express       = require('express'),
  bodyParser      = require('body-parser'),
  mongoose        = require('mongoose'),
  app             = express(),
  methodOverride  = require('method-override'),
  Device          = require('./models/device'),
  passport        = require('passport'),
  LocalStrategy   = require('passport-local'),
  User            = require('./models/user'),
  Log             = require('./models/log'),
  ping            = require('net-ping');
const nodemailer  = require("nodemailer");

const port = 3502;
var session = ping.createSession();
var bandera = true;
var intervalsList = [];

mongoose.connect(
  'mongodb://localhost/net_app_v1',
  { useNewUrlParser: true }
);
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(methodOverride("_method"));

//Passport configuration
app.use(require('express-session')({
  secret: 'Computacion en la niebla',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

async function main(log, mensaje){

  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  let account = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'caperucita@hotmail.com', // generated ethereal user
      pass: '************' // generated ethereal password
    }
  });

  // setup email data with unicode symbols
  let mailOptions = {
    from: 'torresandre06@hotmail.com', // sender address
    to: "aectorres@udlanet.ec", // list of receivers
    subject: `Log Device:  ${log.device.name}`, // Subject line
    text: "Mijo te voy a dar de comer jajajjajajaja", // plain text body
    html: `<h1>IP: ${log.device.ipAddress}</h1>
            <h2>Mensaje: ${mensaje}</h2>
            <h2>Nombre del Dispositivo: ${log.device.name}</h2>
           <h2>Estado: ${log.device.status? 'Activo' : 'Inactivo'}</h2>
           <h2>Latitud: ${log.device.latitud}</h2>
           <h2>Longitud: ${log.device.longitud}</h2>` // html body
  };

  // send mail with defined transport object
  let info = await transporter.sendMail(mailOptions)

  console.log("Message sent: %s", info.messageId);
  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

function doingPing(ipAddress, id) {
  //Se colo la direccion IP a la que se quiere hacer ping
  session.pingHost(ipAddress, function(error, target) {
    if (error) {
        console.log(target + ': Not alive');
        Device.findById(id, function(err, foundDevice){
          if (!foundDevice){
            return null;
          }
          if(foundDevice.status){
            var name = foundDevice.name;
            var ip = foundDevice.ipAddress;
            var latitud = foundDevice.latitud;
            var longitud = foundDevice.longitud;
            var status = false;
            var nuevo = {
              device: {
                name: name,
                ipAddress: ip,
                latitud: latitud,
                longitud: longitud,
              },
              status: status
            };
            Device.findByIdAndUpdate(id, nuevo, function(err, updatedDevice){
              if(err){
                console.log('Error', err);
              } else {
                var newLog = {
                  device: {
                    id: updatedDevice.id,
                    name: updatedDevice.name,
                    ipAddress: updatedDevice.ipAddress,
                    image: updatedDevice.image,
                    latitud: updatedDevice.latitud,
                    longitud: updatedDevice.longitud,
                    status: false
                  },
                  updated: new Date(),
                };
                Log.create(newLog, function(err, newlyLog) {
                  if(err){
                    console.log(err);
                  } else {
                      main(newLog, 'El dispositivo se ha desconectado').catch(console.error);
                      //  redirect back to campgrounds page
                      console.log(newlyLog);
                      console.log(`El dispositivo ${target} se ha desconectado`);
                  }
                });
              }
            });
            }     
          });
      } else {
        Device.findById(id, function(err, foundDevice){
          if (!foundDevice){
            return null;
          }
          if (!foundDevice.status){
            var name = foundDevice.name;
              var ip = foundDevice.ipAddress;
              var latitud = foundDevice.latitud;
              var longitud = foundDevice.longitud;
              var status = true;
              var nuevo = {
                device: {
                  name: name,
                  ipAddress: ip,
                  latitud: latitud,
                  longitud: longitud,
                },
                status: status
              };
            Device.findByIdAndUpdate(id, nuevo, function(err, updatedDevice){
              if(err){
                console.log('Error', err);
              } else {
                var newLog = {
                  device: {
                    id: updatedDevice.id,
                    name: updatedDevice.name,
                    ipAddress: updatedDevice.ipAddress,
                    image: updatedDevice.image,
                    latitud: updatedDevice.latitud,
                    longitud: updatedDevice.longitud,
                    status: true
                  },
                  updated: new Date(),
                };
                Log.create(newLog, function(err, newlyLog) {
                  if(err){
                    console.log(err);
                  } else {
                      main(newLog, 'El dispositivo se ha conectado').catch(console.error);
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
  Device.find({}, function(err, allDevices) {
    if(bandera) {
      allDevices.forEach(function(device) {
        intervalsList.push({
          'id': device.id,
          'idInterval': setInterval(doingPing, 3000, device.ipAddress ,device.id)
        });
      });
      bandera = false;
    }
    // allDevices.forEach(function(device) {
    //   setInterval(doingPing, 3000, device.ipAddress ,device.id);
    // });
    if (err) {
      console.log(err);
    } else {
      res.render('devices/index', { devices: allDevices });
    }
  });
});

//SHOW -ALL TARGETS IN THE MAPs
app.get('/map', isLoggedIn, function(req, res){
  Device.find({}, function(err, allDevices){
    if (err) {
      console.log(err);
    } else {
      res.render('map/index', {devices: allDevices});
    }
  });
});

//SHOW- Muestra todos los dispositivos
app.get('/devices', function(req, res) {
  Device.find({}, function(err, allDevices) {
    if(bandera) {
      allDevices.forEach(function(device) {
        intervalsList.push({
          'id': device.id,
          'idInterval': setInterval(doingPing, 3000, device.ipAddress ,device.id)
        });
      });
      bandera = false;
    }
    if (err) {
      console.log(err);
    } else {
      res.render('devices/index', { devices: allDevices, currentUser: req.user});
    }
  });
});

//Muestra los LOGs de los dispositivos
app.get('/devices/logs', isLoggedIn, function(req, res) {
  Log.find({}, function(err, allLogs){
    if (err) {
      console.log(err);
    } else {
      res.render('devices/logs', { logs: allLogs });
    }
  });
});

//Abre la forma para agregar un nuevo dispositivo
app.get('/devices/new', isLoggedIn, function(req, res) {
  res.render('devices/new');
});

//SHOW - muestra detalle del dispositivo
app.get('/devices/:id', isLoggedIn, function(req, res){
  Device.findById(req.params.id, function(err, foundDevice) {
    if (err) {
      console.log("error en el detalle");
    } else {
      console.log(foundDevice);
      res.render('devices/show', {device: foundDevice});
    }
  });
});

//DELETE - eliminar un dispositivo
app.delete('/devices/:id', function(req, res) {
  var eliminado = intervalsList.find(function(elem) {
    return elem.id == req.params.id;
  });
  console.log(eliminado);
  clearInterval(eliminado.idInterval);
  Device.findOneAndRemove(req.params.id, function(err) {
    if (err) {
      res.redirect('/devices');
    } else {
      res.redirect('/devices');
    }
    
  })
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
      console.log("err en el create");
    } else {
      console.log(newlyCreated);
      intervalsList.push({
        'id': newlyCreated.id,
        'idInterval': setInterval(doingPing, 3000, newlyCreated.ipAddress ,newlyCreated.id)
      });
      res.redirect('/devices');
    }
  });
});


// Device.remove({}, function(err) {
//   if (err) {
//     console.log('ERROR en la DB');
//   } else {
//     console.log();
//   }
// });
// Log.remove({}, function(err) {
//   if (err) {
//     console.log('ERROR en la DB');
//   } else {
//     console.log();
//   }
// });

// Log.find({}, function(err, all) {
//   if (err) {
//     console.log('ERROR en la DB');
//   } else {
//     console.log(all);
//   }
// });

app.get('/status', function(req, res) {
  Device.find({}, (err, devices) => {
    res.json(devices);
  });
});

//  ========================
//  AUTH ROUTES
// ======================

//  show register f
app.get('/register', function(req, res) {
  res.render('register');
});
//handle sign up logic
app.post('/register', function(req, res) {
  var newUser = new User({username: req.body.username});
  User.register(newUser, req.body.password, function(err, user) {
    if(err){
      console.log(err);
      return res.render("register");
    }
    passport.authenticate('local')(req, res, function() {
      res.redirect('/devices');
    });
  });
});

//   show login form
app.get('/login', function(req, res) {
  res.render('login');
});
//  handling login logic
app.post('/login', passport.authenticate("local",
  {
    successRedirect: "/devices",
    failureRedirect: "/login"
  }), function(req, res) {
  
});

// logic route
app.get('/logout', function(req, res) {
  req.logOut();
  res.redirect('/devices');
});

function isLoggedIn(req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};


app.listen(port, function(err) {
  if (err) {
    return console.log('Something bad happened', err);
  }
  console.log(`Serve is listening on ${port}`);
});
