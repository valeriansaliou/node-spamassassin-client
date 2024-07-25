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
  timeout : 3
});


// Define your email there (EML format)
var message = `
From: Valerian Saliou <valerian@valeriansaliou.name>
Content-Type: text/plain;
  charset=us-ascii
Content-Transfer-Encoding: 7bit
Mime-Version: 1.0 (Mac OS X Mail 16.0 \(3774.600.62\))
Subject: Hey there!
X-Universally-Unique-Identifier: 84347FA5-4E37-4736-A58C-58FDECFFEBC5
Message-Id: <B76B9F0C-F893-4EA3-BA98-5A7942B4D79D@valeriansaliou.name>
Date: Thu, 25 Jul 2024 12:30:53 +0200
To: valerian+test@valeriansaliou.name

Is this spam? :)
`;


// Check if email is spam
spamAssassin.check(message)
  .then(function(result) {
    // Handle result
    console.info("Checked for spam:", result);
  })
  .catch(function(error) {
    // Handle errors
    console.error("Could not check for spam:", error);
  });
