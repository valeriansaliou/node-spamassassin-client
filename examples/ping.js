/*
 * spamassassin-client
 *
 * Copyright 2024, Valerian Saliou
 * Author: Valerian Saliou <valerian@valeriansaliou.name>
 */


"use strict";


var SpamAssassinClient = require("../").SpamAssassinClient;


// Create the SpamAssassin client
var spamAssassin = new SpamAssassinClient({
  host    : "127.0.0.1",
  port    : 783,
  timeout : 3
});


// Check for SpamAssassin connection health
spamAssassin.ping()
  .then(function(result) {
    // Handle result
    console.info("Checked for health:", result);
  })
  .catch(function(error) {
    // Handle errors
    console.error("Could not check for health:", error);
  });
