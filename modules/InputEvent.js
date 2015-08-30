"use strict";

var InputEvent = function (time, type, params) {
  this.time = time;
  this.type = type;
  this.params = params;
};

InputEvent.prototype.equals = function (other) {
  return other &&
    other.type === this.type &&
    other.params[0] === this.params[0] &&
    other.params[1] === this.params[1] &&
    other.params[2] === this.params[2];
};

InputEvent.prototype.serialize = function () {
  return [this.time, this.type].concat(this.params).join(',');
};

InputEvent.deserialize = function (serialized) {
  var elements = serialized.split(',');
  return new InputEvent(elements[0], elements[1], elements.slice(2, 5));
};

module.exports = InputEvent;
