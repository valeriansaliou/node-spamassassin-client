/*
 * spamassassin-client
 *
 * Copyright 2024, Valerian Saliou
 * Author: Valerian Saliou <valerian@valeriansaliou.name>
 */


"use strict";


var SpamAssassinClient = require("../").SpamAssassinClient;

var assert = require("assert");


describe("node-spamassassin-client", function() {
  describe("constructor", function() {
    it("should succeed creating an instance with no options", function() {
      assert.doesNotThrow(
        function() {
          new SpamAssassinClient();
        },

        "SpamAssassinClient should not throw on no options"
      );
    });

    it("should succeed creating an instance with empty options", function() {
      assert.doesNotThrow(
        function() {
          new SpamAssassinClient({});
        },

        "SpamAssassinClient should not throw on empty options"
      );
    });

    it("should succeed creating an instance with valid options", function() {
      assert.doesNotThrow(
        function() {
          new SpamAssassinClient({
            host    : "127.0.0.1",
            port    : 783,
            timeout : 10
          });
        },

        "SpamAssassinClient should not throw on valid options"
      );
    });

    it("should fail creating an instance with invalid host", function() {
      assert.throws(
        function() {
          new SpamAssassinClient({
            host : 1
          });
        },

        "SpamAssassinClient should throw on invalid host"
      );
    });

    it("should fail creating an instance with invalid port", function() {
      assert.throws(
        function() {
          new SpamAssassinClient({
            port : "---"
          });
        },

        "SpamAssassinClient should throw on invalid port"
      );
    });

    it("should fail creating an instance with invalid timeout", function() {
      assert.throws(
        function() {
          new SpamAssassinClient({
            timeout : "zero"
          });
        },

        "SpamAssassinClient should throw on invalid timeout"
      );
    });
  });

  describe("check method", function() {
    it("should return a promise from check", function() {
      var spamAssassin = new SpamAssassinClient();

      assert(
        (spamAssassin.check("<message here>") instanceof Promise),
        "Check should be called"
      );
    });
  });
});
