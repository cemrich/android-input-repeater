"use strict";

var lineReader = require('line-reader');
var readline = require('readline');
var InputEvent = require('./InputEvent');

var FileInputEventReader = function (filePath) {
  this.filePath = filePath;
};

FileInputEventReader.prototype.start = function () {
  lineReader.eachLine(this.filePath, function(line, last) {
    var event = InputEvent.deserialize(line);
    this.onInputEvent(event);
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
