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
  var targetSenderMap = getTargetSenderMap(devices);
  devices.forEach(function (deviceId) {
    mirrorInputEvents(deviceId, targetSenderMap);
  });
}

function mirrorInputEvents(sourceDeviceId, targetSenderMap) {
  var inputCapturer = new InputEventCapturer(sourceDeviceId);

  Object.keys(targetSenderMap).forEach(function (targetDeviceId) {
    if (targetDeviceId === sourceDeviceId) return;
    inputCapturer.pipe(targetSenderMap[targetDeviceId]);
  });
}

function getTargetSenderMap(deviceIds) {
  var senderMap = {};
  deviceIds.forEach(function (deviceId) {
    senderMap[deviceId] = new InputEventSender(deviceId);
  });
  return senderMap;
}
