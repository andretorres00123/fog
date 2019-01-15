var mongoose = require('mongoose');

var logSchema = new mongoose.Schema({
  updated: { type: Date, default: new Date() },
  device: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Device'
    },
    name: String,
    ipAddress: String,
    latitud: String,
    longitud: String,
    status: Boolean
  }
});

module.exports = mongoose.model("Log", logSchema);
