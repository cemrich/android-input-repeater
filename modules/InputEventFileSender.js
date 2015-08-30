"use strict";

var fs = require('fs');
var InputEvent = require('./InputEvent');

var InputEventFileSender = function (filePath) {
  this.filePath = filePath;
  this.outStream = fs.createWriteStream(filePath);
};

InputEventFileSender.prototype.send = function (event) {
    console.log(this.filePath, '\t<', event);
    this.outStream.write(event.serialize() + '\n');
};

module.exports = InputEventFileSender;
