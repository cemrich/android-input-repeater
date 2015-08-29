"use strict";

var child_process = require('child_process');
var InputEvent = require('./InputEvent');

var ADB_PATH = 'adb';
var EVENT_STRING_REGEXP = /^\/dev\/input\/event(\d): (\d{4}) (\d{4}) (\d{8})$/mg;

var IntputEventCapturer = function (deviceId) {
  var capturer = this;

  this.deviceId = deviceId;
  console.log('IntputEventCapturer created', deviceId);

  var command = ADB_PATH + ' -s ' + deviceId + ' shell getevent';
  var child = this.spawn(command);
  child.stdout.on('data', function (data) {
    var eventStr = data.toString();
    capturer.parseEventString(eventStr);
  });
  child.stdout.on('error', function (error) {
    capturer.onError(error);
  });
  child.stdout.on('end', function (error) {
    capturer.onError(error);
  });
  child.stdout.on('close', function (error) {
    capturer.onError(error);
  });
  child.stderr.on('data', function (data) {
    capturer.onError(data.toString());
  });
};

IntputEventCapturer.prototype.parseEventString = function (eventStr) {
  function hexToDez(hex) {
    return parseInt(hex, 16);
  }

  var match;
  while ((match = EVENT_STRING_REGEXP.exec(eventStr))) {
    var inputEvent = new InputEvent(match[1], match.slice(2, 5).map(hexToDez));
    this.onInputEvent(inputEvent);
  }
};

IntputEventCapturer.prototype.spawn = function (command) {
    // TODO: this only works on windows machines, fix later
    return child_process.spawn('cmd', ['/c', command], {env: process.env});
};

IntputEventCapturer.prototype.onError = function (error) {
  console.error('IntputEventCapturer error', error, this.deviceId);
};

IntputEventCapturer.prototype.onInputEvent = function (event) {
  console.log('IntputEventCapturer inputEvent', event, this.deviceId);
};

module.exports = IntputEventCapturer;
