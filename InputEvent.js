"use strict";

var InputEvent = function (type, params) {
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

module.exports = InputEvent;
