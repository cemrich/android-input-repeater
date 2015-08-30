"use strict";

var lineReader = require('line-reader');
var readline = require('readline');
var InputEvent = require('./InputEvent');

var FileInputEventReader = function (filePath) {
  this.filePath = filePath;
};

FileInputEventReader.prototype.start = function () {
  var startTime = null;
  lineReader.eachLine(this.filePath, function(line, last) {
    var event = InputEvent.deserialize(line);

    // save timestamp af first event
    if (startTime === null) startTime = event.time;

    // delay events
    var delay = event.time - startTime;
    setTimeout(function () {
      this.onInputEvent(event);
    }.bind(this), delay);
  }.bind(this));
};

FileInputEventReader.prototype.pipe = function (inputEventWriter) {
  this.onInputEvent = function (event) {
    console.log(this.filePath, '\t>', event);
    inputEventWriter.send(event);
  };
};

FileInputEventReader.prototype.onError = function (error) {
  console.error('FileInputEventReader error', error, this.deviceId);
};

FileInputEventReader.prototype.onInputEvent = function (event) {
  console.log('FileInputEventReader inputEvent', event, this.deviceId);
};

module.exports = FileInputEventReader;
