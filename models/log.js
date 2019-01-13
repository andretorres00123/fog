var mongoose = require('mongoose');

var logSchema = new mongoose.Schema({
  updated: { type: Date, default: Date.now },
  device: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Device'
    },
    name: String,
    ipAddress: String,
    image: String,
    latitud: String,
    longitud: String,
    status: Boolean
  }
});

module.exports = mongoose.model("Log", logSchema);
