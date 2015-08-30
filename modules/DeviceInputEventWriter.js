"use strict";

var InputEvent = require('./InputEvent');
var adbBridge = require('./adbBridge');

var DeviceInputEventWriter = function (deviceId) {
  this.deviceId = deviceId;
  this.isReady = false;

  this.shellProcess = adbBridge.execAsync('shell', deviceId);
  this.shellProcess.stdout.on('data', function (data) {
    if (this.isReady || data.toString().substring(0, 5) !== 'shell') return;
    this.isReady = true;
    if (this.onReadyFunction) this.onReadyFunction();
  }.bind(this));
};

DeviceInputEventWriter.prototype.ready = function (onReadyFunction) {
  this.onReadyFunction = onReadyFunction;
  if (this.isReady) onReadyFunction();
  return this;
};

DeviceInputEventWriter.prototype.send = function (event) {
    var command = 'sendevent /dev/input/event' + event.type + ' ' + event.params.join(' ') + '\n';

    console.log(this.deviceId, '\t<', event);
    this.shellProcess.stdin.write(command);
};

module.exports = DeviceInputEventWriter;
