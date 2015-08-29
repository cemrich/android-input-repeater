"use strict";

var pjson = require('./package.json');
var child_process = require('child_process');
var ArgumentParser = require('argparse').ArgumentParser;

var NEWLINE_REGEXP = /[\r|\n]+/;
var DEVICE_ID_REGEXP = /^[a-zA-Z0-9]{5,}/;
var EVENT_STRING_REGEXP = /^\/dev\/input\/event(\d): (\d{4}) (\d{4}) (\d{8})$/mg;
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
  getInputEvents(sourceDeviceId, function (event) {
    console.log(count++, sourceDeviceId, event);
    if (isEqual(event, lastSentEvent)) return;
    lastSentEvent = event;
    Object.keys(targetShellProcesses).forEach(function (targetDeviceId) {
      if (targetDeviceId !== sourceDeviceId) {
        sendEvent(targetShellProcesses[targetDeviceId], event);
      }
    });
  }, function (error) {
      console.error(error);
  });
}

function isEqual(event1, event2) {
  return event1 && event2 &&
    event1.type === event2.type &&
    event1.params[0] === event2.params[0] &&
    event1.params[1] === event2.params[1] &&
    event1.params[2] === event2.params[2];
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

function getInputEvents(deviceId, onEvent, onError) {
  var command = ADB_PATH + ' -s ' + deviceId + ' shell getevent';
  var child = spawn(command);
  child.stdout.on('data', function (data) {
    var eventStr = data.toString();
    parseEventString(eventStr, onEvent);
  });
  child.stdout.on('error', function (error) {
    onError(error);
  });
  child.stdout.on('end', function (error) {
    onError(error);
  });
  child.stdout.on('close', function (error) {
    onError(error);
  });
  child.stderr.on('data', function (data) {
    onError(data.toString());
  });
}

function parseEventString(eventStr, onEvent) {
  var match;
  var eventObj = {};
  while (match = EVENT_STRING_REGEXP.exec(eventStr)) {
    eventObj.type = match[1];
    eventObj.params = match.slice(2, 5).map(function (hex) { return parseInt(hex, 16) });
    onEvent(eventObj);
  }
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
