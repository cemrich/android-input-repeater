"use strict";

var pjson = require('./package.json');
var ArgumentParser = require('argparse').ArgumentParser;
var InputEventCapturer = require('./modules/InputEventCapturer');
var InputEventSender = require('./modules/InputEventSender');
var DeviceDetector = require('./modules/DeviceDetector');
var adbBridge = require('./modules/adbBridge');

var args = new ArgumentParser({
  version: pjson.version,
  addHelp: true,
  description: pjson.description,
  epilog: 'Example usage: node android-input-repeater.js"'
});

var params = args.parseArgs();
var devices = new DeviceDetector().devices;
console.log("Devices detected:", devices);

if (devices.length < 2) {
  console.error("There has to be more than one connected android device.");
} else {
  var senderMap = getSenderMap(devices);
  devices.forEach(function (deviceId) {
    mirrorInputEvents(deviceId, senderMap);
  });
}

function mirrorInputEvents(sourceDeviceId, targetMap) {
  var lastSentEvent;
  var inputCapturer = new InputEventCapturer(sourceDeviceId);
  var targetDevices = Object.keys(targetMap).filter(function (targetDeviceId) {
    return targetDeviceId !== sourceDeviceId;
  });

  inputCapturer.onInputEvent = function (event) {
    if (event.equals(lastSentEvent)) return;

    console.log(sourceDeviceId, event);
    lastSentEvent = event;

    targetDevices.forEach(function (targetDeviceId) {
      senderMap[targetDeviceId].send(event);
    });
  };
}

function getSenderMap(deviceIds) {
  var senderMap = {};
  deviceIds.forEach(function (deviceId) {
    senderMap[deviceId] = new InputEventSender(deviceId);
  });
  return senderMap;
}
