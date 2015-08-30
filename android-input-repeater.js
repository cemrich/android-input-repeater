"use strict";

var pjson = require('./package.json');
var ArgumentParser = require('argparse').ArgumentParser;
var DeviceInputEventReader = require('./modules/DeviceInputEventReader');
var DeviceInputEventWriter = require('./modules/DeviceInputEventWriter');
var FileInputEventReader = require('./modules/FileInputEventReader');
var FileInputEventWriter = require('./modules/FileInputEventWriter');
var DeviceDetector = require('./modules/DeviceDetector');
var adbBridge = require('./modules/adbBridge');

var argsParser = new ArgumentParser({
  version: pjson.version,
  addHelp: true,
  description: pjson.description,
  epilog: 'Example usage: "node android-input-repeater.js record -f myRecord.txt"'
});

var subpParsers = argsParser.addSubparsers({
  title: 'subcommands',
  dest: 'subcommand'
});

var mirrorParser = subpParsers.addParser(
  'mirror', {
  title: 'mirror',
  addHelp: true,
  description: 'Mirrors input events of all connected android devices to the other connected ones. ' +
    'Please make sure to have at least two devices connected. In order to mirror all events correctly ' +
    'all connected devices need to be of the same type and need to have the same drivers installed, ' +
    'otherwise weird things could happen.'
});

var recordParser = subpParsers.addParser(
  'record', {
  title: 'record',
  addHelp: true,
  description: 'Records all input events of a connected android device into the given file. ' +
    'This can be used later on to playback these input events on the same device or another ' +
    'one of the same type and with the same drivers.'
});
recordParser.addArgument(
  [ 'outfile' ], {
    help: 'Path of the file where the input events should be saved.'
  }
);

var replayParser = subpParsers.addParser(
  'replay', {
  title: 'replay',
  addHelp: true,
  description: 'Replays the input events saved inside the given file on all connected ' +
    'devices. In order to mirror all events correctly all connected devices need to be ' +
    'of the same type as the one that captured the events in the first place and need ' +
    'to have the same drivers installed, otherwise weird things could happen.'
});
replayParser.addArgument(
  [ 'infile' ], {
    help: 'Path of the file where the input events have been saved.'
  }
);

var params = argsParser.parseArgs();
switch (params.subcommand) {
  case 'mirror':
    mirror();
    break;
  case 'record':
    record(params.outfile);
    break;
  case 'replay':
    replay(params.infile);
    break;
  default:
    break;
}

function record(filePath) {
  console.log('record', filePath);

  var devices = new DeviceDetector().devices;
  if (devices.length !== 1) {
    console.error("There has to be exactly one connected android device.");
    return;
  }

  var deviceReader = new DeviceInputEventReader(devices[0]);
  var fileWriter = new FileInputEventWriter(filePath);
  deviceReader.pipe(fileWriter);
}

function replay(filePath) {
  console.log('replay', filePath);

  var devices = new DeviceDetector().devices;
  if (devices.length !== 1) {
    console.error("There has to be exactly one connected android device.");
    return;
  }

  var fileReader = new FileInputEventReader(filePath);
  var deviceWriter = new DeviceInputEventWriter(devices[0]);
  fileReader.pipe(deviceWriter);
}

function mirror() {
  console.log('mirror input events');
  var devices = new DeviceDetector().devices;

  if (devices.length < 2) {
    console.error("There has to be more than one connected android device.");
    return;
  }

  var deviceWriterMap = getDeviceWriterMap(devices);
  devices.forEach(function (deviceId) {
    mirrorInputEvents(deviceId, deviceWriterMap);
  });
}

function mirrorInputEvents(sourceDeviceId, deviceWriterMap) {
  var inputReader = new DeviceInputEventReader(sourceDeviceId);

  Object.keys(deviceWriterMap).forEach(function (targetDeviceId) {
    if (targetDeviceId === sourceDeviceId) return;
    inputReader.pipe(deviceWriterMap[targetDeviceId]);
  });
}

function getDeviceWriterMap(deviceIds) {
  var writerMap = {};
  deviceIds.forEach(function (deviceId) {
    writerMap[deviceId] = new DeviceInputEventWriter(deviceId);
  });
  return writerMap;
}
