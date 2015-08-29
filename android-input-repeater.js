"use strict";

var pjson = require('./package.json');
var child_process = require('child_process');
var ArgumentParser = require('argparse').ArgumentParser;
var IntputEventCapturer = require('./IntputEventCapturer');

var NEWLINE_REGEXP = /[\r|\n]+/;
var DEVICE_ID_REGEXP = /^[a-zA-Z0-9]{5,}/;
var ADB_PATH = 'adb';

var args = new ArgumentParser({
  version: pjson.version,
  addHelp: true,
  description: pjson.description,
  epilog: 'Example usage: node android-input-repeater.js"'
});

var params = args.parseArgs();
var devices = getDeviceIds();
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
    processes[deviceId] = getShellProcess(deviceId);
  });
  return processes;
}

function getShellProcess(deviceId) {
  var command = ADB_PATH + ' -s ' + deviceId + ' shell';
  var shellProcess = spawn(command);
  shellProcess.stdin.setEncoding('utf-8');
  return shellProcess;
}

function sendEvent(shellProcess, event) {
  var command = "sendevent /dev/input/event" + event.type + " " + event.params.join(" ") + '\n';
  shellProcess.stdin.write(command);
}

function spawn(command) {
  // TODO: this only works on windows machines, fix later
  return child_process.spawn('cmd', ['/c', command], {env: process.env});
}

/**
 * @return array of device ids of connected android devices,
 *  empty when no device is connected
 */
function getDeviceIds() {
  // get devices list from adb
  var devices = child_process.execSync(ADB_PATH + ' devices').toString();
  devices = devices.split(NEWLINE_REGEXP);

  // delete all metadata
  devices = devices.filter(function (line, index) {
    if (index === 0 || line === "") {
      return false;
    }

    if (line.match(DEVICE_ID_REGEXP) === null) {
      console.error(line.split(/\s+/)[0] + ' is no valid device id');
      return false;
    } else {
      return true;
    }
  });

  // we only need device ids
  return devices.map(function (line) {
    return line.match(DEVICE_ID_REGEXP)[0];
  });
}
