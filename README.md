[![Dependency Status](https://gemnasium.com/cemrich/android-input-repeater.svg)](https://gemnasium.com/cemrich/android-input-repeater)

# Android Input Repeater
Utitlity for capturing and mirroring low level input events for android devices of the same type.

## Warning:
This is a research project using the adb commands ```adb shell getevent``` and ```adb shell sendevent```. There are serious timing issues using this commands so this tool will probably **not work correctly**.

## Prerequisites
1. [node.js](https://nodejs.org/) - test if nodejs is installed properly by executing ```node -v```
1. [adb](https://developer.android.com/sdk/installing/index.html?pkg=tools) - test if adb is installed properly by executing ```adb devices```

## Building
Run ```npm install``` to install dependencies.

## Usage
```
usage: android-input-repeater.js [-h] [-v] {mirror,record,replay} ...

Utitlity for capturing and mirroring low level input events for android
devices of the same type. ADB needs to be in your path.

Optional arguments:
  -h, --help            Show this help message and exit.
  -v, --version         Show program's version number and exit.

subcommands:
  {mirror,record,replay}

Example usage: "node android-input-repeater.js record myRecord.txt"
```
### mirror
```
usage: android-input-repeater.js mirror [-h]

Mirrors input events of all connected android devices to the other connected
ones. Please make sure to have at least two devices connected. In order to
mirror all events correctly all connected devices need to be of the same type
and need to have the same drivers installed, otherwise weird things could
happen.

Optional arguments:
  -h, --help  Show this help message and exit.
```

### record
```
usage: android-input-repeater.js record [-h] outfile

Records all input events of a connected android device into the given file.
This can be used later on to playback these input events on the same device
or another one of the same type and with the same drivers.

Positional arguments:
  outfile     Path of the file where the input events should be saved.

Optional arguments:
  -h, --help  Show this help message and exit.
```

### replay
```
usage: android-input-repeater.js replay [-h] infile

Replays the input events saved inside the given file on all connected devices.
In order to mirror all events correctly all connected devices need to be of
the same type as the one that captured the events in the first place and need
to have the same drivers installed, otherwise weird things could happen.

Positional arguments:
  infile      Path of the file where the input events have been saved.

Optional arguments:
  -h, --help  Show this help message and exit.
```
