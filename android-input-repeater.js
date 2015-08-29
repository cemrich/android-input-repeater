"use strict";

var pjson = require('./package.json');
var ArgumentParser = require('argparse').ArgumentParser;
var IntputEventCapturer = require('./IntputEventCapturer');
var DeviceDetector = require('./DeviceDetector');
var adbBridge = require('./adbBridge');

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
  var shellProcesses = getShellProcesses(devices);
  devices.forEach(function (deviceId) {
    mirrorInputEvents(deviceId, shellProcesses);
  });
}

function mirrorInputEvents(sourceDeviceId, targetShellProcesses) {
  var lastSentEvent;
  var count = 0;
  var inputCapturer = new IntputEventCapturer(sourceDeviceId);
  inputCapturer.onInputEvent = function (event) {
    console.log(count++, sourceDeviceId, event);
    if (event.equals(lastSentEvent)) return;
    lastSentEvent = event;
    Object.keys(targetShellProcesses).forEach(function (targetDeviceId) {
      if (targetDeviceId !== sourceDeviceId) {
        sendEvent(targetShellProcesses[targetDeviceId], event);
      }
    });
  };
}

function getShellProcesses(deviceIds) {
  var processes = {};
  deviceIds.forEach(function (deviceId) {
    processes[deviceId] = adbBridge.execAsync('shell', deviceId);
  });
  return processes;
}

function sendEvent(shellProcess, event) {
  var command = "sendevent /dev/input/event" + event.type + " " + event.params.join(" ") + '\n';
  shellProcess.stdin.write(command);
}
