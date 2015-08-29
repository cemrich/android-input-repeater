"use strict";

var InputEvent = require('./InputEvent');
var adbBridge = require('./adbBridge');

var InputEventSender = function (deviceId) {
  this.deviceId = deviceId;
  this.shellProcess = adbBridge.execAsync('shell', deviceId);
};

InputEventSender.prototype.send = function (event) {
    var command = "sendevent /dev/input/event" + event.type + " " + event.params.join(" ") + '\n';

    // console.log("sending to", this.deviceId, event);
    this.shellProcess.stdin.write(command);
};

module.exports = InputEventSender;
