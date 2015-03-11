'use strict';

/*
 * We will discard connections on port 2828 as those are the ones that Marionette uses
 * For more info: https://developer.mozilla.org/en-US/docs/Marionette_Test_Runner
 */

var MARIONETTE_PORT = 2828;

function parserDarwin(lines, search) {
  var ports = [];
  // Example syntax:
  // b2g-bin   25779 mozilla   21u  IPv4 0xbbcbf2cee7ddc2a7      0t0  TCP 127.0.0.1:8000 (LISTEN)
  var regex = new RegExp(
    '^(' + search.join('|') +
    ')(?:-bin)?[\\ ]+([0-9]+).*[0-9]+\\.[0-9]+\\.[0-9]+\\.[0-9]+:([0-9]+)'
  );

  lines.forEach(function(line) {
    var matches = regex.exec(line);
    var pid = matches ? Number(matches[2]) : null;
    var port = matches ? Number(matches[3]) : null;

    if (port && port !== MARIONETTE_PORT) {
      ports.push({ type: matches[1], port: port, pid: pid });
    }
  });
  return ports;
}

function parserLinux(lines, search) {
  var ports = [];
  // Example syntax:
  // tcp        0      0 127.0.0.1:6000          0.0.0.0:*              LISTEN      3718/firefox
  var regex = new RegExp(
    'tcp.*[0-9]+\\.[0-9]+\\.[0-9]+\\.[0-9]+:([0-9]+).*LISTEN[\\ ]+([0-9]+)\\/(' +
    search.join('|') + ')(?:-bin)?'
  );

  lines.forEach(function(line) {
    var matches = regex.exec(line);
    var pid = matches ? Number(matches[2]) : null;
    var port = matches ? Number(matches[1]) : null;

    if (port && port !== MARIONETTE_PORT) {
      ports.push({ type: matches[3], port: port, pid: pid });
    }
  });
  return ports;
}

function parserWin32(lines, search) {
  var ports = [];
  if (!isNonEmptyArray(lines)) {
    return [];
  }

  var tasklistLines = lines[0];
  if (!isNonEmptyArray(tasklistLines)) {
    return [];
  }

  var netstatLines = lines[1];
  if (!isNonEmptyArray(netstatLines)) {
    return [];
  }

  // Example tasklist syntax:
  // b2g-bin.exe                  16180 RDP-Tcp#2                  1    129,560 K
  var pidMap = {};
  var tasklistRegex = new RegExp(
    '^(' + search.join('|') + ')(?:-bin)?\\.exe\\s+([\\d]+)'
  );

  // Build a process name to pid map from tasklist
  tasklistLines.forEach(function(line) {
    var matches = tasklistRegex.exec(line);
    if (matches) {
      pidMap[matches[2]] = matches[1];
    }
  });

  // Example netstat syntax:
  //   TCP    127.0.0.1:2828         0.0.0.0:0              LISTENING       16180
  //   TCP    127.0.0.1:61291        0.0.0.0:0              LISTENING       16180
  var netstatRegex = new RegExp(
    '^\\s+TCP\\s+\\d+\\.\\d+\\.\\d+\\.\\d+:(\\d+)\\s+' +
    '\\d+\\.\\d+\\.\\d+\\.\\d+:\\d+\\s+LISTENING\\s+(\\d+)'
  );

  // Scrape out the listening ports from netstat that match pid map
  netstatLines.forEach(function(line) {
    var matches = netstatRegex.exec(line);
    if (matches) {
      var port = Number(matches[1]);
      var pid = Number(matches[2]);
      var type = pidMap[pid];
      if (type && port && port !== MARIONETTE_PORT) {
        ports.push({ type: pidMap[pid], port: port, pid: pid });
      }
    }
  });

  return ports;
}

function isNonEmptyArray(val) {
  return Array.isArray(val) && val.length > 0;
}

module.exports = {
  darwin: parserDarwin,
  linux: parserLinux,
  win32: parserWin32
};
