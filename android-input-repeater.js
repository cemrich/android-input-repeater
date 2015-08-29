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
  getInputEvents(devices[0], function (event) {
      console.log(event);
  });
}

function getInputEvents(deviceId, onEvent) {
  var command = ADB_PATH + ' -s ' + deviceId + ' shell getevent';
  var child = child_process.exec(command);
  child.stdout.on('data', function (data) {
    var eventStr = data.toString();
    parseEventString(eventStr, onEvent);
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
