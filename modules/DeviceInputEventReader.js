"use strict";

var InputEvent = require('./InputEvent');
var adbBridge = require('./adbBridge');

var EVENT_STRING_REGEXP = /^\/dev\/input\/event(\d): ([a-f\d]{4}) ([a-f\d]{4}) ([a-f\d]{8})$/mg;

var DeviceInputEventReader = function (deviceId) {
  var capturer = this;

  this.deviceId = deviceId;
  console.log('IntputEventCapturer created', deviceId);

  var child = adbBridge.execAsync('shell getevent', deviceId);
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

DeviceInputEventReader.prototype.parseEventString = function (eventStr) {
  function hexToDez(hex) {
    return parseInt(hex, 16);
  }

  var match;
  while ((match = EVENT_STRING_REGEXP.exec(eventStr))) {
    var inputEvent = new InputEvent(Date.now(), match[1], match.slice(2, 5).map(hexToDez));
    this.onInputEvent(inputEvent);
  }
};

DeviceInputEventReader.prototype.pipe = function (inputEventWriter) {
  var lastSentEvent;

  this.onInputEvent = function (event) {
    if (lastSentEvent && lastSentEvent.equals(event)) return;
    lastSentEvent = event;

    console.log(this.deviceId, '\t>', event);
    inputEventWriter.send(event);
  };
};

DeviceInputEventReader.prototype.onError = function (error) {
  console.error('IntputEventCapturer error', error, this.deviceId);
};

DeviceInputEventReader.prototype.onInputEvent = function (event) {
  console.log('IntputEventCapturer inputEvent', event, this.deviceId);
};

module.exports = DeviceInputEventReader;
