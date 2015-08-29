"use strict";

var adbBridge = require('./adbBridge');

var DEVICE_ID_REGEXP = /^[a-zA-Z0-9]{5,}/;
var NEWLINE_REGEXP = /[\r|\n]+/;

var DeviceDetector = function () {
  this.devices = getDeviceIds();
};

/**
 * @return array of device ids of connected android devices,
 *  empty when no device is connected
 */
function getDeviceIds() {
  // get devices list from adb
  var devices = adbBridge.execSync('devices');
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

module.exports = DeviceDetector;
