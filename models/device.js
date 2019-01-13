var mongoose = require("mongoose");

var deviceSchema = new mongoose.Schema({
    name: String,
    ipAddress: String,
    image: String,
    latitud: String,
    longitud: String,
    status: Boolean,
    logs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "log"
        }
    ]
});

module.exports = mongoose.model("Device", deviceSchema);