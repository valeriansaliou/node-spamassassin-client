/*
 * spamassassin-client
 *
 * Copyright 2024, Valerian Saliou
 * Author: Valerian Saliou <valerian@valeriansaliou.name>
 */


"use strict";


var net = require("net");


/**
 * SpamAssassinClient
 * @class
 * @classdesc  Instanciates a new SpamAssassin client.
 * @param      {object} options
 */
var SpamAssassinClient = function(options) {
  // Sanitize options
  options = (options || {});

  if (typeof options !== "object") {
    throw new Error("Invalid options");
  }
  if (options.host !== undefined && typeof options.host !== "string") {
    throw new Error("Invalid options.host");
  }
  if (options.port !== undefined && typeof options.port !== "number") {
    throw new Error("Invalid options.port");
  }
  if (options.timeout !== undefined && typeof options.timeout !== "number") {
    throw new Error("Invalid options.timeout");
  }

  // Environment
  var hostDefault           = "127.0.0.1";
  var portDefault           = 783;
  var timeoutDefault        = 10;

  var secondsInMilliseconds = 1000;

  // Globals
  this.__protocolVersion  = 1.5;
  this.__protocolLineFeed = "\r\n";

  this.__regexLineHeader  = (
    /^SPAMD\/([0-9\.\-]+)\s([0-9]+)\s([0-9A-Z_]+)/
  );
  this.__regexLineSpam    = (
    /^Spam:\s(True|False|Yes|No)\s;\s(-?[0-9\.]+)\s\/\s(?:-?[0-9\.]+)/
  );

  // Storage space
  this.__options = {
    server : {
      host : (options.host    || hostDefault),
      port : (options.port    || portDefault)
    },

    connection : {
      timeout : (
        (options.timeout || timeoutDefault) * secondsInMilliseconds
      )
    }
  };
};


/**
 * SpamAssassinClient.prototype.check
 * @public
 * @param  {string} message
 * @return {object} Promise object
 */
SpamAssassinClient.prototype.check = function(message) {
  return this.__execute("check", message);
};


/**
 * SpamAssassinClient.prototype.__execute
 * @private
 * @param  {string} command
 * @param  {string} message
 * @return {object} Promise object
 */
SpamAssassinClient.prototype.__execute = function(command, message) {
  var self = this;

  return this.__command(command, message)
    .then(function(lines) {
      return self.__extract(command, lines);
    });
};


/**
 * SpamAssassinClient.prototype.__command
 * @private
 * @param  {string} command
 * @param  {string} message
 * @return {object} Promise object
 */
SpamAssassinClient.prototype.__command = function(command, message) {
  var self = this;

  return new Promise(function(resolve, reject) {
    // This is an implementation of The SpamAssassin Network Protocol (V1.5)
    // Reference: \
    //   https://svn.apache.org/repos/asf/spamassassin/trunk/spamd/PROTOCOL

    // Initialize local variables
    var responseData = [],
        linesBuffer  = "",
        fullfilled   = false;

    // Setup local client
    var client = new net.Socket();

    client.setTimeout(self.__options.connection.timeout);

    // Construct all local event handler functions
    // Notice: this is done for traceability reasons, as we would prefer \
    //   those functions to be named when debugging stack traces.
    var fnHandleConnect = function() {
      // Emit command header and message
      var payload = (
        command.toUpperCase() + " SPAMC/" + self.__protocolVersion  +
          self.__protocolLineFeed
      );

      if (typeof message === "string") {
        // Make sure to trim message, in the event it is terminated by a line \
        //   feed, it might result in a 'Content-length mismatch' error from \
        //   the server.
        var messageClean = (message.trim() + self.__protocolLineFeed);

        payload += (
          "Content-length: " + Buffer.byteLength(messageClean)  +
            self.__protocolLineFeed
        );

        payload += self.__protocolLineFeed;
        payload += messageClean;
      }

      // Write payload on client stream
      client.write(payload);
    };

    var fnHandleTimeout = function() {
      if (fullfilled === false) {
        fullfilled = true;

        reject(
          new Error("Connection timed out")
        );
      }
    };

    var fnHandleError = function(error) {
      if (fullfilled === false) {
        fullfilled = true;

        // Drain buffer and terminate it
        linesBuffer = self.__drainLinesBuffer(linesBuffer, responseData, true);

        // Got some response data? Treat as success; we may have enough data
        // Notice: only handle if we received more than response headers.
        if (responseData.length > 1) {
          resolve(responseData);
        } else {
          reject(
            new Error("Got error from server: " + error.toString())
          );
        }
      }
    };

    var fnHandleData = function(data) {
      // Append current data chunk
      linesBuffer += data.toString();

      // Drain buffer
      linesBuffer = self.__drainLinesBuffer(linesBuffer, responseData);
    };

    var fnHandleClose = function() {
      if (fullfilled === false) {
        fullfilled = true;

        // Drain buffer and terminate it
        linesBuffer = self.__drainLinesBuffer(linesBuffer, responseData, true);

        resolve(responseData);
      }
    };

    // Connect to SpamAssassin server
    client.connect({
      port : self.__options.server.port,
      host : self.__options.server.host
    });

    // Bind all event listeners
    client.on("connect", fnHandleConnect);
    client.on("timeout", fnHandleTimeout);
    client.on("error", fnHandleError);
    client.on("data", fnHandleData);
    client.on("close", fnHandleClose);
  });
};


/**
 * SpamAssassinClient.prototype.__extract
 * @private
 * @param  {string} command
 * @param  {object} lines
 * @return {object} Promise object
 */
SpamAssassinClient.prototype.__extract = function(command, lines) {
  // Parse header (initialize result)
  var result = this.__extractHeader(lines);

  // Extract command result? (extractors might throw if server answers \
  //   unhandled data)
  var fnExtractor = this["__extractCommand_$" + command];

  if (typeof fnExtractor === "function") {
    fnExtractor.bind(this)(result, lines);
  }

  return Promise.resolve(result);
};


/**
 * SpamAssassinClient.prototype.__extractHeader
 * @private
 * @param  {object} lines
 * @return {object} Result data
 */
SpamAssassinClient.prototype.__extractHeader = function(lines) {
  var result = {};

  // Extract protocol header
  var line  = (lines[0] || ""),
      match = line.match(this.__regexLineHeader);

  if (!match) {
    throw new Error(
      "(header) Unrecognized protocol:\n\n"  +
        lines.join(this.__protocolLineFeed)
    );
  }

  result.code    = parseInt(match[2], 10);
  result.message = (match[3] || "");

  // Assert that header is valid
  if (isNaN(result.code) === true) {
    throw new Error(
      "(header) Invalid response code:\n\n"  +
        lines.join(this.__protocolLineFeed)
    );
  }

  return result;
};


/**
 * SpamAssassinClient.prototype.__extractCommand_$check
 * @private
 * @param  {object} result
 * @param  {object} lines
 * @return {undefined}
 */
SpamAssassinClient.prototype.__extractCommand_$check = function(result, lines) {
  // Extract protocol check response
  // Notice: start at the second line, since the first line (ie. the header) \
  //   has already been extracted.
  for (var i = 1; i < lines.length; i++) {
    var line = lines[i];

    if (line.startsWith("Spam:") === true) {
      var match = line.match(this.__regexLineSpam);

      if (match) {
        result.spam  = (
          (match[1] === "True" || match[1] === "Yes") ? true : false
        );

        result.score = parseFloat(match[2]);

        // Stop there (match found)
        break;
      }
    }
  }

  // Assert that response is valid
  if (result.spam === undefined || result.score === undefined  ||
        isNaN(result.score) === true) {
    throw new Error(
      "($check) Got invalid spam score or status:\n\n"  +
        lines.join(this.__protocolLineFeed)
    );
  }
};


/**
 * SpamAssassinClient.prototype.__drainLinesBuffer
 * @private
 * @param  {string}  buffer
 * @param  {object}  lines
 * @param  {boolean} [terminate]
 * @return {string}  Remainder buffer
 */
SpamAssassinClient.prototype.__drainLinesBuffer = function(
  buffer, lines, terminate
) {
  // Apply defaults
  terminate = (terminate || false);

  // Acquire buffer lines
  var bufferLines = buffer.split(this.__protocolLineFeed);

  // The last buffer line might be unterminated (do not retain it)
  var lastBufferLine = (bufferLines.pop() || "");

  // Append terminated buffer lines to final lines
  for (var i = 0; i < bufferLines.length; i++) {
    var bufferLineClean = bufferLines[i].trim();

    if (bufferLineClean) {
      lines.push(bufferLineClean);
    }
  }

  // Terminate buffer? (append last buffer line)
  if (terminate === true) {
    var lastBufferLineClean = lastBufferLine.trim();

    if (lastBufferLineClean) {
      lines.push(lastBufferLineClean);
    }

    return "";
  }

  // Return remaining buffer
  return lastBufferLine;
};


exports.SpamAssassinClient = SpamAssassinClient;
